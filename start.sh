#!/bin/bash

# StopMeet Development Startup Script
echo "🚀 Starting StopMeet Development Environment"
echo "============================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Function to install dependencies if node_modules doesn't exist
install_dependencies() {
    local dir=$1
    if [ ! -d "$dir/node_modules" ]; then
        echo "📦 Installing dependencies in $dir..."
        cd "$dir" && npm install
        cd ..
    else
        echo "✅ Dependencies already installed in $dir"
    fi
}

# Install backend dependencies
echo "🔧 Checking backend dependencies..."
install_dependencies "backend"

# Install frontend dependencies
echo "🔧 Checking frontend dependencies..."
install_dependencies "frontend"

# Check if .env file exists in backend
if [ ! -f "backend/.env" ]; then
    echo "⚙️  Creating backend .env file from template..."
    cp backend/env.example backend/.env
    echo "📝 Please configure your environment variables in backend/.env"
else
    echo "✅ Backend .env file exists"
fi

# Start backend in background
echo "🚀 Starting backend server (Port 3001)..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "🚀 Starting frontend development server (Port 3000)..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 StopMeet is starting up!"
echo "================================"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3001"
echo ""
echo "📊 Features Available:"
echo "  ✅ Phase 1: Calendar Audit & Cancellation Engine"
echo "  ✅ Phase 2: AI Agenda Generation (GPT-4)"
echo "  ✅ Phase 3: Meeting Analytics & Insights"
echo ""
echo "🔧 To stop all services:"
echo "  Press Ctrl+C or run: kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Function to handle cleanup
cleanup() {
    echo ""
    echo "🛑 Shutting down StopMeet services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

# Set up signal handling
trap cleanup SIGINT SIGTERM

# Wait for background processes
wait 