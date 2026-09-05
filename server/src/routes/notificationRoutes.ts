import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticateToken, getNotifications);
router.put('/read-all', authenticateToken, markAllAsRead);
router.put('/:id/read', authenticateToken, markAsRead);

export default router;
