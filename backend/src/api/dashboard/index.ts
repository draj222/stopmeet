import express from 'express';
import { getDashboardMetrics, getWeeklyStats } from './dashboard.controller';
import { authenticateUser } from '../../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all dashboard routes
router.use(authenticateUser);

// Dashboard routes
router.get('/metrics', getDashboardMetrics);
router.get('/weekly-stats', getWeeklyStats);

export default router;
