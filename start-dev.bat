@echo off
chcp 65001 > nul
echo ===============================================
echo  M's BASE Rental Development Server
echo ===============================================
echo.

echo [1/3] Checking project directory...
cd /d "%~dp0"
echo Current location: %CD%

echo.
echo [2/3] Checking Git status...
git status --short

echo.
echo [3/3] Starting development server...
echo Browser will open at http://localhost:3000
echo.
echo Admin access:
echo 1. Click "MB" logo 10 times
echo 2. Login: admin / admin123
echo.
echo Press Ctrl+C to stop the server
echo.

npm start