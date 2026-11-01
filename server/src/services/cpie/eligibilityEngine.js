/**
 * PlaceWise Career Path Intelligence Engine (CPIE)
 * Module: Eligibility Engine
 * 
 * Evaluates mandatory academic and institutional criteria for an opportunity.
 * Outcomes:
 *  - ELIGIBLE: All applicable mandatory criteria confirmed and satisfied.
 *  - NOT_ELIGIBLE: At least one mandatory criterion confirmed to fail.
 *  - NEEDS_VERIFICATION: Missing/ambiguous student or listing information,
 *                        with NO confirmed mandatory failure.
 * 
 * CRITICAL RULE: If there is both a confirmed mandatory failure and another missing field,
 * the outcome MUST BE NOT_ELIGIBLE.
 */

export function evaluateEligibility({ student, drive, criteria = [], mandatorySkills = [] }) {
  const criteriaChecked = [];
  let confirmedFailureCount = 0;
  let missingInfoCount = 0;
  let passedCount = 0;
  const failureReasons = [];
  const missingReasons = [];
  const passedNotes = [];

  // 1. Institution Restrictions Check
  const sourceType = drive.source_type || (drive.institution_id ? 'CAMPUS' : 'EXTERNAL');
  const collegeScope = drive.college_scope || (sourceType === 'CAMPUS' ? 'COLLEGE_RESTRICTED' : 'OPEN_TO_ALL_COLLEGES');
  const allowedInstIds = (drive.allowed_institutions || []).map(id => Number(id));

  const instCheck = {
    criterion: 'INSTITUTION_RESTRICTION',
    type: 'INSTITUTION',
    isMandatory: true
  };

  if (sourceType === 'CAMPUS') {
    if (!student.institution_id) {
      missingInfoCount++;
      missingReasons.push('Your registered institution information is missing.');
      instCheck.status = 'MISSING';
    } else if (Number(student.institution_id) !== Number(drive.institution_id)) {
      confirmedFailureCount++;
      const driveInstName = drive.institution_name || `Institution #${drive.institution_id}`;
      failureReasons.push(`Campus opportunity restricted to ${driveInstName}.`);
      instCheck.status = 'FAILED';
    } else {
      passedCount++;
      passedNotes.push('Campus institution requirement satisfied.');
      instCheck.status = 'PASSED';
    }
  } else if (sourceType === 'EXTERNAL') {
    if (collegeScope === 'OPEN_TO_ALL_COLLEGES' || collegeScope === 'NOT_SPECIFIED') {
      passedCount++;
      passedNotes.push('External opportunity open to all colleges.');
      instCheck.status = 'PASSED';
    } else if (collegeScope === 'SELECTED_COLLEGES') {
      if (!student.institution_id) {
        missingInfoCount++;
        missingReasons.push('Your registered institution information is missing for college-whitelisted listing.');
        instCheck.status = 'MISSING';
      } else if (!allowedInstIds.includes(Number(student.institution_id))) {
        confirmedFailureCount++;
        failureReasons.push('External opportunity is restricted to selected partner colleges; your institution is not included.');
        instCheck.status = 'FAILED';
      } else {
        passedCount++;
        passedNotes.push('Partner institution requirement satisfied.');
        instCheck.status = 'PASSED';
      }
    } else if (collegeScope === 'COLLEGE_RESTRICTED') {
      const allowed = drive.institution_id ? [Number(drive.institution_id), ...allowedInstIds] : allowedInstIds;
      if (!student.institution_id) {
        missingInfoCount++;
        missingReasons.push('Your registered institution information is missing.');
        instCheck.status = 'MISSING';
      } else if (!allowed.includes(Number(student.institution_id))) {
        confirmedFailureCount++;
        failureReasons.push('Opportunity restricted to specific institutions; your college is not eligible.');
        instCheck.status = 'FAILED';
      } else {
        passedCount++;
        passedNotes.push('Institution restriction satisfied.');
        instCheck.status = 'PASSED';
      }
    }
  }
  criteriaChecked.push(instCheck);

  // 2. Academic Criteria Check
  for (const crit of criteria) {
    const item = {
      criterion: crit.criterion_type,
      operator: crit.operator,
      expected: crit.expected_value,
      isMandatory: crit.is_mandatory !== false
    };

    switch (crit.criterion_type) {
      case 'MIN_CGPA': {
        const minCgpa = parseFloat(crit.expected_value);
        const studentCgpa = student.cgpa !== null && student.cgpa !== undefined ? parseFloat(student.cgpa) : null;
        item.actual = studentCgpa;

        if (studentCgpa === null || isNaN(studentCgpa) || studentCgpa === 0) {
          missingInfoCount++;
          missingReasons.push('Your verified CGPA is missing or unverified.');
          item.status = 'MISSING';
        } else if (studentCgpa < minCgpa) {
          confirmedFailureCount++;
          failureReasons.push(`Requires minimum CGPA of ${minCgpa.toFixed(2)}; your verified CGPA is ${studentCgpa.toFixed(2)}.`);
          item.status = 'FAILED';
        } else {
          passedCount++;
          passedNotes.push(`CGPA requirement satisfied (${studentCgpa.toFixed(2)} >= ${minCgpa.toFixed(2)}).`);
          item.status = 'PASSED';
        }
        break;
      }

      case 'MAX_ACTIVE_BACKLOGS': {
        const maxBacklogs = parseInt(crit.expected_value, 10);
        const studentBacklogs = student.active_backlogs !== null && student.active_backlogs !== undefined
          ? parseInt(student.active_backlogs, 10)
          : null;
        item.actual = studentBacklogs;

        if (studentBacklogs === null || isNaN(studentBacklogs)) {
          missingInfoCount++;
          missingReasons.push('Your active backlog count is missing.');
          item.status = 'MISSING';
        } else if (studentBacklogs > maxBacklogs) {
          confirmedFailureCount++;
          failureReasons.push(`Maximum allowed active backlogs is ${maxBacklogs}; you have ${studentBacklogs}.`);
          item.status = 'FAILED';
        } else {
          passedCount++;
          passedNotes.push(`Active backlogs criterion satisfied (${studentBacklogs} <= ${maxBacklogs}).`);
          item.status = 'PASSED';
        }
        break;
      }

      case 'MAX_HISTORICAL_BACKLOGS': {
        const maxHist = parseInt(crit.expected_value, 10);
        const studentHist = student.historical_backlogs !== null && student.historical_backlogs !== undefined
          ? parseInt(student.historical_backlogs, 10)
          : null;
        item.actual = studentHist;

        if (studentHist === null || isNaN(studentHist)) {
          missingInfoCount++;
          missingReasons.push('Historical backlog record is unverified.');
          item.status = 'MISSING';
        } else if (studentHist > maxHist) {
          confirmedFailureCount++;
          failureReasons.push(`Maximum historical backlogs allowed is ${maxHist}; you have ${studentHist}.`);
          item.status = 'FAILED';
        } else {
          passedCount++;
          passedNotes.push(`Historical backlog criterion satisfied.`);
          item.status = 'PASSED';
        }
        break;
      }

      case 'ALLOWED_BRANCHES': {
        let allowedBranches = [];
        try {
          allowedBranches = typeof crit.expected_value === 'string'
            ? JSON.parse(crit.expected_value)
            : crit.expected_value;
        } catch {
          allowedBranches = crit.expected_value.split(',').map(b => b.trim());
        }

        const studentBranch = (student.branch || '').trim().toUpperCase();
        item.actual = studentBranch;
        const normalizedAllowed = allowedBranches.map(b => b.trim().toUpperCase());

        if (!studentBranch) {
          missingInfoCount++;
          missingReasons.push('Your engineering branch is not specified in your profile.');
          item.status = 'MISSING';
        } else if (!normalizedAllowed.includes(studentBranch)) {
          confirmedFailureCount++;
          failureReasons.push(`Open only to ${allowedBranches.join(', ')}; your branch is ${studentBranch}.`);
          item.status = 'FAILED';
        } else {
          passedCount++;
          passedNotes.push(`Eligible branch (${studentBranch}).`);
          item.status = 'PASSED';
        }
        break;
      }

      case 'ALLOWED_DEGREES': {
        let allowedDegrees = [];
        try {
          allowedDegrees = typeof crit.expected_value === 'string'
            ? JSON.parse(crit.expected_value)
            : crit.expected_value;
        } catch {
          allowedDegrees = crit.expected_value.split(',').map(d => d.trim());
        }

        const studentDegree = (student.degree || '').trim().toUpperCase();
        item.actual = studentDegree;
        const normalizedAllowed = allowedDegrees.map(d => d.trim().toUpperCase());

        if (!studentDegree) {
          missingInfoCount++;
          missingReasons.push('Your degree is not specified in your profile.');
          item.status = 'MISSING';
        } else if (!normalizedAllowed.includes(studentDegree)) {
          confirmedFailureCount++;
          failureReasons.push(`Requires degree in ${allowedDegrees.join(', ')}; your degree is ${studentDegree}.`);
          item.status = 'FAILED';
        } else {
          passedCount++;
          passedNotes.push(`Eligible degree (${studentDegree}).`);
          item.status = 'PASSED';
        }
        break;
      }

      case 'GRADUATION_YEAR': {
        const expectedYear = parseInt(crit.expected_value, 10);
        const studentYear = student.graduation_year ? parseInt(student.graduation_year, 10) : null;
        item.actual = studentYear;

        if (!studentYear || isNaN(studentYear)) {
          missingInfoCount++;
          missingReasons.push('Your graduation year is missing.');
          item.status = 'MISSING';
        } else if (studentYear !== expectedYear) {
          confirmedFailureCount++;
          failureReasons.push(`Requires graduation year ${expectedYear}; your graduation year is ${studentYear}.`);
          item.status = 'FAILED';
        } else {
          passedCount++;
          passedNotes.push(`Graduation year matches (${expectedYear}).`);
          item.status = 'PASSED';
        }
        break;
      }

      default:
        // Generic criterion
        passedCount++;
        item.status = 'PASSED';
        break;
    }

    criteriaChecked.push(item);
  }

  // 3. Mandatory Skills Check (If role declares skills mandatory)
  if (mandatorySkills.length > 0) {
    const studentSkillNames = new Set((student.skills || []).map(s => s.name.toLowerCase().trim()));
    const missingMandatory = mandatorySkills.filter(s => !studentSkillNames.has(s.name.toLowerCase().trim()));

    const skillCheck = {
      criterion: 'MANDATORY_ROLE_SKILLS',
      expected: mandatorySkills.map(s => s.name),
      isMandatory: true
    };

    if (missingMandatory.length > 0) {
      confirmedFailureCount++;
      const names = missingMandatory.map(s => s.name).join(', ');
      failureReasons.push(`Missing mandatory role prerequisite skills: ${names}.`);
      skillCheck.status = 'FAILED';
      skillCheck.actual = { missing: missingMandatory.map(s => s.name) };
    } else {
      passedCount++;
      passedNotes.push('All mandatory role skills satisfied.');
      skillCheck.status = 'PASSED';
    }
    criteriaChecked.push(skillCheck);
  }

  // 4. Resolve Overall Outcome based on the strict rule:
  // - Confirmed failure -> NOT_ELIGIBLE (even if another field is missing)
  // - No failure + any missing -> NEEDS_VERIFICATION
  // - No failure + no missing -> ELIGIBLE
  let status = 'ELIGIBLE';
  let explanation = '';

  if (confirmedFailureCount > 0) {
    status = 'NOT_ELIGIBLE';
    explanation = `Not eligible: ${failureReasons.join(' ')}`;
    if (missingInfoCount > 0) {
      explanation += ` (Note: Also has ${missingInfoCount} unverified fields).`;
    }
  } else if (missingInfoCount > 0) {
    status = 'NEEDS_VERIFICATION';
    explanation = `Needs verification: ${missingReasons.join(' ')}`;
  } else {
    status = 'ELIGIBLE';
    explanation = `Eligible: You satisfy all ${criteriaChecked.length} mandatory academic and institutional requirements.`;
  }

  return {
    status,
    checkedCount: criteriaChecked.length,
    passedCount,
    failedCount: confirmedFailureCount,
    missingCount: missingInfoCount,
    criteriaChecked,
    failureReasons,
    missingReasons,
    passedNotes,
    explanation
  };
}

