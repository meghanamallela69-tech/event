@echo off
echo Cleaning npm environment...

REM Set a clean PATH without MongoDB
set "CLEAN_PATH=C:\Windows\system32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0\;C:\Program Files\nodejs\"

REM Temporarily use clean PATH
set "ORIGINAL_PATH=%PATH%"
set "PATH=%CLEAN_PATH%"

echo Installing npm dependencies with clean PATH...
npm install

REM Restore original PATH
set "PATH=%ORIGINAL_PATH%"

echo Done!
pause