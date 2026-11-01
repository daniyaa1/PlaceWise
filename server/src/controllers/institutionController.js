import pool from '../config/db.js';

export async function listInstitutions(req, res, next) {
  try {
    const [rows] = await pool.query(`
      SELECT id, name, university_name, code, location, institution_type, website, is_active
      FROM institutions
      WHERE is_active = 1
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

export async function getInstitutionById(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT id, name, university_name, code, location, institution_type, website, is_active, created_at
      FROM institutions
      WHERE id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Institution not found.' });
    }

    // Also get drive count
    const [stats] = await pool.query(`
      SELECT COUNT(*) as active_drives_count
      FROM placement_drives
      WHERE institution_id = ? AND status = 'PUBLISHED'
    `, [id]);

    res.json({
      success: true,
      data: {
        ...rows[0],
        activeDrivesCount: stats[0].active_drives_count
      }
    });
  } catch (err) {
    next(err);
  }
}

