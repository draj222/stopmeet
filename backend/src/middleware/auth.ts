import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';

// Extend Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware to authenticate user using JWT
 */
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  // Development bypass - create demo user if no token provided
  if (!token && process.env.NODE_ENV === 'development') {
    console.log('🎭 DEMO MODE: Creating demo user for unauthenticated request');
    
    // Create or find demo user
    let demoUser = await prisma.user.findFirst({
      where: { email: 'demo@stopmeet.com' }
    });
    
    if (!demoUser) {
      demoUser = await prisma.user.create({
        data: {
          email: 'demo@stopmeet.com',
          name: 'Demo User',
          averageHourlyCost: 75
        }
      });
    }
    
    req.user = demoUser;
    return next();
  }
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    // Find user by ID
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Attach user to request object
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};
