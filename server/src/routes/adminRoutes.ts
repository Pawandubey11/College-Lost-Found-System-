import { Router } from 'express';
import {
  getAdminStats,
  getAdminUsers,
  updateUserRole,
  getAdminReports,
  getAdminClaims,
  getAdminAuditLogs
} from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all admin endpoints with authentication and 'admin' role check
router.use(authenticateToken);
router.use(requireRole(['admin']));

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.put('/users/:id/role', updateUserRole);
router.get('/reports', getAdminReports);
router.get('/claims', getAdminClaims);
router.get('/audit', getAdminAuditLogs);

export default router;
