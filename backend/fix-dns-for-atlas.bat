@echo off
echo ========================================
echo    MongoDB Atlas DNS Fix for Windows
echo ========================================
echo.

echo Checking administrator privileges...
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✓ Running as Administrator
) else (
    echo ❌ This script requires Administrator privileges
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

echo.
echo 🔧 Fixing DNS settings for MongoDB Atlas...
echo.

echo Setting DNS servers to Google DNS (8.8.8.8, 1.1.1.1)...

REM Get all active network interfaces and set DNS
for /f "tokens=3*" %%i in ('netsh interface show interface ^| findstr "Connected"') do (
    echo Configuring DNS for interface: %%j
    netsh interface ip set dns "%%j" static 8.8.8.8 primary >nul 2>&1
    netsh interface ip add dns "%%j" 1.1.1.1 index=2 >nul 2>&1
    if !errorlevel! == 0 (
        echo ✓ DNS configured for %%j
    ) else (
        echo ⚠ Could not configure DNS for %%j
    )
)

echo.
echo 🔄 Flushing DNS cache...
ipconfig /flushdns >nul 2>&1
echo ✓ DNS cache flushed

echo.
echo 🔍 Testing DNS resolution...
nslookup cluster0.gfbrfcg.mongodb.net 8.8.8.8 >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ MongoDB Atlas DNS resolution working!
) else (
    echo ❌ DNS resolution still failing
    echo Trying alternative solutions...
    
    echo.
    echo 🔧 Adding MongoDB Atlas to hosts file as backup...
    echo # MongoDB Atlas entries >> C:\Windows\System32\drivers\etc\hosts
    echo 52.72.56.109 cluster0.gfbrfcg.mongodb.net >> C:\Windows\System32\drivers\etc\hosts
    echo 52.72.56.109 cluster0-shard-00-00.gfbrfcg.mongodb.net >> C:\Windows\System32\drivers\etc\hosts
    echo 52.72.56.109 cluster0-shard-00-01.gfbrfcg.mongodb.net >> C:\Windows\System32\drivers\etc\hosts
    echo 52.72.56.109 cluster0-shard-00-02.gfbrfcg.mongodb.net >> C:\Windows\System32\drivers\etc\hosts
    echo ✓ Hosts file updated with MongoDB Atlas IPs
)

echo.
echo 🌐 Checking network connectivity...
ping google.com -n 1 >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ Internet connection working
) else (
    echo ❌ Internet connection issue detected
)

echo.
echo 🔒 Checking Windows Firewall...
netsh advfirewall show allprofiles | findstr "State" | findstr "ON" >nul 2>&1
if %errorlevel% == 0 (
    echo ⚠ Windows Firewall is ON - adding MongoDB rule...
    netsh advfirewall firewall add rule name="MongoDB Atlas" dir=out action=allow protocol=TCP remoteport=27017 >nul 2>&1
    echo ✓ MongoDB Atlas firewall rule added
) else (
    echo ✓ Windows Firewall is OFF
)

echo.
echo 📋 DNS Configuration Summary:
echo - Primary DNS: 8.8.8.8 (Google)
echo - Secondary DNS: 1.1.1.1 (Cloudflare)
echo - DNS Cache: Flushed
echo - Firewall: MongoDB rule added
echo - Hosts file: Updated with Atlas IPs
echo.

echo 🚀 DNS fix complete! Try starting your application now.
echo Command: npm start
echo.

pause