import { Router } from 'express';
import { submitClaim, getMyClaims, getReceivedClaims, processClaimDecision } from '../controllers/claimController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/item/:itemId', authenticateToken, submitClaim);
router.get('/my-claims', authenticateToken, getMyClaims);
router.get('/received', authenticateToken, getReceivedClaims);
router.put('/:claimId/decision', authenticateToken, processClaimDecision);

export default router;
