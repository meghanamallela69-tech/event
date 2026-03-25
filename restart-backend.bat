@echo off
echo ========================================
echo   RESTARTING BACKEND SERVER
echo ========================================
echo.

echo [1/3] Stopping all Node.js processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✓ Node processes stopped
) else (
    echo ℹ No Node processes were running
)
echo.

timeout /t 2 /nobreak >nul

echo [2/3] Navigating to backend directory...
cd /d "%~dp0backend"
echo ✓ In backend directory: %CD%
echo.

echo [3/3] Starting backend server...
echo ========================================
echo.
npm start
