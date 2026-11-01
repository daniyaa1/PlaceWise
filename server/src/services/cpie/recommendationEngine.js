/**
 * PlaceWise Career Path Intelligence Engine (CPIE)
 * Module: Explainable Recommendation Engine
 * 
 * Computes recommendation score: Score = 0.40P + 0.35K + 0.15W + 0.10L
 * Ineligible opportunities are NEVER recommended.
 * Generates transparent, human-readable explanations.
 */

import { calculatePreferenceScore, isWithinPreference } from './preferenceMatcher.js';
import { evaluateSkillCompatibility } from './skillCompatibility.js';

export function calculateWorkModeScore(studentWorkMode, driveWorkMode) {
  const sMode = (studentWorkMode || 'OPEN').toUpperCase();
  const dMode = (driveWorkMode || 'IN_OFFICE').toUpperCase();

  if (sMode === 'OPEN' || sMode === dMode) return 100;
  if (dMode === 'HYBRID' || sMode === 'HYBRID') return 80;
  return 40;
}

export function calculateLocationScore(studentLocations = [], driveLocation, driveWorkMode) {
  if ((driveWorkMode || '').toUpperCase() === 'REMOTE') return 100;
  if (!studentLocations || studentLocations.length === 0) return 80;

  const loc = (driveLocation || '').toLowerCase();
  const matches = studentLocations.some(pref => {
    const p = pref.toLowerCase().trim();
    return p === 'remote' || loc.includes(p) || p.includes(loc.split(',')[0].trim());
  });

  return matches ? 100 : 50;
}

export function rankRecommendation({
  student,
  drive,
  eligibilityResult,
  weights = {}
}) {
  const wP = weights.preference ?? parseFloat(process.env.WEIGHT_PREFERENCE || '0.40');
  const wK = weights.skills ?? parseFloat(process.env.WEIGHT_SKILLS || '0.35');
  const wW = weights.workMode ?? parseFloat(process.env.WEIGHT_WORK_MODE || '0.15');
  const wL = weights.location ?? parseFloat(process.env.WEIGHT_LOCATION || '0.10');

  // If student is not eligible, score is 0 and cannot be recommended
  if (eligibilityResult.status !== 'ELIGIBLE') {
    return {
      score: 0,
      preferenceScore: 0,
      skillScore: 0,
      workModeScore: 0,
      locationScore: 0,
      isRecommended: false,
      section: 'INELIGIBLE',
      explanation: eligibilityResult.explanation,
      skillAnalysis: null
    };
  }

  // 1. Preference Score (P)
  const pScore = calculatePreferenceScore(student.preference_mode, drive.preference_group);

  // 2. Skill Score (K)
  const skillAnalysis = evaluateSkillCompatibility({
    studentSkills: student.skills || [],
    jobSkills: drive.skills || []
  });
  const kScore = skillAnalysis.score;

  // 3. Work Mode Score (W)
  const wScore = calculateWorkModeScore(student.preferred_work_mode, drive.work_mode);

  // 4. Location Score (L)
  let studentLocs = [];
  try {
    studentLocs = Array.isArray(student.preferred_locations)
      ? student.preferred_locations
      : JSON.parse(student.preferred_locations || '[]');
  } catch {
    studentLocs = [];
  }
  const lScore = calculateLocationScore(studentLocs, drive.location, drive.work_mode);

  // Total Score [0, 100]
  const totalScore = Math.round(
    wP * pScore + wK * kScore + wW * wScore + wL * lScore
  );

  // Partition into Section A (Recommended) vs Section B (Explore Other)
  const matchesPref = isWithinPreference(student.preference_mode, drive.preference_group);
  const section = matchesPref ? 'RECOMMENDED' : 'EXPLORE_OTHER';

  // Construct explainable recommendation justification
  const modeLabel = (student.preference_mode || 'Open to all').toLowerCase().replace('_', ' ');
  const totalSkills = skillAnalysis.totalRoleSkills;
  const matchedSkills = skillAnalysis.totalMatched;

  let explanation = '';
  if (matchesPref) {
    explanation = `Recommended (${totalScore}/100) because you selected ${modeLabel} roles, match ${matchedSkills} of ${totalSkills} listed skills, and satisfy all mandatory academic requirements.`;
  } else {
    explanation = `Available in Explore (${totalScore}/100): You satisfy all academic requirements, though this ${drive.preference_group.toLowerCase().replace('_', ' ')} role is outside your primary ${modeLabel} preference.`;
  }

  return {
    score: totalScore,
    preferenceScore: pScore,
    skillScore: kScore,
    workModeScore: wScore,
    locationScore: lScore,
    isRecommended: matchesPref,
    section,
    explanation,
    skillAnalysis
  };
}

