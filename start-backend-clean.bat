@echo off
echo ====================================
echo Stopping All Node.js Processes
echo ====================================

:: Force kill all Node.js processes
taskkill /F /IM node.exe 2>nul

if %errorlevel% equ 0 (
    echo ✓ Successfully stopped all Node.js processes
) else (
    echo ✗ No Node.js processes were running
)

echo.
echo Waiting 2 seconds...
timeout /t 2 /nobreak >nul

echo.
echo ====================================
echo Starting Backend Server
echo ====================================

:: Navigate to backend directory and start
cd /d "%~dp0backend"
call npm start

pause
