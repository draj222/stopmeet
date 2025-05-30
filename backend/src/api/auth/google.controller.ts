import { Request, Response } from 'express';
import { google } from 'googleapis';
import * as jwt from 'jsonwebtoken';
import { prisma } from '../../index';

// Function to check if running in demo mode (checked at runtime)
const isDemoMode = () => {
  return process.env.GOOGLE_CLIENT_ID === 'demo-client-id' || 
         process.env.DEMO_MODE === 'true' || 
         !process.env.GOOGLE_CLIENT_ID || 
         process.env.GOOGLE_CLIENT_ID === '';
};

// Function to get OAuth client (created on demand)
const getOAuth2Client = () => {
  if (isDemoMode()) {
    return null;
  }
  
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

// Scopes required for Google Calendar access
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

/**
 * Redirect to Google OAuth consent screen or handle demo mode
 */
export const googleAuth = (req: Request, res: Response) => {
  if (isDemoMode()) {
    // In demo mode, simulate successful authentication
    console.log('🎭 Demo Mode: Simulating Google OAuth flow');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // Create a demo user and token
    const demoEmail = 'demo@stopmeet.ai';
    const demoToken = jwt.sign(
      { userId: 'demo-user', email: demoEmail, demo: true },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );
    
    // Redirect to frontend with demo token
    res.redirect(`${frontendUrl}/auth/callback?token=${demoToken}&demo=true`);
    return;
  }

  // Real Google OAuth flow
  console.log('🔑 Real Google OAuth: Generating auth URL with client ID:', process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...');
  const oauth2Client = getOAuth2Client();
  
  if (!oauth2Client) {
    return res.status(500).json({ error: 'OAuth client not available' });
  }
  
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Will return a refresh token
    scope: SCOPES,
    prompt: 'consent' // Force consent to ensure refresh token is received
  });
  
  res.redirect(authUrl);
};

/**
 * Handle Google OAuth callback or demo mode callback
 */
export const googleCallback = async (req: Request, res: Response) => {
  console.log('🔍 CALLBACK DEBUG - Environment check:', { isDemoMode: isDemoMode(), hasClientId: !!process.env.GOOGLE_CLIENT_ID, hasCode: !!req.query.code });
  
  if (isDemoMode()) {
    // Demo mode callback - should not be reached normally
    console.log('🎭 Demo Mode: Google callback reached in demo mode');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}?demo=true`);
    return;
  }

  console.log('🔑 Real Google OAuth: Processing callback');
  const oauth2Client = getOAuth2Client();
  
  if (!oauth2Client) {
    console.error('❌ OAuth client not available');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const errorMessage = encodeURIComponent('OAuth client not available. Please try again.');
    return res.redirect(`${frontendUrl}/auth/callback?error=${errorMessage}`);
  }

  const { code } = req.query;
  console.log('🔍 Authorization code received:', code ? 'YES' : 'NO');
  
  if (!code) {
    console.error('❌ No authorization code provided');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const errorMessage = encodeURIComponent('Authorization code is required. Please try again.');
    return res.redirect(`${frontendUrl}/auth/callback?error=${errorMessage}`);
  }
  
  try {
    console.log('🔍 Attempting to exchange code for tokens...');
    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code as string);
    console.log('✅ Tokens received successfully');
    oauth2Client.setCredentials(tokens);
    
    console.log('🔍 Getting user info from Google...');
    // Get user info from Google
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2'
    });
    
    const userInfo = await oauth2.userinfo.get();
    console.log('✅ User info received:', userInfo.data.email);
    const email = userInfo.data.email;
    const name = userInfo.data.name;
    
    if (!email) {
      console.error('❌ No email in user info');
      return res.status(400).json({ error: 'Email is required' });
    }
    
    console.log('🔍 Finding or creating user in database...');
    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log('🔍 Creating new user...');
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name: name || '',
          googleTokens: JSON.stringify(tokens)
        }
      });
      console.log('✅ New user created with ID:', user.id);
    } else {
      console.log('🔍 Updating existing user...');
      // Update existing user with new tokens
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleTokens: JSON.stringify(tokens),
          name: name || user.name
        }
      });
      console.log('✅ User updated with ID:', user.id);
    }
    
    console.log('🔍 Generating JWT token...');
    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    const expiresInSeconds = 7 * 24 * 60 * 60; // 7 days in seconds
    const signOptions: jwt.SignOptions = { 
      expiresIn: expiresInSeconds
    };
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret,
      signOptions
    );
    console.log('✅ JWT token generated successfully');
    
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`;
    console.log('🔍 Redirecting to:', redirectUrl);
    
    // Redirect to frontend with token
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('❌ Google callback error:', error);
    
    // Instead of returning JSON error, redirect to frontend with error
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const errorMessage = encodeURIComponent('Failed to authenticate with Google. Please try again.');
    res.redirect(`${frontendUrl}/auth/callback?error=${errorMessage}`);
  }
};
