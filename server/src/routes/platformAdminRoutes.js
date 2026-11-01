import express from 'express';
import {
  createInstitution,
  updateInstitution,
  listExternalOpportunities,
  verifyExternalOpportunity,
  rejectExternalOpportunity,
  listAuditLogs
} from '../controllers/platformAdminController.js';
import { authGuard, requireRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authGuard);
router.use(requireRoles('PLATFORM_ADMIN'));

router.post('/institutions', createInstitution);
router.put('/institutions/:id', updateInstitution);

router.get('/external-opportunities', listExternalOpportunities);
router.post('/external-opportunities/:id/verify', verifyExternalOpportunity);
router.post('/external-opportunities/:id/reject', rejectExternalOpportunity);

router.get('/audit-logs', listAuditLogs);

export default router;

