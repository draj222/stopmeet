import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../index';

/**
 * User registration
 */
export const register = async (req: Request, res: Response) => {
  const { email, name, password } = req.body;
  
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required' });
  }
  
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        name
        // In a real app, you would hash the password and store it
        // For MVP, we'll use Google/Zoom OAuth for simplicity
      }
    });
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

/**
 * User login
 */
export const login = async (req: Request, res: Response) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );
    
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

/**
 * User logout
 */
export const logout = (req: Request, res: Response) => {
  // For JWT, client just needs to discard the token
  // No server-side action required for simple logout
  res.status(200).json({ message: 'Logged out successfully' });
};

/**
 * Refresh JWT token
 */
export const refreshToken = (req: Request, res: Response) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }
  
  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    // Generate a new token
    const newToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );
    
    res.status(200).json({ token: newToken });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Get current user profile
 */
export const me = async (req: Request, res: Response) => {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
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
    
    // Return user profile
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        hasGoogleAuth: !!user.googleTokens,
        hasZoomAuth: !!user.zoomTokens
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};
