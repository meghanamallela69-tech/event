@echo off
echo Setting up local MongoDB as fallback...
echo.

echo Checking if MongoDB is installed...
where mongod >nul 2>nul
if %errorlevel% neq 0 (
    echo MongoDB not found. Please install MongoDB Community Server from:
    echo https://www.mongodb.com/try/download/community
    echo.
    echo After installation, run this script again.
    pause
    exit /b 1
)

echo MongoDB found! Starting local MongoDB server...
echo.

echo Creating data directory...
if not exist "C:\data\db" mkdir "C:\data\db"

echo Starting MongoDB service...
net start MongoDB

echo.
echo Local MongoDB is now running on mongodb://localhost:27017
echo.
echo To use local MongoDB, update your config.env file:
echo MONGO_URI=mongodb://localhost:27017/eventhub
echo.
echo Press any key to continue...
pause