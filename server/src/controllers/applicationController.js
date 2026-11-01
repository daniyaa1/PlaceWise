import pool from '../config/db.js';
import { createNotification } from '../services/notificationService.js';

export async function listApplications(req, res, next) {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`
      SELECT a.id, a.drive_id, a.status, a.applied_at, a.notes,
             pd.title as drive_title, pd.employment_type, pd.work_mode, pd.location, pd.application_deadline,
             jr.title as role_title, jr.career_domain, jr.preference_group, jr.compensation_min, jr.compensation_max,
             c.name as company_name, c.industry as company_industry,
             os.source_type, os.official_url
      FROM applications a
      JOIN placement_drives pd ON a.drive_id = pd.id
      JOIN job_roles jr ON pd.role_id = jr.id
      JOIN companies c ON jr.company_id = c.id
      LEFT JOIN opportunity_sources os ON pd.id = os.drive_id
      WHERE a.student_id = ?
      ORDER BY a.applied_at DESC
    `, [userId]);

    // Attach status history to each application
    for (const app of rows) {
      const [history] = await pool.query(`
        SELECT ash.id, ash.old_status, ash.new_status, ash.reason, ash.created_at,
               u.first_name, u.last_name, u.role
        FROM application_status_history ash
        LEFT JOIN users u ON ash.changed_by_user_id = u.id
        WHERE ash.application_id = ?
        ORDER BY ash.created_at ASC
      `, [app.id]);
      app.statusHistory = history;
    }

    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    next(err);
  }
}

export async function createApplication(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const userId = req.user.id;
    const { driveId, status = 'APPLIED', notes } = req.body;

    if (!driveId) {
      return res.status(400).json({ success: false, error: 'Opportunity driveId is required.' });
    }

    // Check if drive exists and is published
    const [drives] = await conn.query(`
      SELECT pd.id, pd.title, pd.status, pd.application_deadline, c.name as company_name
      FROM placement_drives pd
      JOIN job_roles jr ON pd.role_id = jr.id
      JOIN companies c ON jr.company_id = c.id
      WHERE pd.id = ?
    `, [driveId]);

    if (drives.length === 0) {
      return res.status(404).json({ success: false, error: 'Opportunity not found.' });
    }

    const drive = drives[0];
    if (drive.status !== 'PUBLISHED') {
      return res.status(400).json({ success: false, error: 'Cannot apply: opportunity is not actively open.' });
    }

    // Check for duplicate application
    const [existing] = await conn.query(`
      SELECT id, status FROM applications WHERE student_id = ? AND drive_id = ?
    `, [userId, driveId]);

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: `Duplicate application: You have already recorded an application (${existing[0].status}) for this opportunity.`
      });
    }

    await conn.beginTransaction();

    const [appRes] = await conn.query(`
      INSERT INTO applications (student_id, drive_id, status, notes)
      VALUES (?, ?, ?, ?)
    `, [userId, driveId, status, notes || null]);

    const appId = appRes.insertId;

    // Record initial status history
    await conn.query(`
      INSERT INTO application_status_history (application_id, old_status, new_status, changed_by_user_id, reason)
      VALUES (?, NULL, ?, ?, ?)
    `, [appId, status, userId, 'Application initially submitted by student.']);

    await conn.commit();

    // Trigger notification
    await createNotification({
      userId,
      title: `Application Tracked: ${drive.company_name}`,
      message: `Your application for ${drive.title} has been logged with status: ${status}.`,
      type: 'APPLICATION_UPDATE',
      relatedEntityType: 'applications',
      relatedEntityId: appId
    });

    res.status(201).json({
      success: true,
      message: 'Application recorded successfully.',
      data: {
        id: appId,
        driveId,
        status,
        appliedAt: new Date()
      }
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

export async function updateApplicationStatus(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    const { status, reason, notes } = req.body;
    const userId = req.user.id;

    const validStatuses = ['INTERESTED', 'APPLIED', 'ASSESSMENT', 'INTERVIEW', 'SELECTED', 'REJECTED', 'WITHDRAWN'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status. Valid values: ${validStatuses.join(', ')}` });
    }

    const [apps] = await conn.query(`
      SELECT a.*, pd.title as drive_title, c.name as company_name, u.institution_id
      FROM applications a
      JOIN placement_drives pd ON a.drive_id = pd.id
      JOIN job_roles jr ON pd.role_id = jr.id
      JOIN companies c ON jr.company_id = c.id
      JOIN users u ON a.student_id = u.id
      WHERE a.id = ?
    `, [id]);

    if (apps.length === 0) {
      return res.status(404).json({ success: false, error: 'Application record not found.' });
    }

    const app = apps[0];

    // Authorization:
    // If STUDENT, can only update own application to WITHDRAWN or INTERESTED/APPLIED.
    // If PLACEMENT_ADMIN, must belong to same institution.
    if (req.user.role === 'STUDENT') {
      if (app.student_id !== userId) {
        return res.status(403).json({ success: false, error: 'Unauthorized to modify this application.' });
      }
      if (status !== 'WITHDRAWN' && status !== 'APPLIED' && status !== 'INTERESTED') {
        return res.status(403).json({ success: false, error: 'Students can only mark applications as Interested, Applied, or Withdrawn.' });
      }
    } else if (req.user.role === 'PLACEMENT_ADMIN') {
      if (req.user.institution_id !== app.institution_id) {
        return res.status(403).json({ success: false, error: 'Cannot update student application from a different institution.' });
      }
    }

    await conn.beginTransaction();

    await conn.query(`
      UPDATE applications
      SET status = ?, notes = COALESCE(?, notes)
      WHERE id = ?
    `, [status, notes, id]);

    await conn.query(`
      INSERT INTO application_status_history (application_id, old_status, new_status, changed_by_user_id, reason)
      VALUES (?, ?, ?, ?, ?)
    `, [id, app.status, status, userId, reason || `Status updated to ${status}`]);

    await conn.commit();

    // Notify student if changed by admin
    if (req.user.id !== app.student_id) {
      await createNotification({
        userId: app.student_id,
        title: `Status Update: ${app.company_name}`,
        message: `Your application for ${app.drive_title} has transitioned to: ${status}. ${reason ? `Note: ${reason}` : ''}`,
        type: 'APPLICATION_UPDATE',
        relatedEntityType: 'applications',
        relatedEntityId: Number(id)
      });
    }

    res.json({
      success: true,
      message: `Application status updated to ${status}.`
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}
