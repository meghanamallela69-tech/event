@echo off
echo ====================================
echo Starting Frontend on Port 5173
echo ====================================
echo.

:: Kill any process using port 5173
echo Checking port 5173...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173.*LISTENING') do (
    echo Killing process %%a on port 5173...
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 2 /nobreak >nul

:: Start frontend
echo Starting frontend server...
cd /d "%~dp0frontend"
npm run dev

pause
