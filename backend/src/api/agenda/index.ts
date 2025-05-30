import express from 'express';
import { generateAgenda, saveAgenda } from './agenda.controller';
import { authenticateUser } from '../../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all agenda routes
router.use(authenticateUser);

// Agenda generation routes
router.post('/generate', generateAgenda);
router.post('/save', saveAgenda);

export default router;
