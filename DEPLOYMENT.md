# StopMeet Deployment Guide

> 🚀 **YC-Ready Enterprise Meeting Governance Platform**

This guide covers deployment options for StopMeet, from local development to production-ready enterprise deployments.

## 🏃‍♂️ Quick Start (Development)

### Prerequisites
- Node.js 18+ (LTS recommended)
- PostgreSQL 14+ (for production) or SQLite (for development)
- OpenAI API Key (for AI features)
- Google Workspace Admin Access (for calendar integration)
- Slack App Credentials (for bot integration)

### One-Command Setup

```bash
# Clone and start everything
git clone <repository-url>
cd stopmeet
./start.sh
```

The startup script will:
1. ✅ Install all dependencies
2. ⚙️ Set up environment configuration
3. 🚀 Start both frontend (port 3000) and backend (port 3001)
4. 📊 Enable all three phases of functionality

### Manual Setup

```bash
# Backend setup
cd backend
npm install
cp env.example .env
# Configure your environment variables in .env
npm run dev

# Frontend setup (in new terminal)
cd frontend
npm install
npm start
```

## 🔧 Environment Configuration

### Backend (.env)

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/stopmeet_dev"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"

# Google Calendar Integration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3001/auth/google/callback"

# OpenAI Configuration
OPENAI_API_KEY="your-openai-api-key"

# Slack Integration
SLACK_BOT_TOKEN="xoxb-your-slack-bot-token"
SLACK_SIGNING_SECRET="your-slack-signing-secret"
SLACK_CLIENT_ID="your-slack-app-client-id"
SLACK_CLIENT_SECRET="your-slack-app-client-secret"

# Application Configuration
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"

# Security
ENCRYPTION_KEY="your-32-character-encryption-key"
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
```

### Frontend (.env)

```bash
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENVIRONMENT=development
```

## 🏗️ Architecture Overview

### Backend Stack
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js with comprehensive middleware
- **Database**: PostgreSQL with Prisma ORM
- **AI Integration**: OpenAI GPT-4 for agenda generation and analysis
- **Calendar**: Google Calendar API with full sync capabilities
- **Bot**: Slack Bot API with slash commands and conversations
- **Authentication**: JWT with refresh tokens
- **Caching**: In-memory with Redis option
- **File Storage**: Local with S3 option

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI) v5 with custom theming
- **State Management**: React Query + Context API
- **Charts**: Chart.js with react-chartjs-2
- **Animations**: Framer Motion for smooth UX
- **Build Tool**: Create React App (CRA) with TypeScript

### Database Schema
```sql
-- Core Models
Users, Organizations, Meetings, Attendees
MeetingFlags, Summaries, Agendas, AuditResults
SlackInstallations, BotInteractions, WeeklyStats

-- Indexes optimized for:
-- - Meeting lookups by user and date range
-- - Audit result aggregations
-- - Cost calculation queries
-- - Performance analytics
```

## 📊 Feature Implementation Status

### ✅ Phase 1: Calendar Audit & Cancellation Engine
- **Backend**: Fully implemented with 7+ audit algorithms
- **Frontend**: Complete UI with real-time audit results
- **Integration**: Google Calendar sync and bulk operations
- **Status**: Production ready

**Key Algorithms:**
- Duplicate meeting detection
- Overbooked period identification
- Missing agenda flagging
- Oversized meeting analysis
- Back-to-back scheduling issues
- Recurring meeting fatigue detection
- Excessive duration warnings

### ✅ Phase 2: AI Agenda Generation
- **Backend**: GPT-4 integration with template system
- **Frontend**: Intuitive agenda builder with templates
- **Integration**: Slack bot with /agenda commands
- **Status**: Production ready

**Features:**
- Context-aware agenda generation
- Industry-specific templates
- Time-boxing and objective setting
- Multi-format export (Slack, email, calendar)

### ✅ Phase 3: Meeting Analytics & Insights
- **Backend**: Comprehensive analytics engine
- **Frontend**: Executive dashboards with drill-down
- **Integration**: Real-time sentiment tracking
- **Status**: MVP complete, enhancement ready

**Analytics:**
- Real-time ROI calculations
- Meeting efficiency scoring
- Cost breakdown analysis
- Productivity trend tracking

## 🚀 Production Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build -d

# Or individual containers
docker build -t stopmeet-backend ./backend
docker build -t stopmeet-frontend ./frontend

docker run -d -p 3001:3001 stopmeet-backend
docker run -d -p 3000:3000 stopmeet-frontend
```

### Cloud Platform Deployment

#### Heroku
```bash
# Backend
heroku create stopmeet-api
heroku addons:create heroku-postgresql:hobby-dev
git subtree push --prefix backend heroku main

# Frontend
heroku create stopmeet-app
heroku buildpacks:set mars/create-react-app
git subtree push --prefix frontend heroku main
```

#### AWS/Azure/GCP
- **Backend**: Container service (ECS/Container Apps/Cloud Run)
- **Frontend**: Static hosting (S3+CloudFront/Azure Static/Firebase)
- **Database**: Managed PostgreSQL (RDS/Azure Database/Cloud SQL)
- **Cache**: Managed Redis (ElastiCache/Azure Redis/Cloud Memorystore)

### Environment-Specific Configuration

#### Production
```bash
NODE_ENV=production
DATABASE_URL=postgresql://prod-connection-string
FRONTEND_URL=https://app.stopmeet.com
OPENAI_API_KEY=your-production-openai-key
# Enable all security features
ENABLE_RATE_LIMITING=true
ENABLE_CORS_PROTECTION=true
LOG_LEVEL=warn
```

#### Staging
```bash
NODE_ENV=staging
DATABASE_URL=postgresql://staging-connection-string
FRONTEND_URL=https://staging.stopmeet.com
# Enable debug features
LOG_LEVEL=debug
ENABLE_DEBUG_ROUTES=true
```

## 🔒 Security Configuration

### Authentication & Authorization
- JWT tokens with 15-minute expiry
- Refresh tokens with 7-day expiry
- Role-based access control (RBAC)
- API key authentication for integrations

### Data Protection
- Encryption at rest for sensitive data
- TLS 1.3 for data in transit
- Input validation and sanitization
- SQL injection protection via Prisma

### Compliance
- GDPR compliance for EU users
- SOC 2 compliance framework
- HIPAA compliance option for healthcare
- Enterprise SSO integration (SAML/OAuth)

## 📈 Monitoring & Analytics

### Application Monitoring
```bash
# Health check endpoints
GET /api/health          # Basic health
GET /api/health/detailed # Database, AI, integrations

# Metrics endpoints
GET /api/metrics         # Prometheus-compatible
GET /api/admin/stats     # Admin dashboard
```

### Performance Metrics
- Response time tracking
- Database query optimization
- Memory usage monitoring
- AI API usage tracking
- User engagement analytics

### Error Tracking
- Comprehensive error logging
- Real-time alert system
- Performance degradation detection
- Integration failure handling

## 🧪 Testing Strategy

### Backend Testing
```bash
cd backend
npm run test              # Unit tests
npm run test:integration  # Integration tests
npm run test:e2e         # End-to-end tests
npm run test:coverage    # Coverage report
```

### Frontend Testing
```bash
cd frontend
npm run test              # Component tests
npm run test:e2e         # Cypress tests
npm run test:accessibility # a11y tests
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy StopMeet
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Tests
        run: npm test
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Production
        run: ./scripts/deploy.sh
```

## 📊 Scaling Considerations

### Database Scaling
- Read replicas for analytics queries
- Partitioning for large meeting datasets
- Connection pooling for high concurrency
- Background job processing for AI analysis

### API Scaling
- Horizontal scaling with load balancers
- Caching layer for frequently accessed data
- Rate limiting to prevent abuse
- Queue system for background processing

### Frontend Scaling
- CDN for global distribution
- Code splitting for optimal loading
- Service worker for offline capabilities
- Progressive Web App (PWA) features

## 🆘 Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check Node.js version
node --version  # Should be 18+

# Check database connection
npm run db:status

# Check environment variables
npm run config:validate
```

#### Frontend Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript configuration
npm run type-check
```

#### Integration Issues
```bash
# Test Google Calendar API
curl -H "Authorization: Bearer $GOOGLE_TOKEN" \
  https://www.googleapis.com/calendar/v3/calendars/primary

# Test OpenAI API
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

### Performance Issues

#### Slow Dashboard Loading
- Check database query performance
- Verify analytics aggregation efficiency
- Monitor API response times
- Review caching strategy

#### AI Response Delays
- Check OpenAI API quota and limits
- Implement request queuing
- Add fallback responses
- Monitor token usage

## 📞 Support & Maintenance

### Regular Maintenance Tasks
- Database backup verification
- Security patch updates
- Performance monitoring review
- Cost optimization analysis

### Support Channels
- **Technical Issues**: GitHub Issues
- **Enterprise Support**: enterprise@stopmeet.com
- **Sales Inquiries**: sales@stopmeet.com
- **Security Reports**: security@stopmeet.com

---

## 🎯 Next Steps

After successful deployment:

1. **Configure Integrations**: Set up Google Workspace and Slack apps
2. **Import Calendar Data**: Run initial calendar sync
3. **Train AI Models**: Fine-tune with organization-specific data
4. **Set Up Monitoring**: Configure alerts and dashboards
5. **User Onboarding**: Deploy training materials and support

**Ready to transform how your organization meets?** 🚀

Contact our team for enterprise deployment assistance: [enterprise@stopmeet.com](mailto:enterprise@stopmeet.com) 