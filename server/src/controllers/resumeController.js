import path from 'path';
import fs from 'fs';
import pool from '../config/db.js';

export async function uploadResumeFile(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No resume file uploaded.' });
    }

    const userId = req.user.id;
    const { originalname, filename, mimetype, size } = req.file;

    // Deactivate previous active resumes
    await pool.query('UPDATE resumes SET is_active = 0 WHERE user_id = ?', [userId]);

    const [result] = await pool.query(`
      INSERT INTO resumes (user_id, file_name, file_path, mime_type, file_size, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `, [userId, originalname, filename, mimetype, size]);

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully.',
      data: {
        id: result.insertId,
        fileName: originalname,
        fileSize: size,
        mimeType: mimetype,
        isActive: true,
        uploadedAt: new Date()
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function listResumes(req, res, next) {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`
      SELECT id, file_name, mime_type, file_size, is_active, uploaded_at
      FROM resumes
      WHERE user_id = ?
      ORDER BY uploaded_at DESC
    `, [userId]);

    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    next(err);
  }
}

export async function downloadResume(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT r.*, u.institution_id
      FROM resumes r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Resume not found.' });
    }

    const resume = rows[0];

    // Authorization: owner, or placement admin of same institution, or platform admin
    const isOwner = req.user.id === resume.user_id;
    const isInstitutionAdmin = req.user.role === 'PLACEMENT_ADMIN' && req.user.institution_id === resume.institution_id;
    const isPlatformAdmin = req.user.role === 'PLATFORM_ADMIN';

    if (!isOwner && !isInstitutionAdmin && !isPlatformAdmin) {
      return res.status(403).json({ success: false, error: 'Unauthorized to access this resume.' });
    }

    const filePath = path.resolve(process.cwd(), 'uploads/resumes', resume.file_path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Physical resume file not found on server.' });
    }

    res.setHeader('Content-Type', resume.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(resume.file_name)}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    next(err);
  }
}

export async function deleteResume(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [rows] = await pool.query('SELECT file_path FROM resumes WHERE id = ? AND user_id = ?', [id, userId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Resume not found or unauthorized.' });
    }

    const filePath = path.resolve(process.cwd(), 'uploads/resumes', rows[0].file_path);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Failed to remove physical file:', err);
      }
    }

    await pool.query('DELETE FROM resumes WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Resume deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
}

