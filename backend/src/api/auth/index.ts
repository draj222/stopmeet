import express from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../index';
import { googleAuth, googleCallback } from './google.controller';
import { zoomAuth, zoomCallback } from './zoom.controller';
import { register, login, logout, refreshToken, me } from './auth.controller';

const router = express.Router();

// Authentication routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.get('/me', me);

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Direct Zoom OAuth route for testing
router.get('/zoom-direct', (req, res) => {
  console.log('👍 DIRECT ZOOM AUTH TEST ROUTE HIT');
  
  // Redirect directly to Zoom OAuth consent screen
  const redirectUri = process.env.ZOOM_REDIRECT_URI || 'http://localhost:3001/api/auth/zoom/callback';
  const authUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${process.env.ZOOM_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  
  console.log('🚀 Redirecting to Zoom auth URL:', authUrl);
  res.redirect(authUrl);
});

// Zoom connection test endpoint
router.get('/zoom-status', async (req, res) => {
  // Get the token from the authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    // Verify the JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    // Find the user by ID
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user has Zoom tokens
    const hasZoom = !!user.zoomTokens;
    
    console.log(`🔍 Zoom status check for user ${user.id}: ${hasZoom ? 'Connected' : 'Not connected'}`);
    if (hasZoom) {
      console.log('🔑 Zoom tokens exist:', !!user.zoomTokens);
    }
    
    return res.status(200).json({ 
      zoomConnected: hasZoom,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Error checking Zoom status:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// Zoom OAuth routes
router.get('/zoom', (req, res) => {
  console.log('🔍 ZOOM AUTH ROUTE HIT:', req.url);
  console.log('🔑 Using Zoom credentials:', {
    clientId: process.env.ZOOM_CLIENT_ID ? 'Set' : 'Not set',
    clientSecret: process.env.ZOOM_CLIENT_SECRET ? 'Set' : 'Not set',
    redirectUri: process.env.ZOOM_REDIRECT_URI
  });
  zoomAuth(req, res);
});

router.get('/zoom/callback', (req, res) => {
  console.log('🔄 ZOOM CALLBACK ROUTE HIT:', req.url);
  console.log('📦 Query params:', req.query);
  zoomCallback(req, res);
});

export default router;
