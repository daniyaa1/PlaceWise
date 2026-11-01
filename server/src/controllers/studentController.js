import pool from '../config/db.js';

export async function getProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const [profiles] = await pool.query(`
      SELECT sp.*, u.email, u.first_name, u.last_name, u.phone, u.institution_id,
             i.name as institution_name, i.code as institution_code,
             spref.preference_mode
      FROM student_profiles sp
      JOIN users u ON sp.user_id = u.id
      LEFT JOIN institutions i ON u.institution_id = i.id
      LEFT JOIN student_preferences spref ON u.id = spref.user_id
      WHERE sp.user_id = ?
    `, [userId]);

    if (profiles.length === 0) {
      return res.status(404).json({ success: false, error: 'Student profile not found.' });
    }

    const profile = profiles[0];
    try {
      profile.preferred_locations = typeof profile.preferred_locations === 'string'
        ? JSON.parse(profile.preferred_locations)
        : (profile.preferred_locations || []);
    } catch {
      profile.preferred_locations = [];
    }

    const [skills] = await pool.query(`
      SELECT s.id, s.name, s.category, ss.proficiency
      FROM student_skills ss
      JOIN skills s ON ss.skill_id = s.id
      WHERE ss.student_profile_id = ?
      ORDER BY s.name ASC
    `, [profile.id]);

    profile.skills = skills;

    res.json({
      success: true,
      data: profile
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const userId = req.user.id;
    const {
      firstName,
      lastName,
      phone,
      studentIdCode,
      degree,
      branch,
      graduationYear,
      cgpa,
      activeBacklogs,
      historicalBacklogs,
      preferredLocations,
      preferredWorkMode,
      bio,
      institutionId
    } = req.body;

    await conn.beginTransaction();

    // 1. Update user basic details
    await conn.query(`
      UPDATE users
      SET first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          phone = COALESCE(?, phone),
          institution_id = COALESCE(?, institution_id)
      WHERE id = ?
    `, [firstName, lastName, phone, institutionId, userId]);

    // 2. Update or insert student profile
    const locJson = preferredLocations ? JSON.stringify(preferredLocations) : null;
    await conn.query(`
      UPDATE student_profiles
      SET student_id_code = COALESCE(?, student_id_code),
          degree = COALESCE(?, degree),
          branch = COALESCE(?, branch),
          graduation_year = COALESCE(?, graduation_year),
          cgpa = COALESCE(?, cgpa),
          active_backlogs = COALESCE(?, active_backlogs),
          historical_backlogs = COALESCE(?, historical_backlogs),
          preferred_locations = COALESCE(?, preferred_locations),
          preferred_work_mode = COALESCE(?, preferred_work_mode),
          bio = COALESCE(?, bio)
      WHERE user_id = ?
    `, [
      studentIdCode, degree, branch, graduationYear, cgpa,
      activeBacklogs, historicalBacklogs, locJson, preferredWorkMode, bio,
      userId
    ]);

    await conn.commit();

    res.json({
      success: true,
      message: 'Profile updated successfully.'
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

export async function getPreferences(req, res, next) {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`
      SELECT preference_mode, updated_at
      FROM student_preferences
      WHERE user_id = ?
    `, [userId]);

    const mode = rows.length > 0 ? rows[0].preference_mode : 'OPEN_TO_ALL';

    res.json({
      success: true,
      data: {
        preferenceMode: mode,
        updatedAt: rows[0]?.updated_at || null
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function updatePreferences(req, res, next) {
  try {
    const userId = req.user.id;
    const { preferenceMode } = req.body;

    const validModes = ['TECHNICAL', 'NON_TECHNICAL', 'BOTH', 'OPEN_TO_ALL'];
    if (!validModes.includes(preferenceMode)) {
      return res.status(400).json({
        success: false,
        error: `Invalid preference mode. Permitted modes: ${validModes.join(', ')}`
      });
    }

    await pool.query(`
      INSERT INTO student_preferences (user_id, preference_mode)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE preference_mode = VALUES(preference_mode), updated_at = CURRENT_TIMESTAMP
    `, [userId, preferenceMode]);

    res.json({
      success: true,
      message: `Career preference successfully updated to ${preferenceMode}.`,
      preferenceMode
    });
  } catch (err) {
    next(err);
  }
}

export async function getSkillsCatalog(req, res, next) {
  try {
    const [allSkills] = await pool.query('SELECT id, name, category FROM skills ORDER BY category, name');
    res.json({
      success: true,
      data: allSkills
    });
  } catch (err) {
    next(err);
  }
}

export async function addStudentSkill(req, res, next) {
  try {
    const userId = req.user.id;
    const { skillId, skillName, category = 'PROGRAMMING', proficiency = 'INTERMEDIATE' } = req.body;

    const [profiles] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ?', [userId]);
    if (profiles.length === 0) {
      return res.status(404).json({ success: false, error: 'Student profile not found.' });
    }
    const profileId = profiles[0].id;

    let targetSkillId = skillId;
    if (!targetSkillId && skillName) {
      // Find or create skill
      const [existing] = await pool.query('SELECT id FROM skills WHERE name = ?', [skillName.trim()]);
      if (existing.length > 0) {
        targetSkillId = existing[0].id;
      } else {
        const [insertRes] = await pool.query('INSERT INTO skills (name, category) VALUES (?, ?)', [skillName.trim(), category]);
        targetSkillId = insertRes.insertId;
      }
    }

    await pool.query(`
      INSERT INTO student_skills (student_profile_id, skill_id, proficiency)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE proficiency = VALUES(proficiency)
    `, [profileId, targetSkillId, proficiency]);

    res.json({
      success: true,
      message: 'Skill added to student profile.'
    });
  } catch (err) {
    next(err);
  }
}

export async function removeStudentSkill(req, res, next) {
  try {
    const userId = req.user.id;
    const { skillId } = req.params;

    const [profiles] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ?', [userId]);
    if (profiles.length === 0) {
      return res.status(404).json({ success: false, error: 'Student profile not found.' });
    }

    await pool.query('DELETE FROM student_skills WHERE student_profile_id = ? AND skill_id = ?', [
      profiles[0].id,
      skillId
    ]);

    res.json({
      success: true,
      message: 'Skill removed successfully.'
    });
  } catch (err) {
    next(err);
  }
}

