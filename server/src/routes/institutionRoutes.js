import express from 'express';
import { listInstitutions, getInstitutionById } from '../controllers/institutionController.js';

const router = express.Router();

router.get('/', listInstitutions);
router.get('/:id', getInstitutionById);

export default router;
