import { Router } from 'express';
import { getCategories, getLocations } from '../controllers/masterController.js';

const router = Router();

router.get('/categories', getCategories);
router.get('/locations', getLocations);

export default router;
