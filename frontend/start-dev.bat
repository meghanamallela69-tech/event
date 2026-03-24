@echo off
echo Starting frontend development server...
echo Attempting multiple methods to bypass MongoDB PATH conflicts...

REM Method 1: Try with clean PATH
echo Method 1: Clean PATH approach...
set "CLEAN_PATH=C:\Windows\system32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0\;C:\Program Files\nodejs\"
set "ORIGINAL_PATH=%PATH%"
set "PATH=%CLEAN_PATH%"

REM First try to install if node_modules is empty
if not exist "node_modules\vite" (
    echo Installing dependencies...
    npm install --no-optional --ignore-scripts
)

REM Try to start with clean PATH
if exist "node_modules\vite" (
    echo Starting with npm...
    npm run dev
    goto :end
)

REM Method 2: Try with npx
echo Method 2: Using npx...
npx vite
if %errorlevel% equ 0 goto :end

REM Method 3: Manual vite installation and run
echo Method 3: Manual approach...
npm install vite@latest --no-optional
if exist "node_modules\.bin\vite.cmd" (
    echo Running vite directly...
    node_modules\.bin\vite.cmd
    goto :end
)

:end
REM Restore original PATH
set "PATH=%ORIGINAL_PATH%"
echo Done!
pause