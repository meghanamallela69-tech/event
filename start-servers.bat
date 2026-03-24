@echo off
echo ========================================
echo   Starting MERN Stack Event App
echo ========================================
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d %~dp0backend && node server.js"

timeout /t 3 >nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && node node_modules/vite/bin/vite.js"

echo.
echo ========================================
echo   Servers Started Successfully!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause