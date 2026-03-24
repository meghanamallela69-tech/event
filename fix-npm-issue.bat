@echo off
echo ========================================
echo   Fixing npm PowerShell Issues
echo ========================================
echo.

echo Setting PowerShell execution policy...
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force"

if %errorlevel% equ 0 (
    echo [SUCCESS] PowerShell execution policy updated!
) else (
    echo [INFO] Could not update execution policy automatically.
    echo Please run this command manually as Administrator:
    echo Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
)

echo.
echo ========================================
echo   Alternative: Use Command Prompt
echo ========================================
echo.
echo If PowerShell issues persist, use these commands in Command Prompt:
echo.
echo Backend:  cd backend ^&^& node server.js
echo Frontend: cd frontend ^&^& node node_modules/vite/bin/vite.js
echo.
echo Or simply run: start-servers.bat
echo.
pause