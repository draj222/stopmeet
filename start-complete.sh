#!/bin/bash

# StopMeet - Complete Startup Script
# This script sets up and starts the complete StopMeet platform

set -e  # Exit on any error

echo "🚀 Starting StopMeet Platform Setup..."
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check for required tools
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Node.js version $NODE_VERSION is too old. Please install Node.js 16+ from https://nodejs.org/"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    # Check if PostgreSQL is running (optional)
    if ! command -v psql &> /dev/null; then
        print_warning "PostgreSQL not found. Using SQLite fallback for demo mode."
        USE_SQLITE=true
    else
        USE_SQLITE=false
    fi
    
    print_success "System requirements check completed"
}

# Setup backend environment
setup_backend() {
    print_status "Setting up backend environment..."
    
    cd backend
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_status "Creating backend .env file..."
        cat > .env << EOF
# Database Configuration
DATABASE_URL="file:./dev.db"

# Application Settings
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"

# JWT Configuration
JWT_SECRET="dev-secret-key-for-stopmeet-demo-12345"

# Security
ENCRYPTION_KEY="demo-32-character-encryption-key-abc"
RATE_LIMIT_MAX=1000
RATE_LIMIT_WINDOW_MS=900000

# Mock Data Configuration (for development/demo)
ENABLE_MOCK_DATA=true
MOCK_MEETING_COUNT=247
MOCK_COST_SAVINGS=23420
MOCK_EFFICIENCY_SCORE=78

# External API Keys (Optional - platform falls back to mock data when missing)
# Uncomment and add real keys for full functionality

# OpenAI Configuration (for AI features)
# OPENAI_API_KEY="your-openai-api-key"

# Google Calendar Integration
# GOOGLE_CLIENT_ID="your-google-client-id"
# GOOGLE_CLIENT_SECRET="your-google-client-secret"
# GOOGLE_REDIRECT_URI="http://localhost:3001/auth/google/callback"

# Slack Integration
# SLACK_BOT_TOKEN="xoxb-your-slack-bot-token"
# SLACK_SIGNING_SECRET="your-slack-signing-secret"
# SLACK_CLIENT_ID="your-slack-app-client-id"
# SLACK_CLIENT_SECRET="your-slack-app-client-secret"
EOF
        print_success "Backend .env file created"
    fi
    
    # Install dependencies
    if [ ! -d "node_modules" ]; then
        print_status "Installing backend dependencies..."
        npm install
        print_success "Backend dependencies installed"
    fi
    
    # Setup database
    print_status "Setting up database..."
    npx prisma generate
    npx prisma db push
    print_success "Database setup completed"
    
    # Seed demo data
    print_status "Seeding demo data..."
    npx ts-node src/scripts/seedDemoData.ts
    print_success "Demo data seeded"
    
    cd ..
}

# Setup frontend environment
setup_frontend() {
    print_status "Setting up frontend environment..."
    
    cd frontend
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_status "Creating frontend .env file..."
        cat > .env << EOF
REACT_APP_API_URL=http://localhost:3001/api
GENERATE_SOURCEMAP=false
EOF
        print_success "Frontend .env file created"
    fi
    
    # Install dependencies
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        npm install
        print_success "Frontend dependencies installed"
    fi
    
    cd ..
}

# Start services
start_services() {
    print_status "Starting services..."
    
    # Start backend in background
    print_status "Starting backend server on port 3001..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to start
    sleep 5
    
    # Check if backend is running
    if curl -s http://localhost:3001/health > /dev/null; then
        print_success "Backend server started successfully"
    else
        print_warning "Backend may be starting up, please wait..."
    fi
    
    # Start frontend
    print_status "Starting frontend server on port 3000..."
    cd frontend
    npm start &
    FRONTEND_PID=$!
    cd ..
    
    # Wait for frontend to start
    sleep 5
    
    print_success "Both services are starting up..."
    echo ""
    echo "🎉 StopMeet Platform is ready!"
    echo "================================"
    echo ""
    echo "📱 Frontend: http://localhost:3000"
    echo "🔌 Backend:  http://localhost:3001"
    echo "📊 Health:   http://localhost:3001/health"
    echo ""
    echo "Press Ctrl+C to stop all services"
    echo ""
    
    # Handle shutdown
    trap 'print_status "Shutting down services..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT
    
    # Keep script running
    wait
}

# Main execution
main() {
    clear
    echo "🎯 StopMeet - AI-Powered Meeting Governance Platform"
    echo "=================================================="
    echo ""
    
    check_requirements
    setup_backend
    setup_frontend
    start_services
}

# Run main function
main 