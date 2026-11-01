import pool from '../config/db.js';

export async function createNotification({
  userId,
  title,
  message,
  type = 'SYSTEM',
  relatedEntityType = null,
  relatedEntityId = null
}) {
  try {
    const [result] = await pool.query(`
      INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [userId, title, message, type, relatedEntityType, relatedEntityId]);
    return result.insertId;
  } catch (err) {
    console.error('[NOTIFICATION_SERVICE] Failed to insert notification:', err);
    return null;
  }
}

export async function notifyUsersOfInstitution({
  institutionId,
  title,
  message,
  type = 'CAMPUS_DRIVE',
  relatedEntityType = null,
  relatedEntityId = null
}) {
  try {
    const [users] = await pool.query(`
      SELECT id FROM users WHERE institution_id = ? AND role = 'STUDENT' AND is_active = 1
    `, [institutionId]);

    for (const u of users) {
      await createNotification({
        userId: u.id,
        title,
        message,
        type,
        relatedEntityType,
        relatedEntityId
      });
    }
  } catch (err) {
    console.error('[NOTIFICATION_SERVICE] Batch institution notification error:', err);
  }
}

