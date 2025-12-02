#!/bin/bash

# StemTrust Mock API Server Startup Script

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  Starting StemTrust Mock API Server      ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js found: $(node --version)"
echo ""

# Navigate to mock-server directory
cd mock-server

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "🚀 Starting server..."
echo ""

# Start the server
npm start
