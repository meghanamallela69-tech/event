@echo off
echo Fixing DNS settings for MongoDB Atlas connection...
echo.

echo Setting DNS servers to Google DNS (8.8.8.8, 1.1.1.1)...
netsh interface ip set dns "Wi-Fi" static 8.8.8.8
netsh interface ip add dns "Wi-Fi" 1.1.1.1 index=2

echo Setting DNS servers for Ethernet connection...
netsh interface ip set dns "Ethernet" static 8.8.8.8
netsh interface ip add dns "Ethernet" 1.1.1.1 index=2

echo.
echo Flushing DNS cache...
ipconfig /flushdns

echo.
echo Testing DNS resolution...
nslookup cluster0.gfbrfcg.mongodb.net 8.8.8.8

echo.
echo DNS fix complete! Try running your application again.
echo If this doesn't work, try:
echo 1. Restart your computer
echo 2. Disable VPN/Proxy
echo 3. Check Windows Firewall settings
echo 4. Try connecting from a different network

pause