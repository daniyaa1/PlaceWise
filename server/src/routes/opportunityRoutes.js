import express from 'express';
import {
  listOpportunities,
  getOpportunityById,
  checkOpportunityEligibility,
  getRecommendations,
  getSkillGaps
} from '../controllers/opportunityController.js';
import { authGuard } from '../middleware/auth.js';

const router = express.Router();

// Allow public or authenticated browsing
router.get('/', (req, res, next) => {
  // If authorization header present, run authGuard; otherwise allow anonymous listing
  if (req.headers.authorization) {
    return authGuard(req, res, next);
  }
  next();
}, listOpportunities);

router.get('/recommendations', authGuard, getRecommendations);
router.get('/skill-gaps', authGuard, getSkillGaps);

router.get('/:id', (req, res, next) => {
  if (req.headers.authorization) {
    return authGuard(req, res, next);
  }
  next();
}, getOpportunityById);

router.get('/:id/eligibility', authGuard, checkOpportunityEligibility);

export default router;

