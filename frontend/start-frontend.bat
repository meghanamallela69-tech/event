@echo off
REM Remove MongoDB from PATH to avoid conflicts
set "PATH=%PATH:;C:\Program Files\MongoDB\Server\8.2\bin=%"

REM Start the frontend development server
echo Starting frontend development server...
npm run dev