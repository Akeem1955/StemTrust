@echo off
REM StemTrust Mock API Server Startup Script (Windows)

echo.
echo ╔══════════════════════════════════════════╗
echo ║  Starting StemTrust Mock API Server      ║
echo ╚══════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js found
node --version
echo.

REM Navigate to mock-server directory
cd mock-server

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    echo.
)

echo 🚀 Starting server...
echo.

REM Start the server
call npm start
