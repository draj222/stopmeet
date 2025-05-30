import { Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { prisma } from '../../index';

/**
 * Redirect to Zoom OAuth consent screen
 */
export const zoomAuth = async (req: Request, res: Response) => {
  // Log all environment variables related to Zoom and demo mode
  console.log('🔎 Zoom Auth: Environment variables:');
  console.log('- DEMO_MODE:', process.env.DEMO_MODE);
  console.log('- ZOOM_CLIENT_ID:', process.env.ZOOM_CLIENT_ID ? 'Set (length: ' + process.env.ZOOM_CLIENT_ID.length + ')' : 'Not set');
  console.log('- ZOOM_REDIRECT_URI:', process.env.ZOOM_REDIRECT_URI);
  
  // Always check for demo mode first
  const isDemoMode = process.env.DEMO_MODE === 'true' || 
                     process.env.ZOOM_CLIENT_ID === 'demo-zoom-client' || 
                     !process.env.ZOOM_CLIENT_ID || 
                     process.env.ZOOM_CLIENT_ID === '';

  console.log('🔎 Zoom Auth: Demo mode check:', isDemoMode ? 'Enabled' : 'Disabled');

  if (isDemoMode) {
    // In demo mode, simulate successful authentication
    console.log('🎭 Demo Mode: Simulating Zoom OAuth flow');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // Create a demo user and token
    const demoEmail = 'demo@stopmeet.ai';
    const demoToken = jwt.sign(
      { userId: 'demo-user', email: demoEmail, demo: true, zoom: true },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );
    
    // Add demo Zoom data
    try {
      console.log('💾 Demo Mode: Setting up demo user with Zoom tokens');
      
      // Find or create the demo user
      const demoUser = await prisma.user.findFirst({
        where: { email: demoEmail }
      });
      
      if (demoUser) {
        // Create demo Zoom tokens
        const demoZoomTokens = {
          access_token: 'demo-zoom-token-' + Date.now(),
          refresh_token: 'demo-zoom-refresh-' + Date.now(),
          expires_in: 3600,
          token_type: 'bearer',
          scope: 'meeting:read user:read'
        };
        
        // Save demo tokens to the user
        await prisma.user.update({
          where: { id: demoUser.id },
          data: {
            zoomTokens: JSON.stringify(demoZoomTokens)
          }
        });
        
        console.log('✅ Demo Mode: Successfully saved demo Zoom tokens for user');
      }
    } catch (err) {
      console.error('Error setting up demo user:', err);
    }
    
    // Redirect to frontend with demo token and zoomConnected parameter
    console.log('🔄 Demo Mode: Redirecting to frontend with demo token');
    res.redirect(`${frontendUrl}/auth/callback?token=${demoToken}&demo=true&zoom=true&zoomConnected=true`);
    return;
  }

  // Log that we're attempting real Zoom authentication
  console.log('🔑 Real Zoom OAuth: Generating auth URL with client ID:', process.env.ZOOM_CLIENT_ID?.substring(0, 15) + '...');
  
  // Correct the redirect URI to match our actual backend port
  const redirectUri = process.env.ZOOM_REDIRECT_URI || 'http://localhost:3001/api/auth/zoom/callback';
  console.log('Using redirect URI:', redirectUri);
  
  const authUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${
    process.env.ZOOM_CLIENT_ID
  }&redirect_uri=${encodeURIComponent(redirectUri)}`;
  
  res.redirect(authUrl);
};

/**
 * Handle Zoom OAuth callback
 */
export const zoomCallback = async (req: Request, res: Response) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const authCode = req.query.code as string;
  const authError = req.query.error as string;
  
  // Log the callback being hit
  console.log('📥 Zoom callback received:', authError ? `Error: ${authError}` : 'Success');
  
  if (authError) {
    console.error('❌ Zoom OAuth error:', authError);
    return res.redirect(`${frontendUrl}/settings?error=${encodeURIComponent('Failed to connect to Zoom')}`);
  }
  
  if (!authCode) {
    console.error('❌ Zoom OAuth error: No authorization code received');
    return res.redirect(`${frontendUrl}/settings?error=${encodeURIComponent('No authorization code received from Zoom')}`);
  }
  
  // Check if running in demo mode
  const isDemoMode = process.env.ZOOM_CLIENT_ID === 'demo-zoom-client' || 
                     process.env.DEMO_MODE === 'true' || 
                     !process.env.ZOOM_CLIENT_ID || 
                     process.env.ZOOM_CLIENT_ID === '';

  if (isDemoMode) {
    // Demo mode callback - should not be reached normally
    console.log('🎭 Demo Mode: Zoom callback reached in demo mode');
    res.redirect(`${frontendUrl}?demo=true&zoom=true`);
    return;
  }
  
  try {
    // Exchange authorization code for tokens
    console.log('🔄 Exchanging Zoom authorization code for tokens...');
    const redirectUri = process.env.ZOOM_REDIRECT_URI || 'http://localhost:3001/api/auth/zoom/callback';
    
    const tokenResponse = await axios.post(
      'https://zoom.us/oauth/token',
      null,
      {
        params: {
          grant_type: 'authorization_code',
          code: authCode,
          redirect_uri: redirectUri
        },
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
          ).toString('base64')}`
        }
      }
    );
    
    const tokens = tokenResponse.data;
    console.log('✅ Successfully received Zoom tokens');
    
    // Get user info from Zoom
    console.log('👤 Fetching Zoom user profile...');
    const userResponse = await axios.get('https://api.zoom.us/v2/users/me', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`
      }
    });
    
    const zoomUser = userResponse.data;
    const email = zoomUser.email;
    
    if (!email) {
      console.error('❌ No email found in Zoom user profile');
      return res.redirect(`${frontendUrl}/settings?error=${encodeURIComponent('Failed to get email from Zoom')}`);
    }
    
    console.log('🔍 Looking for user with email:', email);
    
    // Find or create user
    let user = await prisma.user.findFirst({
      where: { email }
    });
    
    if (!user) {
      console.log('📝 Creating new user for:', email);
      user = await prisma.user.create({
        data: {
          email,
          name: zoomUser.first_name + ' ' + zoomUser.last_name,
          averageHourlyCost: 75 // Default hourly cost
        }
      });
    }
    
    // Update user with Zoom tokens
    console.log('🔒 Updating user with Zoom tokens');
    try {
      // Store the tokens as a JSON string since the database expects a string
      const tokenString = JSON.stringify(tokens);
      console.log('💾 Saving Zoom tokens to database for user:', user.id);
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          zoomTokens: tokenString
        }
      });
      
      console.log('✅ Zoom tokens saved successfully!');
    } catch (tokenError) {
      console.error('❌ Failed to save Zoom tokens:', tokenError);
      throw new Error('Failed to save Zoom credentials');
    }
    
    // Log successful connection
    console.log('💪 Successfully connected user with Zoom!');
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );
    
    console.log('🚀 Zoom authentication successful, redirecting to frontend');
    // Redirect to frontend with token and success message
    res.redirect(`${frontendUrl}/auth/callback?token=${token}&zoomConnected=true`);
  } catch (error: any) {
    console.error('❌ Zoom OAuth error:', error.message);
    const errorMessage = error.response?.data?.error || 'Authentication failed';
    res.redirect(`${frontendUrl}/settings?error=${encodeURIComponent(`Zoom connection failed: ${errorMessage}`)}`);
  }
};
