import express from 'express';
import {
  listNotifications,
  markAsRead,
  markAllAsRead,
  dismissNotification
} from '../controllers/notificationController.js';
import { authGuard } from '../middleware/auth.js';

const router = express.Router();

router.use(authGuard);

router.get('/', listNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', dismissNotification);

export default router;

