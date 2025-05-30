import express from 'express';
import { generateSummary, getSummaries, getSummaryById } from './summaries.controller';
import { authenticateUser } from '../../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all summary routes
router.use(authenticateUser);

// Summary routes
router.post('/generate', generateSummary);
router.get('/', getSummaries);
router.get('/:id', getSummaryById);

export default router;
