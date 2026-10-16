@echo off
title Auto Pro - Launching All Services
echo ===================================================
echo             AUTO PRO PLATFORM LAUNCHER
echo ===================================================
echo Starting Backend API, Customer Web Portal, and Admin Panel...
echo.

set ROOT_DIR=%~dp0

echo [1/3] Starting Backend API (Port 5000)...
start "Auto Pro - Backend API (5000)" cmd /k "cd /d "%ROOT_DIR%backend" && npm run dev"

echo [2/3] Starting Customer Web Portal (Port 5174)...
start "Auto Pro - Customer Web (5174)" cmd /k "cd /d "%ROOT_DIR%web" && npm run dev"

echo [3/3] Starting Admin Operations Portal (Port 5173)...
start "Auto Pro - Admin Dashboard (5173)" cmd /k "cd /d "%ROOT_DIR%admin" && npm run dev"

echo.
echo Waiting 5 seconds for services to initialize...
timeout /t 5 /nobreak >nul

echo Opening Customer Portal in default browser...
start http://localhost:5174

echo Opening Admin Portal in default browser...
start http://localhost:5173

echo.
echo ===================================================
echo   ALL SERVICES ARE NOW RUNNING!
echo   - Customer Portal: http://localhost:5174
echo   - Admin Dashboard: http://localhost:5173
echo   - Backend API:     http://localhost:5000
echo ===================================================
echo Do not close the opened service windows while testing.
pause
