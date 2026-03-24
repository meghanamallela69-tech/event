@echo off
echo ========================================
echo   MERN Stack App Quick Setup
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found!
    echo.
    echo Please install Node.js:
    echo 1. Go to https://nodejs.org/
    echo 2. Download LTS version
    echo 3. Run installer
    echo 4. Restart this terminal
    echo.
    pause
    exit /b 1
) else (
    echo [SUCCESS] Node.js found!
    node --version
)

echo.
echo Checking npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm not found!
    pause
    exit /b 1
) else (
    echo [SUCCESS] npm found!
    npm --version
)

echo.
echo ========================================
echo   Installing Dependencies
echo ========================================

echo.
echo Installing backend dependencies...
cd backend
if not exist node_modules (
    npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Backend dependency installation failed!
        pause
        exit /b 1
    )
) else (
    echo Backend dependencies already installed.
)

echo.
echo Installing frontend dependencies...
cd ..\frontend
if not exist node_modules (
    npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Frontend dependency installation failed!
        pause
        exit /b 1
    )
) else (
    echo Frontend dependencies already installed.
)

cd ..

echo.
echo ========================================
echo   Starting MongoDB
echo ========================================

echo Checking MongoDB...
set "MONGO_PATH=C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
if exist "%MONGO_PATH%" (
    echo [SUCCESS] MongoDB found!
    
    echo Starting MongoDB service...
    net start MongoDB >nul 2>&1
    if %errorlevel% equ 0 (
        echo [SUCCESS] MongoDB service started!
    ) else (
        echo [INFO] Starting MongoDB manually...
        if not exist "C:\data\db" mkdir "C:\data\db"
        start "MongoDB" "%MONGO_PATH%" --dbpath "C:\data\db"
        timeout /t 3 >nul
        echo [SUCCESS] MongoDB started manually!
    )
) else (
    echo [ERROR] MongoDB not found!
    echo Please install MongoDB from: https://www.mongodb.com/try/download/community
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Starting Servers
echo ========================================

echo Starting backend server...
start "Backend Server" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 2 >nul

echo Starting frontend server...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo   Servers Started!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause