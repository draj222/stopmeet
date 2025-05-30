import { Router } from 'express';
import { authenticateUser } from '../../middleware/auth';
import { syncCalendar, getSyncStatus, refreshCalendar, debugCalendarSync } from './calendar.controller';

const router = Router();

// Apply authentication middleware to all calendar routes
router.use(authenticateUser);

/**
 * @route POST /api/calendar/sync
 * @desc Sync calendar events from Google Calendar
 * @access Private
 */
router.post('/sync', syncCalendar);

/**
 * @route GET /api/calendar/status
 * @desc Get calendar sync status
 * @access Private
 */
router.get('/status', getSyncStatus);

/**
 * @route POST /api/calendar/refresh
 * @desc Manually refresh calendar
 * @access Private
 */
router.post('/refresh', refreshCalendar);

/**
 * @route POST /api/calendar/debug
 * @desc Debug calendar sync
 * @access Private
 */
router.post('/debug', debugCalendarSync);

export default router; 