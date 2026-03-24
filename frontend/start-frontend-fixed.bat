@echo off
echo Starting Frontend Development Server...
echo Using global vite with simple config on port 5173
echo.

REM Kill any existing process on port 5173
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do taskkill /PID %%a /F 2>nul

REM Use global vite with simple config
vite --config vite.config.simple.js

pause