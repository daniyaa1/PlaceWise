import pool from '../config/db.js';

export async function createInstitution(req, res, next) {
  try {
    const { name, universityName, code, location, institutionType = 'AUTONOMOUS_INSTITUTE', website } = req.body;
    if (!name || !code || !location) {
      return res.status(400).json({ success: false, error: 'Name, unique code, and location are required.' });
    }

    const [result] = await pool.query(`
      INSERT INTO institutions (name, university_name, code, location, institution_type, website)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name.trim(), universityName || null, code.trim().toUpperCase(), location.trim(), institutionType, website || null]);

    await pool.query(`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details_json)
      VALUES (?, 'CREATE_INSTITUTION', 'institutions', ?, ?)
    `, [req.user.id, result.insertId, JSON.stringify({ name, code })]);

    res.status(201).json({
      success: true,
      message: 'Institution created successfully.',
      data: { id: result.insertId, name, code }
    });
  } catch (err) {
    next(err);
  }
}

export async function updateInstitution(req, res, next) {
  try {
    const { id } = req.params;
    const { name, universityName, code, location, institutionType, website, isActive } = req.body;

    await pool.query(`
      UPDATE institutions
      SET name = COALESCE(?, name),
          university_name = COALESCE(?, university_name),
          code = COALESCE(?, code),
          location = COALESCE(?, location),
          institution_type = COALESCE(?, institution_type),
          website = COALESCE(?, website),
          is_active = COALESCE(?, is_active)
      WHERE id = ?
    `, [name, universityName, code ? code.toUpperCase() : null, location, institutionType, website, isActive, id]);

    res.json({
      success: true,
      message: 'Institution updated successfully.'
    });
  } catch (err) {
    next(err);
  }
}

export async function listExternalOpportunities(req, res, next) {
  try {
    const { status } = req.query;
    const conditions = ["os.source_type = 'EXTERNAL'"];
    const params = [];

    if (status && status !== 'ALL') {
      conditions.push('os.verification_status = ?');
      params.push(status.toUpperCase());
    }

    const [rows] = await pool.query(`
      SELECT pd.id, pd.drive_code, pd.title, pd.employment_type, pd.work_mode, pd.location,
             pd.status, pd.application_deadline, pd.created_at,
             jr.title as role_title, jr.career_domain, jr.preference_group, jr.compensation_min, jr.compensation_max,
             c.name as company_name, c.industry as company_industry,
             os.source_type, os.college_scope, os.official_url, os.listing_source,
             os.verification_status, os.last_verified_date, os.source_notes,
             u.email as verified_by_email
      FROM placement_drives pd
      JOIN job_roles jr ON pd.role_id = jr.id
      JOIN companies c ON jr.company_id = c.id
      JOIN opportunity_sources os ON pd.id = os.drive_id
      LEFT JOIN users u ON os.verified_by_user_id = u.id
      WHERE ${conditions.join(' AND ')}
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

export async function verifyExternalOpportunity(req, res, next) {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    await pool.query(`
      UPDATE opportunity_sources
      SET verification_status = 'VERIFIED',
          verified_by_user_id = ?,
          last_verified_date = CURRENT_DATE(),
          source_notes = COALESCE(?, source_notes)
      WHERE drive_id = ?
    `, [req.user.id, notes, id]);

    await pool.query(`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details_json)
      VALUES (?, 'VERIFY_EXTERNAL_OPPORTUNITY', 'opportunity_sources', ?, ?)
    `, [req.user.id, id, JSON.stringify({ status: 'VERIFIED', notes })]);

    res.json({
      success: true,
      message: 'External opportunity verified successfully.'
    });
  } catch (err) {
    next(err);
  }
}

export async function rejectExternalOpportunity(req, res, next) {
  try {
    const { id } = req.params;
    const { reason, status = 'EXPIRED' } = req.body;

    await pool.query(`
      UPDATE opportunity_sources
      SET verification_status = ?,
          verified_by_user_id = ?,
          source_notes = COALESCE(?, source_notes)
      WHERE drive_id = ?
    `, [status, req.user.id, reason, id]);

    // If marked expired/cancelled, update drive status
    await pool.query(`UPDATE placement_drives SET status = 'EXPIRED' WHERE id = ?`, [id]);

    await pool.query(`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details_json)
      VALUES (?, 'REJECT_EXTERNAL_OPPORTUNITY', 'opportunity_sources', ?, ?)
    `, [req.user.id, id, JSON.stringify({ status, reason })]);

    res.json({
      success: true,
      message: `External opportunity marked as ${status}.`
    });
  } catch (err) {
    next(err);
  }
}

export async function listAuditLogs(req, res, next) {
  try {
    const [rows] = await pool.query(`
      SELECT al.id, al.action, al.entity_type, al.entity_id, al.details_json, al.created_at,
             u.email, u.first_name, u.last_name, u.role
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 100
    `);

    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    next(err);
  }
}
