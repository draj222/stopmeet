import express from 'express';
import authRoutes from './auth';
import meetingRoutes from './meetings';
import summaryRoutes from './summaries';
import dashboardRoutes from './dashboard';
import agendaRoutes from './agenda';
import calendarRoutes from './calendar';

const router = express.Router();

// Test endpoint for demo verification
router.get('/test', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    demoMode: process.env.NODE_ENV === 'development',
    timestamp: new Date().toISOString()
  });
});

// Routes
router.use('/auth', authRoutes);
router.use('/meetings', meetingRoutes);
router.use('/summaries', summaryRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/agenda', agendaRoutes);
router.use('/calendar', calendarRoutes);

export default router;
