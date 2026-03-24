@echo off
echo Stopping any existing Node.js processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Starting backend server...
node server.js