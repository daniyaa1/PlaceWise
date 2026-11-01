/**
 * PlaceWise Career Path Intelligence Engine (CPIE)
 * Module: Skill-Gap Impact Analyzer
 * 
 * Aggregates missing desirable skills across all currently ELIGIBLE opportunities for a student.
 * Explains market impact without claiming hiring guarantees.
 */

import { evaluateSkillCompatibility } from './skillCompatibility.js';

export function analyzeSkillGaps({ student, eligibleDrives = [] }) {
  const gapMap = new Map();

  for (const drive of eligibleDrives) {
    const analysis = evaluateSkillCompatibility({
      studentSkills: student.skills || [],
      jobSkills: drive.skills || []
    });

    for (const missingSkill of analysis.missingDesirable) {
      if (!gapMap.has(missingSkill)) {
        gapMap.set(missingSkill, {
          skillName: missingSkill,
          frequency: 0,
          drives: []
        });
      }

      const entry = gapMap.get(missingSkill);
      entry.frequency += 1;
      entry.drives.push({
        id: drive.id,
        title: drive.title,
        companyName: drive.company_name
      });
    }
  }

  // Sort by frequency descending
  const rankedGaps = Array.from(gapMap.values()).sort((a, b) => b.frequency - a.frequency);

  return {
    totalEligibleOpportunitiesAnalyzed: eligibleDrives.length,
    distinctMissingSkillsCount: rankedGaps.length,
    gaps: rankedGaps,
    disclaimer: 'This skill-gap analysis is an opportunity-impact indicator based on currently active, eligible opportunities. It highlights skills that could expand your profile competitiveness, not a guarantee of employment.'
  };
}
