import { Router } from 'express';
import { getItems, getItemById, createItemReport, getMyReports, updateItemStatus } from '../controllers/itemController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { uploadSingleImage } from '../middleware/uploadMiddleware.js';

const router = Router();

router.get('/', getItems);
router.get('/my-reports', authenticateToken, getMyReports);
router.get('/:id', getItemById);
router.post('/report', authenticateToken, uploadSingleImage.single('image'), createItemReport);
router.put('/:id/status', authenticateToken, updateItemStatus);

export default router;
