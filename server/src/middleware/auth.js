import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export async function authGuard(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'placewise_super_secret_jwt_key_2026_dev';

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch {
      return res.status(401).json({ success: false, error: 'Invalid or expired authentication token.' });
    }

    const [rows] = await pool.query(`
      SELECT u.id, u.email, u.role, u.first_name, u.last_name, u.institution_id, u.is_active,
             i.name as institution_name, i.code as institution_code
      FROM users u
      LEFT JOIN institutions i ON u.institution_id = i.id
      WHERE u.id = ?
    `, [decoded.id]);

    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, error: 'User account not found.' });
    }

    const user = rows[0];
    if (!user.is_active) {
      return res.status(403).json({ success: false, error: 'User account is deactivated.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('[AUTH_GUARD] Error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error during authentication.' });
  }
}

export function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}`
      });
    }
    next();
  };
}

export function institutionGuard(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }

  // Platform admin bypasses institution guard
  if (req.user.role === 'PLATFORM_ADMIN') {
    return next();
  }

  // Placement admin must have an institution assigned
  if (req.user.role === 'PLACEMENT_ADMIN' && !req.user.institution_id) {
    return res.status(403).json({
      success: false,
      error: 'Placement administrator is not associated with any institution.'
    });
  }

  next();
}
