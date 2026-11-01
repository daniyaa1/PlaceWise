import pool from '../config/db.js';

export async function listNotifications(req, res, next) {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`
      SELECT id, title, message, type, related_entity_type, related_entity_id, read_at, created_at
      FROM notifications
      WHERE user_id = ? AND is_dismissed = 0
      ORDER BY created_at DESC
      LIMIT 50
    `, [userId]);

    const [unreadRows] = await pool.query(`
      SELECT COUNT(*) as unread_count
      FROM notifications
      WHERE user_id = ? AND is_dismissed = 0 AND read_at IS NULL
    `, [userId]);

    res.json({
      success: true,
      unreadCount: unreadRows[0].unread_count,
      data: rows
    });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.query(`
      UPDATE notifications
      SET read_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `, [id, userId]);

    res.json({
      success: true,
      message: 'Notification marked as read.'
    });
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    const userId = req.user.id;

    await pool.query(`
      UPDATE notifications
      SET read_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND read_at IS NULL
    `, [userId]);

    res.json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (err) {
    next(err);
  }
}

export async function dismissNotification(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.query(`
      UPDATE notifications
      SET is_dismissed = 1
      WHERE id = ? AND user_id = ?
    `, [id, userId]);

    res.json({
      success: true,
      message: 'Notification dismissed.'
    });
  } catch (err) {
    next(err);
  }
}

