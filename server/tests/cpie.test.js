import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  evaluateEligibility,
  calculatePreferenceScore,
  isWithinPreference,
  evaluateSkillCompatibility,
  rankRecommendation,
  analyzeSkillGaps
} from '../src/services/cpie/index.js';

describe('PlaceWise CPIE — Eligibility Engine Tests', () => {
  const baseStudent = {
    institution_id: 1,
    degree: 'B.Tech',
    branch: 'CSE',
    graduation_year: 2026,
    cgpa: 8.5,
    active_backlogs: 0,
    historical_backlogs: 0,
    skills: [{ name: 'JavaScript' }, { name: 'Node.js' }]
  };

  const baseDrive = {
    id: 101,
    institution_id: 1,
    source_type: 'CAMPUS',
    college_scope: 'COLLEGE_RESTRICTED',
    preference_group: 'TECHNICAL',
    work_mode: 'HYBRID',
    location: 'Kolkata'
  };

  const standardCriteria = [
    { criterion_type: 'MIN_CGPA', operator: 'GTE', expected_value: '7.50', is_mandatory: true },
    { criterion_type: 'MAX_ACTIVE_BACKLOGS', operator: 'LTE', expected_value: '0', is_mandatory: true },
    { criterion_type: 'ALLOWED_BRANCHES', operator: 'IN', expected_value: '["CSE","IT"]', is_mandatory: true },
    { criterion_type: 'GRADUATION_YEAR', operator: 'EQ', expected_value: '2026', is_mandatory: true }
  ];

  it('Case 1: Student meets every mandatory criterion -> ELIGIBLE', () => {
    const result = evaluateEligibility({
      student: baseStudent,
      drive: baseDrive,
      criteria: standardCriteria
    });
    assert.strictEqual(result.status, 'ELIGIBLE');
    assert.strictEqual(result.failedCount, 0);
    assert.strictEqual(result.missingCount, 0);
    assert.match(result.explanation, /Eligible/);
  });

  it('Case 2: Student fails CGPA -> NOT_ELIGIBLE', () => {
    const lowCgpaStudent = { ...baseStudent, cgpa: 7.2 };
    const result = evaluateEligibility({
      student: lowCgpaStudent,
      drive: baseDrive,
      criteria: standardCriteria
    });
    assert.strictEqual(result.status, 'NOT_ELIGIBLE');
    assert.strictEqual(result.failedCount, 1);
    assert.match(result.explanation, /minimum CGPA of 7.50; your verified CGPA is 7.20/);
  });

  it('Case 3: Student has an unaccepted branch -> NOT_ELIGIBLE', () => {
    const meStudent = { ...baseStudent, branch: 'ME' };
    const result = evaluateEligibility({
      student: meStudent,
      drive: baseDrive,
      criteria: standardCriteria
    });
    assert.strictEqual(result.status, 'NOT_ELIGIBLE');
    assert.strictEqual(result.failedCount, 1);
    assert.match(result.explanation, /Open only to CSE, IT; your branch is ME/);
  });

  it('Case 4: Student has too many active backlogs -> NOT_ELIGIBLE', () => {
    const backlogStudent = { ...baseStudent, active_backlogs: 2 };
    const result = evaluateEligibility({
      student: backlogStudent,
      drive: baseDrive,
      criteria: standardCriteria
    });
    assert.strictEqual(result.status, 'NOT_ELIGIBLE');
    assert.strictEqual(result.failedCount, 1);
    assert.match(result.explanation, /Maximum allowed active backlogs is 0; you have 2/);
  });

  it('Case 5: Student has missing academic information -> NEEDS_VERIFICATION', () => {
    const missingCgpaStudent = { ...baseStudent, cgpa: null };
    const result = evaluateEligibility({
      student: missingCgpaStudent,
      drive: baseDrive,
      criteria: standardCriteria
    });
    assert.strictEqual(result.status, 'NEEDS_VERIFICATION');
    assert.strictEqual(result.failedCount, 0);
    assert.strictEqual(result.missingCount, 1);
    assert.match(result.explanation, /Needs verification/);
  });

  it('Case 6: Missing graduation year in student profile -> NEEDS_VERIFICATION', () => {
    const missingGradStudent = { ...baseStudent, graduation_year: null };
    const result = evaluateEligibility({
      student: missingGradStudent,
      drive: baseDrive,
      criteria: standardCriteria
    });
    assert.strictEqual(result.status, 'NEEDS_VERIFICATION');
    assert.strictEqual(result.failedCount, 0);
    assert.strictEqual(result.missingCount, 1);
    assert.match(result.explanation, /graduation year is missing/);
  });

  it('Case 7: Confirmed failure combined with missing information -> MUST BE NOT_ELIGIBLE', () => {
    // Fails CGPA (confirmed) AND graduation year is missing (unverified)
    const combinedStudent = { ...baseStudent, cgpa: 6.8, graduation_year: null };
    const result = evaluateEligibility({
      student: combinedStudent,
      drive: baseDrive,
      criteria: standardCriteria
    });
    assert.strictEqual(result.status, 'NOT_ELIGIBLE', 'Confirmed failure must trump missing information');
    assert.strictEqual(result.failedCount, 1);
    assert.strictEqual(result.missingCount, 1);
    assert.match(result.explanation, /Not eligible/);
    assert.match(result.explanation, /unverified fields/);
  });

  it('Case 8: Campus opportunity restricted to a different college -> NOT_ELIGIBLE', () => {
    const foreignCampusDrive = {
      ...baseDrive,
      institution_id: 99,
      institution_name: 'Other State University'
    };
    const result = evaluateEligibility({
      student: baseStudent,
      drive: foreignCampusDrive,
      criteria: standardCriteria
    });
    assert.strictEqual(result.status, 'NOT_ELIGIBLE');
    assert.match(result.explanation, /restricted to Other State University/);
  });

  it('Case 9: External opportunity open to all colleges -> ELIGIBLE', () => {
    const externalOpenDrive = {
      id: 201,
      institution_id: null,
      source_type: 'EXTERNAL',
      college_scope: 'OPEN_TO_ALL_COLLEGES'
    };
    const result = evaluateEligibility({
      student: baseStudent,
      drive: externalOpenDrive,
      criteria: standardCriteria
    });
    assert.strictEqual(result.status, 'ELIGIBLE');
    assert.strictEqual(result.failedCount, 0);
  });

  it('Case 10: External opportunity restricted to selected colleges', () => {
    const partnerDrive = {
      id: 202,
      institution_id: null,
      source_type: 'EXTERNAL',
      college_scope: 'SELECTED_COLLEGES',
      allowed_institutions: [1, 5] // Student 1 is inst 1
    };

    // Whitelisted student -> ELIGIBLE
    const partnerResult = evaluateEligibility({
      student: baseStudent,
      drive: partnerDrive,
      criteria: standardCriteria
    });
    assert.strictEqual(partnerResult.status, 'ELIGIBLE');

    // Non-whitelisted student -> NOT_ELIGIBLE
    const outsiderStudent = { ...baseStudent, institution_id: 99 };
    const outsiderResult = evaluateEligibility({
      student: outsiderStudent,
      drive: partnerDrive,
      criteria: standardCriteria
    });
    assert.strictEqual(outsiderResult.status, 'NOT_ELIGIBLE');
    assert.match(outsiderResult.explanation, /restricted to selected partner colleges/);
  });
});

describe('PlaceWise CPIE — Career Preferences & Skill Compatibility Tests', () => {
  it('Preference Mode: TECHNICAL matches TECHNICAL role with 100, NON_TECHNICAL with 30', () => {
    assert.strictEqual(calculatePreferenceScore('TECHNICAL', 'TECHNICAL'), 100);
    assert.strictEqual(calculatePreferenceScore('TECHNICAL', 'NON_TECHNICAL'), 30);
    assert.strictEqual(isWithinPreference('TECHNICAL', 'TECHNICAL'), true);
    assert.strictEqual(isWithinPreference('TECHNICAL', 'NON_TECHNICAL'), false);
  });

  it('Preference Mode: NON_TECHNICAL matches NON_TECHNICAL with 100, TECHNICAL with 30', () => {
    assert.strictEqual(calculatePreferenceScore('NON_TECHNICAL', 'NON_TECHNICAL'), 100);
    assert.strictEqual(calculatePreferenceScore('NON_TECHNICAL', 'TECHNICAL'), 30);
    assert.strictEqual(isWithinPreference('NON_TECHNICAL', 'NON_TECHNICAL'), true);
    assert.strictEqual(isWithinPreference('NON_TECHNICAL', 'TECHNICAL'), false);
  });

  it('Preference Mode: BOTH and OPEN_TO_ALL score 100 on both domains', () => {
    assert.strictEqual(calculatePreferenceScore('BOTH', 'TECHNICAL'), 100);
    assert.strictEqual(calculatePreferenceScore('BOTH', 'NON_TECHNICAL'), 100);
    assert.strictEqual(calculatePreferenceScore('OPEN_TO_ALL', 'TECHNICAL'), 100);
    assert.strictEqual(calculatePreferenceScore('OPEN_TO_ALL', 'NON_TECHNICAL'), 100);
    assert.strictEqual(isWithinPreference('BOTH', 'TECHNICAL'), true);
    assert.strictEqual(isWithinPreference('OPEN_TO_ALL', 'NON_TECHNICAL'), true);
  });

  it('Skill Compatibility: Missing desirable skill NEVER fails eligibility', () => {
    const student = {
      skills: [{ name: 'JavaScript' }, { name: 'Node.js' }]
    };
    const roleSkills = [
      { name: 'JavaScript', is_mandatory: true },
      { name: 'Docker', is_mandatory: false },
      { name: 'AWS', is_mandatory: false }
    ];

    const result = evaluateSkillCompatibility({
      studentSkills: student.skills,
      jobSkills: roleSkills
    });

    assert.deepStrictEqual(result.matchedMandatory, ['JavaScript']);
    assert.deepStrictEqual(result.missingMandatory, []);
    assert.deepStrictEqual(result.missingDesirable, ['Docker', 'AWS']);
    assert.strictEqual(result.score > 0, true);
  });

  it('Recommendation Ranking: Computes explainable score and partitions sections', () => {
    const student = {
      preference_mode: 'TECHNICAL',
      preferred_work_mode: 'HYBRID',
      preferred_locations: ['Bangalore', 'Kolkata'],
      skills: [{ name: 'JavaScript' }, { name: 'React' }, { name: 'Node.js' }]
    };

    const eligibleDrive = {
      id: 1,
      title: 'Full Stack Engineer',
      preference_group: 'TECHNICAL',
      work_mode: 'HYBRID',
      location: 'Bangalore, Karnataka',
      skills: [
        { name: 'JavaScript', is_mandatory: true },
        { name: 'Node.js', is_mandatory: true },
        { name: 'React', is_mandatory: false },
        { name: 'Docker', is_mandatory: false }
      ]
    };

    const ranking = rankRecommendation({
      student,
      drive: eligibleDrive,
      eligibilityResult: { status: 'ELIGIBLE', explanation: 'All criteria passed' }
    });

    assert.strictEqual(ranking.isRecommended, true);
    assert.strictEqual(ranking.section, 'RECOMMENDED');
    assert.strictEqual(ranking.score >= 80, true);
    assert.match(ranking.explanation, /Recommended/);
    assert.match(ranking.explanation, /match 3 of 4 listed skills/);
  });

  it('Recommendation Ranking: Ineligible role NEVER ranked as recommended', () => {
    const student = { preference_mode: 'TECHNICAL', skills: [] };
    const ineligibleDrive = { id: 2, title: 'Ineligible Role', preference_group: 'TECHNICAL' };

    const ranking = rankRecommendation({
      student,
      drive: ineligibleDrive,
      eligibilityResult: { status: 'NOT_ELIGIBLE', explanation: 'Failed CGPA' }
    });

    assert.strictEqual(ranking.isRecommended, false);
    assert.strictEqual(ranking.section, 'INELIGIBLE');
    assert.strictEqual(ranking.score, 0);
  });

  it('Skill-Gap Analysis: Correctly aggregates missing desirable skills across eligible opportunities', () => {
    const student = {
      skills: [{ name: 'JavaScript' }, { name: 'Node.js' }]
    };

    const eligibleDrives = [
      {
        id: 1,
        title: 'Backend Dev',
        company_name: 'Company A',
        skills: [
          { name: 'Node.js', is_mandatory: true },
          { name: 'Docker', is_mandatory: false },
          { name: 'AWS', is_mandatory: false }
        ]
      },
      {
        id: 2,
        title: 'Cloud Associate',
        company_name: 'Company B',
        skills: [
          { name: 'Python', is_mandatory: false },
          { name: 'Docker', is_mandatory: false }
        ]
      }
    ];

    const gapReport = analyzeSkillGaps({ student, eligibleDrives });
    assert.strictEqual(gapReport.totalEligibleOpportunitiesAnalyzed, 2);
    // Docker appears in both opportunities (frequency: 2)
    const dockerGap = gapReport.gaps.find(g => g.skillName === 'Docker');
    assert.ok(dockerGap);
    assert.strictEqual(dockerGap.frequency, 2);
    assert.strictEqual(dockerGap.drives.length, 2);
    assert.match(gapReport.disclaimer, /opportunity-impact indicator/);
  });
});
