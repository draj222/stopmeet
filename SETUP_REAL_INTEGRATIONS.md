# 🚀 Real Google Calendar & Zoom Integration Setup

This guide will help you connect real Google Calendar and Zoom APIs instead of using simulation mode.

## 🎯 Quick Start (5 minutes to real data)

### Step 1: Create Environment File
Create `backend/.env` with this template:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/stopmeet"

# Server
PORT=3001
NODE_ENV=development
JWT_SECRET="your-super-secret-jwt-key"
FRONTEND_URL="http://localhost:3000"

# Google Calendar (REQUIRED for real meetings)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3001/api/auth/google/callback"

# Zoom (Optional - for enhanced data)
ZOOM_CLIENT_ID="your-zoom-client-id"
ZOOM_CLIENT_SECRET="your-zoom-client-secret"
ZOOM_REDIRECT_URI="http://localhost:3001/api/auth/zoom/callback"

# OpenAI (Optional - for AI features)
OPENAI_API_KEY="sk-proj-your-openai-key"
```

## 🔑 Getting API Keys

### 1. Google Calendar API (REQUIRED - 3 minutes)

**What it enables:** Real calendar sync, actual meeting data, attendee info

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/apis/credentials
   - Create new project or select existing

2. **Enable Google Calendar API**
   - Go to "APIs & Services" → "Library"
   - Search "Google Calendar API" → Enable

3. **Create OAuth Credentials**
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: "StopMeet Calendar Integration"
   - Authorized redirect URIs: `http://localhost:3001/api/auth/google/callback`

4. **Copy credentials to .env:**
   ```bash
   GOOGLE_CLIENT_ID="123456789.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="GOCSPX-your-secret-here"
   ```

### 2. Zoom API (Optional - 2 minutes)

**What it enables:** Meeting analytics, participant counts, engagement data

1. **Go to Zoom Marketplace**
   - Visit: https://marketplace.zoom.us/develop/create
   - Choose "OAuth" app type

2. **Configure OAuth App**
   - App name: "StopMeet Meeting Analytics"
   - Scopes needed: `meeting:read`, `user:read`
   - Redirect URI: `http://localhost:3001/api/auth/zoom/callback`

3. **Copy credentials to .env:**
   ```bash
   ZOOM_CLIENT_ID="your-zoom-client-id"
   ZOOM_CLIENT_SECRET="your-zoom-client-secret"
   ```

## 🎬 Testing Your Setup

### 1. Start the Application
```bash
cd stopmeet
npm run dev
```

### 2. Connect Google Calendar
1. Visit: http://localhost:3000
2. Click "View Dashboard" 
3. Go to "Settings"
4. Click "Connect Google Calendar"
5. Complete OAuth flow
6. Click "Sync Calendar"

### 3. Verify Real Data
- Check Dashboard for your actual meetings
- View Meetings page for real calendar events
- Generate agendas for upcoming meetings

## 🔧 Troubleshooting

### "Google Calendar not connected" Error
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- Check redirect URI matches exactly: `http://localhost:3001/api/auth/google/callback`
- Ensure Google Calendar API is enabled in your project

### "Authorization expired" Error
- The Google access token expired (normal after 1 hour)
- Click "Connect Google Calendar" again to refresh tokens
- This will happen automatically in production

### Still Seeing Demo Data?
- Check that `.env` file exists in `backend/` directory
- Restart the backend server after changing environment variables
- Look for "🎭 DEMO MODE" messages in backend console

## ⚡ Production Deployment Notes

### Environment Variables for Production
```bash
# Update these for production
NODE_ENV=production
FRONTEND_URL="https://your-domain.com"
GOOGLE_REDIRECT_URI="https://your-domain.com/api/auth/google/callback"
ZOOM_REDIRECT_URI="https://your-domain.com/api/auth/zoom/callback"
```

### Google OAuth Configuration
- Add production redirect URI in Google Cloud Console
- Update authorized domains if deploying to custom domain

### Security Considerations
- Use strong `JWT_SECRET` (256-bit random string)
- Store environment variables securely
- Enable HTTPS in production
- Consider token refresh logic for long-running sessions

## 🎯 Feature Matrix

| Feature | Demo Mode | Google Calendar | + Zoom |
|---------|-----------|-----------------|--------|
| Meeting List | ✅ Mock data | ✅ Real meetings | ✅ Enhanced data |
| Dashboard Metrics | ✅ Sample stats | ✅ Real ROI | ✅ Engagement metrics |
| Agenda Generation | ✅ AI agendas | ✅ Context-aware | ✅ Participant insights |
| Meeting Analytics | ❌ Limited | ✅ Full analysis | ✅ Advanced analytics |
| Calendar Sync | ❌ One-time | ✅ Real-time | ✅ Bi-directional |

## 📞 Support

If you encounter issues:

1. **Check the backend console** for error messages
2. **Verify API quotas** in Google Cloud Console  
3. **Test with a simple calendar event** first
4. **Check browser network tab** for API call failures

---

**🎉 Once connected, you'll see your real calendar data and can demo the platform with actual meetings!** 