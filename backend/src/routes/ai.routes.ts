import { Router } from 'express';
import { navigate } from '../controllers/ai.controller.js';
import { optionalAuthMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/navigate', optionalAuthMiddleware, navigate);

export default router;
