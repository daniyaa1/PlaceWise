import pool from '../config/db.js';
import {
  evaluateEligibility,
  rankRecommendation,
  analyzeSkillGaps
} from '../services/cpie/index.js';

// Helper to assemble full drive model with criteria, skills, and allowed institutions
async function fetchFullDriveDetails(driveId) {
  const [drives] = await pool.query(`
    SELECT pd.*,
           jr.title, jr.description, jr.responsibilities, jr.career_domain, jr.preference_group,
           jr.coding_intensity, jr.compensation_min, jr.compensation_max, jr.compensation_currency,
           c.name as company_name, c.website as company_website, c.industry as company_industry,
           c.description as company_description, c.is_demo_data,
           os.source_type, os.college_scope, os.official_url, os.listing_source,
           os.verification_status, os.last_verified_date, os.source_notes,
           i.name as institution_name, i.code as institution_code
    FROM placement_drives pd
    JOIN job_roles jr ON pd.role_id = jr.id
    JOIN companies c ON jr.company_id = c.id
    LEFT JOIN opportunity_sources os ON pd.id = os.drive_id
    LEFT JOIN institutions i ON pd.institution_id = i.id
    WHERE pd.id = ?
  `, [driveId]);

  if (drives.length === 0) return null;
  const drive = drives[0];

  // Parse JSON columns
  try {
    drive.selection_rounds = typeof drive.selection_rounds === 'string' ? JSON.parse(drive.selection_rounds) : (drive.selection_rounds || []);
    drive.required_documents = typeof drive.required_documents === 'string' ? JSON.parse(drive.required_documents) : (drive.required_documents || []);
  } catch {
    drive.selection_rounds = [];
    drive.required_documents = [];
  }

  // Fetch Criteria
  const [criteria] = await pool.query(`
    SELECT id, criterion_type, operator, expected_value, is_mandatory
    FROM eligibility_criteria
    WHERE drive_id = ?
  `, [driveId]);
  drive.criteria = criteria;

  // Fetch Skills
  const [skills] = await pool.query(`
    SELECT s.id, s.name, s.category, js.is_mandatory
    FROM job_skills js
    JOIN skills s ON js.skill_id = s.id
    WHERE js.role_id = ?
    ORDER BY js.is_mandatory DESC, s.name ASC
  `, [drive.role_id]);
  drive.skills = skills;

  // Fetch Whitelisted Institutions if any
  const [allowedInsts] = await pool.query(`
    SELECT institution_id FROM drive_allowed_institutions WHERE drive_id = ?
  `, [driveId]);
  drive.allowed_institutions = allowedInsts.map(r => r.institution_id);

  return drive;
}

// Helper to fetch student profile and skills for CPIE evaluation
async function fetchStudentContext(userId) {
  const [profiles] = await pool.query(`
    SELECT sp.*, u.email, u.institution_id, spref.preference_mode
    FROM student_profiles sp
    JOIN users u ON sp.user_id = u.id
    LEFT JOIN student_preferences spref ON u.id = spref.user_id
    WHERE sp.user_id = ?
  `, [userId]);

  if (profiles.length === 0) return null;
  const student = profiles[0];

  try {
    student.preferred_locations = typeof student.preferred_locations === 'string'
      ? JSON.parse(student.preferred_locations)
      : (student.preferred_locations || []);
  } catch {
    student.preferred_locations = [];
  }

  const [skills] = await pool.query(`
    SELECT s.name, s.category, ss.proficiency
    FROM student_skills ss
    JOIN skills s ON ss.skill_id = s.id
    WHERE ss.student_profile_id = ?
  `, [student.id]);
  student.skills = skills;

  return student;
}

export async function listOpportunities(req, res, next) {
  try {
    const {
      source,
      domain,
      preferenceGroup,
      workMode,
      employmentType,
      verificationStatus,
      search,
      sort = 'recent',
      page = 1,
      limit = 20
    } = req.query;

    const conditions = ["pd.status = 'PUBLISHED'"];
    const params = [];

    // Filter by source type (CAMPUS / EXTERNAL)
    if (source && source !== 'ALL') {
      conditions.push('os.source_type = ?');
      params.push(source.toUpperCase());
    }

    // Filter by career domain
    if (domain && domain !== 'ALL') {
      conditions.push('jr.career_domain = ?');
      params.push(domain);
    }

    // Filter by preference group
    if (preferenceGroup && preferenceGroup !== 'ALL') {
      conditions.push('jr.preference_group = ?');
      params.push(preferenceGroup.toUpperCase());
    }

    // Filter by work mode
    if (workMode && workMode !== 'ALL') {
      conditions.push('pd.work_mode = ?');
      params.push(workMode.toUpperCase());
    }

    // Filter by employment type
    if (employmentType && employmentType !== 'ALL') {
      conditions.push('pd.employment_type = ?');
      params.push(employmentType.toUpperCase());
    }

    // Filter by verification status
    if (verificationStatus && verificationStatus !== 'ALL') {
      conditions.push('os.verification_status = ?');
      params.push(verificationStatus.toUpperCase());
    }

    // Search keyword
    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      conditions.push('(jr.title LIKE ? OR c.name LIKE ? OR jr.career_domain LIKE ? OR pd.location LIKE ?)');
      params.push(q, q, q, q);
    }

    // Multi-tenant student filtering:
    // If user is a student, campus drives must be restricted to their institution.
    // External drives with SELECTED_COLLEGES or COLLEGE_RESTRICTED must whitelist their institution.
    if (req.user && req.user.role === 'STUDENT') {
      const instId = req.user.institution_id ? Number(req.user.institution_id) : -1;
      conditions.push(`
        (
          (os.source_type = 'CAMPUS' AND pd.institution_id = ?)
          OR
          (os.source_type = 'EXTERNAL' AND (
            os.college_scope IN ('OPEN_TO_ALL_COLLEGES', 'NOT_SPECIFIED')
            OR pd.id IN (SELECT drive_id FROM drive_allowed_institutions WHERE institution_id = ?)
            OR pd.institution_id = ?
          ))
        )
      `);
      params.push(instId, instId, instId);
    }

    let orderBy = 'pd.created_at DESC';
    if (sort === 'deadline_asc') orderBy = 'pd.application_deadline ASC';
    else if (sort === 'deadline_desc') orderBy = 'pd.application_deadline DESC';
    else if (sort === 'comp_desc') orderBy = 'jr.compensation_max DESC';

    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*) as total
      FROM placement_drives pd
      JOIN job_roles jr ON pd.role_id = jr.id
      JOIN companies c ON jr.company_id = c.id
      LEFT JOIN opportunity_sources os ON pd.id = os.drive_id
      ${whereClause}
    `;
    const [countRows] = await pool.query(countSql, params);
    const totalCount = countRows[0].total;

    const querySql = `
      SELECT pd.id, pd.drive_code, pd.title, pd.employment_type, pd.work_mode, pd.location,
             pd.status, pd.application_deadline, pd.created_at,
             jr.id as role_id, jr.title as role_title, jr.career_domain, jr.preference_group,
             jr.coding_intensity, jr.compensation_min, jr.compensation_max, jr.compensation_currency,
             c.id as company_id, c.name as company_name, c.industry as company_industry, c.is_demo_data,
             os.source_type, os.college_scope, os.official_url, os.listing_source,
             os.verification_status, os.last_verified_date,
             i.name as institution_name, i.code as institution_code
      FROM placement_drives pd
      JOIN job_roles jr ON pd.role_id = jr.id
      JOIN companies c ON jr.company_id = c.id
      LEFT JOIN opportunity_sources os ON pd.id = os.drive_id
      LEFT JOIN institutions i ON pd.institution_id = i.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(querySql, [...params, parseInt(limit, 10), offset]);

    // Attach skills and criteria summary to list items
    for (const item of rows) {
      const [skills] = await pool.query(`
        SELECT s.name, js.is_mandatory
        FROM job_skills js
        JOIN skills s ON js.skill_id = s.id
        WHERE js.role_id = ?
        LIMIT 6
      `, [item.role_id]);
      item.skills = skills;
    }

    res.json({
      success: true,
      data: rows,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total: totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit, 10))
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getOpportunityById(req, res, next) {
  try {
    const { id } = req.params;
    const drive = await fetchFullDriveDetails(id);

    if (!drive) {
      return res.status(404).json({ success: false, error: 'Opportunity not found.' });
    }

    // If student, attach real-time eligibility evaluation
    let studentEligibility = null;
    let recommendationInsight = null;
    let userApplication = null;

    if (req.user && req.user.role === 'STUDENT') {
      const student = await fetchStudentContext(req.user.id);
      if (student) {
        studentEligibility = evaluateEligibility({
          student,
          drive,
          criteria: drive.criteria,
          mandatorySkills: drive.skills.filter(s => s.is_mandatory)
        });

        recommendationInsight = rankRecommendation({
          student,
          drive,
          eligibilityResult: studentEligibility
        });

        // Check if student already applied
        const [appRows] = await pool.query(`
          SELECT id, status, applied_at, notes
          FROM applications
          WHERE student_id = ? AND drive_id = ?
        `, [req.user.id, drive.id]);
        if (appRows.length > 0) {
          userApplication = appRows[0];
        }
      }
    }

    res.json({
      success: true,
      data: drive,
      studentEligibility,
      recommendationInsight,
      userApplication
    });
  } catch (err) {
    next(err);
  }
}

export async function checkOpportunityEligibility(req, res, next) {
  try {
    const { id } = req.params;
    const drive = await fetchFullDriveDetails(id);

    if (!drive) {
      return res.status(404).json({ success: false, error: 'Opportunity not found.' });
    }

    const student = await fetchStudentContext(req.user.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student academic profile not found.' });
    }

    const eligibility = evaluateEligibility({
      student,
      drive,
      criteria: drive.criteria,
      mandatorySkills: drive.skills.filter(s => s.is_mandatory)
    });

    res.json({
      success: true,
      data: eligibility
    });
  } catch (err) {
    next(err);
  }
}

export async function getRecommendations(req, res, next) {
  try {
    const student = await fetchStudentContext(req.user.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student academic profile not found.' });
    }

    // Fetch all active published drives viewable by student
    const instId = student.institution_id ? Number(student.institution_id) : -1;
    const [drivesList] = await pool.query(`
      SELECT pd.id
      FROM placement_drives pd
      LEFT JOIN opportunity_sources os ON pd.id = os.drive_id
      WHERE pd.status = 'PUBLISHED'
        AND (
          (os.source_type = 'CAMPUS' AND pd.institution_id = ?)
          OR
          (os.source_type = 'EXTERNAL' AND (
            os.college_scope IN ('OPEN_TO_ALL_COLLEGES', 'NOT_SPECIFIED')
            OR pd.id IN (SELECT drive_id FROM drive_allowed_institutions WHERE institution_id = ?)
            OR pd.institution_id = ?
          ))
        )
    `, [instId, instId, instId]);

    const recommendedList = [];
    const exploreOtherList = [];
    const ineligibleList = [];

    for (const d of drivesList) {
      const fullDrive = await fetchFullDriveDetails(d.id);
      if (!fullDrive) continue;

      const eligibility = evaluateEligibility({
        student,
        drive: fullDrive,
        criteria: fullDrive.criteria,
        mandatorySkills: fullDrive.skills.filter(s => s.is_mandatory)
      });

      const ranking = rankRecommendation({
        student,
        drive: fullDrive,
        eligibilityResult: eligibility
      });

      const cardData = {
        ...fullDrive,
        eligibility,
        recommendation: ranking
      };

      if (ranking.section === 'RECOMMENDED') {
        recommendedList.push(cardData);
      } else if (ranking.section === 'EXPLORE_OTHER') {
        exploreOtherList.push(cardData);
      } else {
        ineligibleList.push(cardData);
      }
    }

    // Sort descending by recommendation score
    recommendedList.sort((a, b) => b.recommendation.score - a.recommendation.score);
    exploreOtherList.sort((a, b) => b.recommendation.score - a.recommendation.score);

    res.json({
      success: true,
      preferenceMode: student.preference_mode || 'OPEN_TO_ALL',
      data: {
        recommended: recommendedList,
        exploreOther: exploreOtherList,
        ineligible: ineligibleList
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getSkillGaps(req, res, next) {
  try {
    const student = await fetchStudentContext(req.user.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student academic profile not found.' });
    }

    const instId = student.institution_id ? Number(student.institution_id) : -1;
    const [drivesList] = await pool.query(`
      SELECT pd.id
      FROM placement_drives pd
      LEFT JOIN opportunity_sources os ON pd.id = os.drive_id
      WHERE pd.status = 'PUBLISHED'
        AND (
          (os.source_type = 'CAMPUS' AND pd.institution_id = ?)
          OR
          (os.source_type = 'EXTERNAL' AND (
            os.college_scope IN ('OPEN_TO_ALL_COLLEGES', 'NOT_SPECIFIED')
            OR pd.id IN (SELECT drive_id FROM drive_allowed_institutions WHERE institution_id = ?)
            OR pd.institution_id = ?
          ))
        )
    `, [instId, instId, instId]);

    const eligibleDrives = [];
    for (const d of drivesList) {
      const fullDrive = await fetchFullDriveDetails(d.id);
      if (!fullDrive) continue;

      const eligibility = evaluateEligibility({
        student,
        drive: fullDrive,
        criteria: fullDrive.criteria,
        mandatorySkills: fullDrive.skills.filter(s => s.is_mandatory)
      });

      if (eligibility.status === 'ELIGIBLE') {
        eligibleDrives.push(fullDrive);
      }
    }

    const analysis = analyzeSkillGaps({ student, eligibleDrives });

    res.json({
      success: true,
      data: analysis
    });
  } catch (err) {
    next(err);
  }
}
