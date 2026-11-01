import express from 'express';
import {
  uploadResumeFile,
  listResumes,
  downloadResume,
  deleteResume
} from '../controllers/resumeController.js';
import { authGuard, requireRoles } from '../middleware/auth.js';
import { uploadResume } from '../services/storageService.js';

const router = express.Router();

router.use(authGuard);

router.post('/upload', requireRoles('STUDENT'), uploadResume.single('resume'), uploadResumeFile);
router.get('/', listResumes);
router.get('/:id/download', downloadResume);
router.delete('/:id', requireRoles('STUDENT'), deleteResume);

export default router;
