import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import apiRoutes from './api';

// Load environment variables
dotenv.config();

// Initialize Prisma client
export const prisma = new PrismaClient();

// Create Express app
const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(helmet()); // Security headers

// CORS configuration for production and development
app.use(cors({
  origin: [
    'https://stopmeet-zoom-mvp.windsurf.build',
    'http://localhost:3000',
    process.env.FRONTEND_URL || ''
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type']
}));

app.use(express.json()); // Parse JSON request body
app.use(morgan('dev')); // Logging

// API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Database connection closed');
  process.exit(0);
});

export default app;
