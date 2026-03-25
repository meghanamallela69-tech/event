@echo off
echo ========================================
echo   STARTING SERVERS - PERMANENT FIX
echo ========================================
echo.
echo [1/3] Stopping all Node.js processes...
taskkill /F /IM node.exe 2>nul
timeout /t 3 /nobreak >nul
echo.
echo [2/3] Starting Backend Server...
start "Backend Server" cmd /k "cd backend && node server.js"
timeout /t 5 /nobreak >nul
echo.
echo [3/3] Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"
timeout /t 5 /nobreak >nul
echo.
echo ========================================
echo   SERVERS STARTED SUCCESSFULLY!
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5000
echo Test Page: http://localhost:5173/test-servers.html
echo.
echo If you see connection errors:
echo   1. Press Ctrl+Shift+R (Hard Refresh)
echo   2. Clear browser cache
echo   3. Check Windows Firewall
echo.
pause
