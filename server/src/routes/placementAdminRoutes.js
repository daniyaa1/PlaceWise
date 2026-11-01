import express from 'express';
import {
  listInstitutionDrives,
  createDrive,
  publishDrive,
  cancelDrive,
  listDriveApplicants,
  listCompanies,
  createCompany
} from '../controllers/placementAdminController.js';
import { authGuard, requireRoles, institutionGuard } from '../middleware/auth.js';

const router = express.Router();

router.use(authGuard);
router.use(requireRoles('PLACEMENT_ADMIN', 'PLATFORM_ADMIN'));
router.use(institutionGuard);

router.get('/drives', listInstitutionDrives);
router.post('/drives', createDrive);
router.post('/drives/:id/publish', publishDrive);
router.post('/drives/:id/cancel', cancelDrive);
router.get('/drives/:id/applicants', listDriveApplicants);

router.get('/companies', listCompanies);
router.post('/companies', createCompany);

export default router;

