@echo off
echo MongoDB Atlas DNS Configuration - PERMANENT SOLUTION
echo =================================================

REM Check for administrator privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script must be run as Administrator!
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

echo Running as Administrator...

REM Clear DNS cache
echo Clearing DNS cache...
ipconfig /flushdns

REM Reset network components
echo Resetting network components...
netsh winsock reset
netsh int ip reset

REM Add MongoDB Atlas entries to hosts file
echo Adding MongoDB Atlas entries to hosts file...
echo # MongoDB Atlas Cluster0 - PERMANENT ENTRIES >> %SystemRoot%\System32\drivers\etc\hosts
echo 3.208.83.223    cluster0-shard-00-00.gfbrfcg.mongodb.net >> %SystemRoot%\System32\drivers\etc\hosts
echo 52.72.56.109    cluster0-shard-00-01.gfbrfcg.mongodb.net >> %SystemRoot%\System32\drivers\etc\hosts
echo 54.89.181.108   cluster0-shard-00-02.gfbrfcg.mongodb.net >> %SystemRoot%\System32\drivers\etc\hosts
echo 3.208.83.223    cluster0.gfbrfcg.mongodb.net >> %SystemRoot%\System32\drivers\etc\hosts
echo # End MongoDB Atlas entries >> %SystemRoot%\System32\drivers\etc\hosts

REM Configure DNS servers (requires PowerShell)
echo Configuring DNS servers...
powershell -Command "Get-NetAdapter | Where-Object {$_.Status -eq 'Up'} | ForEach-Object { Set-DnsClientServerAddress -InterfaceAlias $_.Name -ServerAddresses '8.8.8.8', '1.1.1.1' }"

echo.
echo PERMANENT DNS CONFIGURATION COMPLETE!
echo =====================================
echo - DNS servers configured permanently
echo - Hosts file updated with MongoDB Atlas IPs  
echo - DNS cache cleared and network reset
echo.
echo You can now start your Node.js server:
echo cd backend ^&^& node server.js
echo.
echo IMPORTANT: A system restart is recommended.
pause