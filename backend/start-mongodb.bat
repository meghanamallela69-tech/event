@echo off
echo ========================================
echo   Starting MongoDB for Windows
echo ========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] This script must be run as Administrator!
    echo.
    echo Please right-click on this file and select "Run as administrator"
    pause
    exit /b 1
)

echo [INFO] Attempting to start MongoDB service...
echo.

REM Try to start MongoDB service
net start MongoDB >nul 2>&1

if %errorLevel% equ 0 (
    echo [SUCCESS] MongoDB service started successfully!
    echo.
    echo MongoDB is now running on: mongodb://127.0.0.1:27017
    echo Database: mern-stack-event-project
    echo.
    goto :test_connection
) else (
    echo [WARNING] Could not start MongoDB as a service.
    echo MongoDB might not be installed as a service.
    echo.
    
    REM Try to find MongoDB installation
    set "MONGO_PATH=C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
    
    if exist "%MONGO_PATH%" (
        echo [INFO] Found MongoDB installation at: %MONGO_PATH%
        echo.
        echo Starting MongoDB manually...
        echo Press Ctrl+C to stop MongoDB
        echo.
        
        REM Create data directory if it doesn't exist
        if not exist "C:\data\db" (
            echo [INFO] Creating data directory: C:\data\db
            mkdir "C:\data\db"
        )
        
        echo [INFO] Starting MongoDB with data path: C:\data\db
        echo.
        "%MONGO_PATH%" --dbpath "C:\data\db"
    ) else (
        echo [ERROR] MongoDB not found at default location!
        echo.
        echo Please install MongoDB from:
        echo https://www.mongodb.com/try/download/community
        echo.
        pause
        exit /b 1
    )
)

:test_connection
echo.
echo Testing database connection...
echo.
node scripts/checkDatabase.js
if %errorLevel% equ 0 (
    echo.
    echo ========================================
    echo   MongoDB is ready to use!
    echo ========================================
    echo.
    echo You can now start your backend server:
    echo   npm run dev
    echo.
) else (
    echo.
    echo ========================================
    echo   Database connection test failed!
    echo ========================================
    echo.
    echo Please check:
    echo 1. MongoDB is running
    echo 2. MONGO_URI in config.env is correct
    echo 3. Port 27017 is not blocked by firewall
    echo.
)

pause
