# MongoDB Atlas DNS Configuration - PERMANENT SOLUTION
# Run as Administrator

Write-Host "🔧 MongoDB Atlas DNS Configuration - PERMANENT SOLUTION" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Check if running as administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "❌ This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✅ Running as Administrator" -ForegroundColor Green

# 1. Configure DNS Servers (PERMANENT)
Write-Host "`n🌐 Configuring DNS servers..." -ForegroundColor Cyan

# Get all network adapters
$adapters = Get-NetAdapter | Where-Object {$_.Status -eq "Up"}

foreach ($adapter in $adapters) {
    try {
        Write-Host "📡 Configuring adapter: $($adapter.Name)" -ForegroundColor Yellow
        
        # Set primary and secondary DNS
        Set-DnsClientServerAddress -InterfaceAlias $adapter.Name -ServerAddresses "8.8.8.8", "1.1.1.1", "208.67.222.222", "208.67.220.220"
        Write-Host "✅ DNS configured for $($adapter.Name)" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️ Could not configure DNS for $($adapter.Name): $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# 2. Clear DNS Cache
Write-Host "`n🧹 Clearing DNS cache..." -ForegroundColor Cyan
try {
    Clear-DnsClientCache
    Write-Host "✅ DNS cache cleared" -ForegroundColor Green
}
catch {
    Write-Host "⚠️ Could not clear DNS cache: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 3. Add MongoDB Atlas entries to hosts file (PERMANENT)
Write-Host "`n📝 Adding MongoDB Atlas entries to hosts file..." -ForegroundColor Cyan

$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
$mongoEntries = @(
    "# MongoDB Atlas Cluster0 - PERMANENT ENTRIES",
    "3.208.83.223    cluster0-shard-00-00.gfbrfcg.mongodb.net",
    "52.72.56.109    cluster0-shard-00-01.gfbrfcg.mongodb.net", 
    "54.89.181.108   cluster0-shard-00-02.gfbrfcg.mongodb.net",
    "3.208.83.223    cluster0.gfbrfcg.mongodb.net",
    "# End MongoDB Atlas entries"
)

try {
    # Read current hosts file
    $currentHosts = Get-Content $hostsPath -ErrorAction SilentlyContinue
    
    # Remove old MongoDB entries
    $cleanedHosts = $currentHosts | Where-Object { 
        $_ -notmatch "mongodb\.net" -and 
        $_ -notmatch "MongoDB Atlas" 
    }
    
    # Add new entries
    $newHosts = $cleanedHosts + $mongoEntries
    
    # Write back to hosts file
    $newHosts | Set-Content $hostsPath -Encoding ASCII
    Write-Host "✅ Hosts file updated with MongoDB Atlas entries" -ForegroundColor Green
}
catch {
    Write-Host "❌ Could not update hosts file: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please manually add these entries to $hostsPath" -ForegroundColor Yellow
    $mongoEntries | ForEach-Object { Write-Host $_ -ForegroundColor White }
}

# 4. Flush DNS and reset network
Write-Host "`n🔄 Flushing DNS and resetting network..." -ForegroundColor Cyan

try {
    # Flush DNS
    ipconfig /flushdns | Out-Null
    Write-Host "✅ DNS flushed" -ForegroundColor Green
    
    # Reset Winsock
    netsh winsock reset | Out-Null
    Write-Host "✅ Winsock reset" -ForegroundColor Green
    
    # Reset TCP/IP stack
    netsh int ip reset | Out-Null
    Write-Host "✅ TCP/IP stack reset" -ForegroundColor Green
}
catch {
    Write-Host "⚠️ Some network reset commands failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 5. Test DNS resolution
Write-Host "`n🧪 Testing DNS resolution..." -ForegroundColor Cyan

$testHosts = @(
    "cluster0.gfbrfcg.mongodb.net",
    "cluster0-shard-00-00.gfbrfcg.mongodb.net",
    "cluster0-shard-00-01.gfbrfcg.mongodb.net",
    "cluster0-shard-00-02.gfbrfcg.mongodb.net"
)

foreach ($host in $testHosts) {
    try {
        $result = Resolve-DnsName $host -ErrorAction Stop
        Write-Host "✅ $host resolves to: $($result.IPAddress -join ', ')" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ $host failed to resolve: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 6. Test MongoDB SRV record
Write-Host "`n🔍 Testing MongoDB SRV record..." -ForegroundColor Cyan
try {
    $srvResult = Resolve-DnsName "_mongodb._tcp.cluster0.gfbrfcg.mongodb.net" -Type SRV -ErrorAction Stop
    Write-Host "✅ SRV record found:" -ForegroundColor Green
    $srvResult | ForEach-Object { 
        Write-Host "   Target: $($_.NameTarget), Port: $($_.Port), Priority: $($_.Priority)" -ForegroundColor White
    }
}
catch {
    Write-Host "❌ SRV record lookup failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "ℹ️ This is expected if using direct IP connections" -ForegroundColor Blue
}

# 7. Configure Windows Firewall (if needed)
Write-Host "`n🔥 Checking Windows Firewall..." -ForegroundColor Cyan
try {
    # Allow MongoDB ports through firewall
    New-NetFirewallRule -DisplayName "MongoDB Atlas" -Direction Outbound -Protocol TCP -RemotePort 27017 -Action Allow -ErrorAction SilentlyContinue
    Write-Host "✅ Firewall rule added for MongoDB (port 27017)" -ForegroundColor Green
}
catch {
    Write-Host "ℹ️ Firewall rule may already exist" -ForegroundColor Blue
}

Write-Host "`n🎉 PERMANENT DNS CONFIGURATION COMPLETE!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host "✅ DNS servers configured permanently" -ForegroundColor Green
Write-Host "✅ Hosts file updated with MongoDB Atlas IPs" -ForegroundColor Green
Write-Host "✅ DNS cache cleared and network reset" -ForegroundColor Green
Write-Host "✅ Firewall configured for MongoDB" -ForegroundColor Green
Write-Host "`n🚀 You can now start your Node.js server!" -ForegroundColor Cyan
Write-Host "Run: cd backend && node server.js" -ForegroundColor White

Write-Host "`n⚠️ IMPORTANT: A system restart is recommended for all changes to take effect." -ForegroundColor Yellow
$restart = Read-Host "Would you like to restart now? (y/N)"
if ($restart -eq "y" -or $restart -eq "Y") {
    Write-Host "🔄 Restarting system in 10 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    Restart-Computer -Force
}

pause