import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export async function register(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const {
      email,
      password,
      role = 'STUDENT',
      firstName,
      lastName,
      phone,
      institutionId,
      // Optional student fields if provided during registration
      studentIdCode,
      degree = 'B.Tech',
      branch,
      graduationYear,
      cgpa,
      activeBacklogs = 0,
      preferenceMode = 'OPEN_TO_ALL'
    } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, error: 'Email, password, first name, and last name are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    const validRoles = ['STUDENT', 'PLACEMENT_ADMIN'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid registration role.' });
    }

    // Check existing email
    const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: 'An account with this email address already exists.' });
    }

    await conn.beginTransaction();

    const passwordHash = await bcrypt.hash(password, 10);
    const instId = institutionId ? Number(institutionId) : null;

    const [userRes] = await conn.query(`
      INSERT INTO users (institution_id, email, password_hash, role, first_name, last_name, phone)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [instId, email.toLowerCase().trim(), passwordHash, role, firstName.trim(), lastName.trim(), phone || null]);

    const userId = userRes.insertId;

    if (role === 'STUDENT') {
      const idCode = studentIdCode || `PW-${Date.now().toString().slice(-6)}`;
      const yr = graduationYear ? Number(graduationYear) : 2026;
      const gpa = cgpa !== undefined && cgpa !== null ? parseFloat(cgpa) : 0.00;

      await conn.query(`
        INSERT INTO student_profiles (user_id, student_id_code, degree, branch, graduation_year, cgpa, active_backlogs)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [userId, idCode, degree, branch || 'CSE', yr, gpa, Number(activeBacklogs)]);

      await conn.query(`
        INSERT INTO student_preferences (user_id, preference_mode)
        VALUES (?, ?)
      `, [userId, preferenceMode]);
    }

    await conn.commit();

    const secret = process.env.JWT_SECRET || 'placewise_super_secret_jwt_key_2026_dev';
    const token = jwt.sign({ id: userId, role, email }, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: userId,
        email,
        role,
        firstName,
        lastName,
        institutionId: instId
      }
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const [rows] = await pool.query(`
      SELECT u.id, u.email, u.password_hash, u.role, u.first_name, u.last_name,
             u.institution_id, u.is_active,
             i.name as institution_name, i.code as institution_code
      FROM users u
      LEFT JOIN institutions i ON u.institution_id = i.id
      WHERE u.email = ?
    `, [email.toLowerCase().trim()]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const user = rows[0];
    if (!user.is_active) {
      return res.status(403).json({ success: false, error: 'This account has been deactivated.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const secret = process.env.JWT_SECRET || 'placewise_super_secret_jwt_key_2026_dev';
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    res.json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        institutionId: user.institution_id,
        institutionName: user.institution_name,
        institutionCode: user.institution_code
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const userId = req.user.id;

    let studentProfile = null;
    let preferenceMode = null;
    let profileCompletionPercentage = 100;

    if (req.user.role === 'STUDENT') {
      const [profiles] = await pool.query(`
        SELECT sp.*, u.email, u.first_name, u.last_name, u.phone,
               i.name as institution_name, i.code as institution_code
        FROM student_profiles sp
        JOIN users u ON sp.user_id = u.id
        LEFT JOIN institutions i ON u.institution_id = i.id
        WHERE sp.user_id = ?
      `, [userId]);

      if (profiles.length > 0) {
        studentProfile = profiles[0];
        try {
          studentProfile.preferred_locations = typeof studentProfile.preferred_locations === 'string'
            ? JSON.parse(studentProfile.preferred_locations)
            : (studentProfile.preferred_locations || []);
        } catch {
          studentProfile.preferred_locations = [];
        }

        // Fetch skills
        const [skills] = await pool.query(`
          SELECT s.id, s.name, s.category, ss.proficiency
          FROM student_skills ss
          JOIN skills s ON ss.skill_id = s.id
          WHERE ss.student_profile_id = ?
        `, [studentProfile.id]);
        studentProfile.skills = skills;

        // Fetch preferences
        const [prefs] = await pool.query(`SELECT preference_mode FROM student_preferences WHERE user_id = ?`, [userId]);
        preferenceMode = prefs.length > 0 ? prefs[0].preference_mode : 'OPEN_TO_ALL';

        // Compute completion score
        let score = 0;
        if (studentProfile.student_id_code) score += 15;
        if (studentProfile.degree && studentProfile.branch) score += 20;
        if (studentProfile.graduation_year) score += 15;
        if (studentProfile.cgpa && studentProfile.cgpa > 0) score += 20;
        if (skills.length > 0) score += 15;
        if (preferenceMode) score += 15;
        profileCompletionPercentage = score;
      }
    }

    res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        firstName: req.user.first_name,
        lastName: req.user.last_name,
        institutionId: req.user.institution_id,
        institutionName: req.user.institution_name,
        institutionCode: req.user.institution_code,
        profileCompletionPercentage,
        preferenceMode,
        studentProfile
      }
    });
  } catch (err) {
    next(err);
  }
}

