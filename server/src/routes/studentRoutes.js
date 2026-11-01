import express from 'express';
import {
  getProfile,
  updateProfile,
  getPreferences,
  updatePreferences,
  getSkillsCatalog,
  addStudentSkill,
  removeStudentSkill
} from '../controllers/studentController.js';
import { authGuard, requireRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authGuard);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);
router.get('/skills-catalog', getSkillsCatalog);
router.post('/skills', requireRoles('STUDENT'), addStudentSkill);
router.delete('/skills/:skillId', requireRoles('STUDENT'), removeStudentSkill);

export default router;
