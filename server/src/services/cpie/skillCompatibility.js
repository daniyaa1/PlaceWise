/**
 * PlaceWise Career Path Intelligence Engine (CPIE)
 * Module: Skill Compatibility Service
 * 
 * Evaluates student skill overlap with role requirements.
 * Differentiates mandatory vs desirable skills.
 * Missing desirable skills NEVER penalize eligibility.
 */

export function evaluateSkillCompatibility({ studentSkills = [], jobSkills = [] }) {
  const studentSkillSet = new Set(
    studentSkills.map(s => (typeof s === 'string' ? s : s.name).toLowerCase().trim())
  );

  const mandatoryRoleSkills = jobSkills.filter(s => s.is_mandatory);
  const desirableRoleSkills = jobSkills.filter(s => !s.is_mandatory);

  const matchedMandatory = [];
  const missingMandatory = [];
  for (const s of mandatoryRoleSkills) {
    const sName = (typeof s === 'string' ? s : s.name).trim();
    if (studentSkillSet.has(sName.toLowerCase())) {
      matchedMandatory.push(sName);
    } else {
      missingMandatory.push(sName);
    }
  }

  const matchedDesirable = [];
  const missingDesirable = [];
  for (const s of desirableRoleSkills) {
    const sName = (typeof s === 'string' ? s : s.name).trim();
    if (studentSkillSet.has(sName.toLowerCase())) {
      matchedDesirable.push(sName);
    } else {
      missingDesirable.push(sName);
    }
  }

  // Calculate K score [0, 100]
  let kScore = 100;
  const hasMandatory = mandatoryRoleSkills.length > 0;
  const hasDesirable = desirableRoleSkills.length > 0;

  if (hasMandatory && hasDesirable) {
    const mandRatio = matchedMandatory.length / mandatoryRoleSkills.length;
    const desRatio = matchedDesirable.length / desirableRoleSkills.length;
    kScore = Math.round((0.6 * mandRatio + 0.4 * desRatio) * 100);
  } else if (hasMandatory) {
    kScore = Math.round((matchedMandatory.length / mandatoryRoleSkills.length) * 100);
  } else if (hasDesirable) {
    kScore = Math.round((matchedDesirable.length / desirableRoleSkills.length) * 100);
  } else {
    // No skills listed on role: full score
    kScore = 100;
  }

  return {
    score: Math.min(100, Math.max(0, kScore)),
    totalRoleSkills: jobSkills.length,
    totalMatched: matchedMandatory.length + matchedDesirable.length,
    matchedMandatory,
    missingMandatory,
    matchedDesirable,
    missingDesirable
  };
}

