import pool from '../config/db.js';
import { notifyUsersOfInstitution } from '../services/notificationService.js';

export async function listInstitutionDrives(req, res, next) {
  try {
    const instId = req.user.institution_id;
    if (!instId && req.user.role !== 'PLATFORM_ADMIN') {
      return res.status(403).json({ success: false, error: 'User is not linked to any institution.' });
    }

    const whereClause = req.user.role === 'PLATFORM_ADMIN' ? '' : 'WHERE pd.institution_id = ?';
    const params = req.user.role === 'PLATFORM_ADMIN' ? [] : [instId];

    const [rows] = await pool.query(`
      SELECT pd.id, pd.drive_code, pd.title, pd.employment_type, pd.work_mode, pd.location,
             pd.status, pd.application_deadline, pd.created_at,
             jr.title as role_title, jr.career_domain, jr.preference_group, jr.coding_intensity,
             jr.compensation_min, jr.compensation_max,
             c.name as company_name, c.industry as company_industry,
             (SELECT COUNT(*) FROM applications WHERE drive_id = pd.id) as applicant_count
      FROM placement_drives pd
      JOIN job_roles jr ON pd.role_id = jr.id
      JOIN companies c ON jr.company_id = c.id
      ${whereClause}
      ORDER BY pd.created_at DESC
    `, params);

    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    next(err);
  }
}

export async function createDrive(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const instId = req.user.institution_id;
    if (!instId) {
      return res.status(403).json({ success: false, error: 'Placement administrator must belong to an institution.' });
    }

    const {
      companyId,
      companyName,
      companyIndustry = 'Technology',
      companyWebsite,
      roleTitle,
      roleDescription,
      careerDomain,
      preferenceGroup,
      codingIntensity = 'MEDIUM',
      compensationMin,
      compensationMax,
      driveTitle,
      employmentType = 'FULL_TIME',
      workMode = 'IN_OFFICE',
      location,
      applicationDeadline,
      selectionRounds = ['Online Assessment', 'Technical Interview', 'HR Interview'],
      requiredDocuments = ['Resume', 'College ID'],
      criteria = [], // Array of { type, operator, expected_value, mandatory }
      skills = [] // Array of { id, name, is_mandatory }
    } = req.body;

    if (!roleTitle || !careerDomain || !preferenceGroup || !applicationDeadline || !location) {
      return res.status(400).json({ success: false, error: 'Role title, career domain, preference group, location, and deadline are required.' });
    }

    await conn.beginTransaction();

    // 1. Resolve Company
    let finalCompanyId = companyId;
    if (!finalCompanyId && companyName) {
      const [compRows] = await conn.query('SELECT id FROM companies WHERE name = ?', [companyName.trim()]);
      if (compRows.length > 0) {
        finalCompanyId = compRows[0].id;
      } else {
        const [compRes] = await conn.query(`
          INSERT INTO companies (name, website, industry, description)
          VALUES (?, ?, ?, ?)
        `, [companyName.trim(), companyWebsite || null, companyIndustry, `On-campus partner company.`]);
        finalCompanyId = compRes.insertId;
      }
    }

    // 2. Create Job Role
    const [roleRes] = await conn.query(`
      INSERT INTO job_roles (company_id, title, description, career_domain, preference_group, coding_intensity, compensation_min, compensation_max)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      finalCompanyId, roleTitle.trim(), roleDescription || roleTitle,
      careerDomain, preferenceGroup, codingIntensity,
      compensationMin ? Number(compensationMin) : null,
      compensationMax ? Number(compensationMax) : null
    ]);
    const roleId = roleRes.insertId;

    // 3. Create Drive
    const driveCode = `CAMPUS-${instId}-${Date.now().toString().slice(-6)}`;
    const [driveRes] = await conn.query(`
      INSERT INTO placement_drives (institution_id, role_id, drive_code, title, employment_type, work_mode, location, status, application_deadline, selection_rounds, required_documents, created_by_user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'PUBLISHED', ?, ?, ?, ?)
    `, [
      instId, roleId, driveCode, driveTitle || `${roleTitle} Campus Drive`,
      employmentType, workMode, location, applicationDeadline,
      JSON.stringify(selectionRounds), JSON.stringify(requiredDocuments),
      req.user.id
    ]);
    const driveId = driveRes.insertId;

    // 4. Create Opportunity Source Record
    await conn.query(`
      INSERT INTO opportunity_sources (drive_id, source_type, college_scope, listing_source, verification_status, verified_by_user_id, last_verified_date)
      VALUES (?, 'CAMPUS', 'COLLEGE_RESTRICTED', 'Campus Placement Cell', 'VERIFIED', ?, CURRENT_DATE())
    `, [driveId, req.user.id]);

    // 5. Add Criteria
    for (const crit of criteria) {
      await conn.query(`
        INSERT INTO eligibility_criteria (drive_id, criterion_type, operator, expected_value, is_mandatory)
        VALUES (?, ?, ?, ?, ?)
      `, [driveId, crit.type, crit.operator || 'GTE', crit.value, crit.mandatory !== false]);
    }

    // 6. Add Skills
    for (const sk of skills) {
      let skillId = sk.id;
      if (!skillId && sk.name) {
        const [skCheck] = await conn.query('SELECT id FROM skills WHERE name = ?', [sk.name.trim()]);
        if (skCheck.length > 0) {
          skillId = skCheck[0].id;
        } else {
          const [skRes] = await conn.query('INSERT INTO skills (name, category) VALUES (?, ?)', [sk.name.trim(), 'PROGRAMMING']);
          skillId = skRes.insertId;
        }
      }
      if (skillId) {
        await conn.query(`
          INSERT INTO job_skills (role_id, skill_id, is_mandatory)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE is_mandatory = VALUES(is_mandatory)
        `, [roleId, skillId, sk.is_mandatory ? 1 : 0]);
      }
    }

    // 7. Audit Log
    await conn.query(`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details_json)
      VALUES (?, 'CREATE_CAMPUS_DRIVE', 'placement_drives', ?, ?)
    `, [req.user.id, driveId, JSON.stringify({ driveCode, title: driveTitle || roleTitle })]);

    await conn.commit();

    // Notify students of this institution
    await notifyUsersOfInstitution({
      institutionId: instId,
      title: `New Campus Placement Drive: ${companyName || 'Campus Partner'}`,
      message: `${driveTitle || roleTitle} has been published for your institution. Check eligibility and apply!`,
      type: 'CAMPUS_DRIVE',
      relatedEntityType: 'placement_drives',
      relatedEntityId: driveId
    });

    res.status(201).json({
      success: true,
      message: 'Campus placement drive created and published successfully.',
      data: { driveId, driveCode }
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

export async function publishDrive(req, res, next) {
  try {
    const { id } = req.params;
    const instId = req.user.institution_id;

    const [drives] = await pool.query('SELECT * FROM placement_drives WHERE id = ?', [id]);
    if (drives.length === 0) {
      return res.status(404).json({ success: false, error: 'Drive not found.' });
    }

    if (req.user.role !== 'PLATFORM_ADMIN' && drives[0].institution_id !== instId) {
      return res.status(403).json({ success: false, error: 'Unauthorized to publish drive from another institution.' });
    }

    await pool.query("UPDATE placement_drives SET status = 'PUBLISHED' WHERE id = ?", [id]);

    res.json({
      success: true,
      message: 'Drive published successfully.'
    });
  } catch (err) {
    next(err);
  }
}

export async function cancelDrive(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const instId = req.user.institution_id;

    const [drives] = await pool.query('SELECT * FROM placement_drives WHERE id = ?', [id]);
    if (drives.length === 0) {
      return res.status(404).json({ success: false, error: 'Drive not found.' });
    }

    if (req.user.role !== 'PLATFORM_ADMIN' && drives[0].institution_id !== instId) {
      return res.status(403).json({ success: false, error: 'Unauthorized to cancel drive from another institution.' });
    }

    await pool.query("UPDATE placement_drives SET status = 'CANCELLED' WHERE id = ?", [id]);

    await pool.query(`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details_json)
      VALUES (?, 'CANCEL_DRIVE', 'placement_drives', ?, ?)
    `, [req.user.id, id, JSON.stringify({ reason: reason || 'Cancelled by institution admin' })]);

    res.json({
      success: true,
      message: 'Drive cancelled.'
    });
  } catch (err) {
    next(err);
  }
}

export async function listDriveApplicants(req, res, next) {
  try {
    const { id } = req.params;
    const instId = req.user.institution_id;

    const [drives] = await pool.query('SELECT * FROM placement_drives WHERE id = ?', [id]);
    if (drives.length === 0) {
      return res.status(404).json({ success: false, error: 'Drive not found.' });
    }

    if (req.user.role !== 'PLATFORM_ADMIN' && drives[0].institution_id && drives[0].institution_id !== instId) {
      return res.status(403).json({ success: false, error: 'Unauthorized to view applicants from another institution.' });
    }

    const [applicants] = await pool.query(`
      SELECT a.id as application_id, a.status as application_status, a.applied_at, a.notes as application_notes,
             u.id as user_id, u.first_name, u.last_name, u.email, u.phone,
             sp.student_id_code, sp.degree, sp.branch, sp.graduation_year, sp.cgpa, sp.active_backlogs,
             (SELECT id FROM resumes WHERE user_id = u.id AND is_active = 1 LIMIT 1) as active_resume_id
      FROM applications a
      JOIN users u ON a.student_id = u.id
      JOIN student_profiles sp ON u.id = sp.user_id
      WHERE a.drive_id = ?
      ORDER BY a.applied_at DESC
    `, [id]);

    res.json({
      success: true,
      data: applicants
    });
  } catch (err) {
    next(err);
  }
}

export async function listCompanies(req, res, next) {
  try {
    const [rows] = await pool.query(`
      SELECT id, name, industry, website, description, is_demo_data
      FROM companies
      ORDER BY name ASC
    `);

    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    next(err);
  }
}

export async function createCompany(req, res, next) {
  try {
    const { name, industry, website, description } = req.body;
    if (!name || !industry) {
      return res.status(400).json({ success: false, error: 'Company name and industry are required.' });
    }

    const [resInsert] = await pool.query(`
      INSERT INTO companies (name, industry, website, description)
      VALUES (?, ?, ?, ?)
    `, [name.trim(), industry.trim(), website || null, description || null]);

    res.status(201).json({
      success: true,
      data: {
        id: resInsert.insertId,
        name,
        industry,
        website
      }
    });
  } catch (err) {
    next(err);
  }
}
