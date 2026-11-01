import express from 'express';
import {
  listApplications,
  createApplication,
  updateApplicationStatus
} from '../controllers/applicationController.js';
import { authGuard } from '../middleware/auth.js';

const router = express.Router();

router.use(authGuard);

router.get('/', listApplications);
router.post('/', createApplication);
router.put('/:id', updateApplicationStatus);

export default router;

