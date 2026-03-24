# Advanced DNS Fix for MongoDB Atlas
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   MongoDB Atlas DNS Fix (Advanced)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check administrator privileges
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "❌ Administrator privileges required!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Running with Administrator privileges" -ForegroundColor Green
Write-Host ""

# Function to test DNS resolution
function Test-DNSResolution {
    param($hostname, $dnsServer)
    try {
        $result = Resolve-DnsName -Name $hostname -Server $dnsServer -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Step 1: Configure DNS servers
Write-Host "🔧 Step 1: Configuring DNS servers..." -ForegroundColor Yellow
$adapters = Get-NetAdapter | Where-Object {$_.Status -eq "Up" -and $_.Virtual -eq $false}

foreach ($adapter in $adapters) {
    Write-Host "  Configuring adapter: $($adapter.Name)" -ForegroundColor Cyan
    try {
        Set-DnsClientServerAddress -InterfaceAlias $adapter.Name -ServerAddresses "8.8.8.8", "1.1.1.1", "8.8.4.4", "1.0.0.1"
        Write-Host "  ✅ DNS servers set for $($adapter.Name)" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️ Failed to set DNS for $($adapter.Name): $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Step 2: Flush DNS cache
Write-Host ""
Write-Host "🔄 Step 2: Flushing DNS cache..." -ForegroundColor Yellow
Clear-DnsClientCache
ipconfig /flushdns | Out-Null
Write-Host "✅ DNS cache cleared" -ForegroundColor Green

# Step 3: Test basic connectivity
Write-Host ""
Write-Host "🌐 Step 3: Testing basic connectivity..." -ForegroundColor Yellow
if (Test-Connection -ComputerName "8.8.8.8" -Count 1 -Quiet) {
    Write-Host "✅ Internet connectivity working" -ForegroundColor Green
} else {
    Write-Host "❌ Internet connectivity issue" -ForegroundColor Red
}

# Step 4: Test DNS resolution
Write-Host ""
Write-Host "🔍 Step 4: Testing MongoDB Atlas DNS resolution..." -ForegroundColor Yellow
$mongoHost = "cluster0.gfbrfcg.mongodb.net"

$dnsServers = @("8.8.8.8", "1.1.1.1", "8.8.4.4", "1.0.0.1")
$dnsWorking = $false

foreach ($dns in $dnsServers) {
    Write-Host "  Testing with DNS server $dns..." -ForegroundColor Cyan
    if (Test-DNSResolution -hostname $mongoHost -dnsServer $dns) {
        Write-Host "  ✅ DNS resolution working with $dns" -ForegroundColor Green
        $dnsWorking = $true
        break
    } else {
        Write-Host "  ❌ DNS resolution failed with $dns" -ForegroundColor Red
    }
}

# Step 5: Configure Windows Firewall
Write-Host ""
Write-Host "🔒 Step 5: Configuring Windows Firewall..." -ForegroundColor Yellow
try {
    # Remove existing rule if it exists
    Remove-NetFirewallRule -DisplayName "MongoDB Atlas" -ErrorAction SilentlyContinue
    
    # Add new rule for MongoDB Atlas
    New-NetFirewallRule -DisplayName "MongoDB Atlas" -Direction Outbound -Protocol TCP -RemotePort 27017 -Action Allow | Out-Null
    Write-Host "✅ Windows Firewall rule added for MongoDB Atlas" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Could not configure firewall: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Step 6: Update hosts file if DNS still not working
if (-not $dnsWorking) {
    Write-Host ""
    Write-Host "🔧 Step 6: Adding MongoDB Atlas to hosts file..." -ForegroundColor Yellow
    
    $hostsFile = "$env:SystemRoot\System32\drivers\etc\hosts"
    $hostsEntries = @(
        "# MongoDB Atlas entries - Added by DNS fix script",
        "52.72.56.109 cluster0.gfbrfcg.mongodb.net",
        "52.72.56.109 cluster0-shard-00-00.gfbrfcg.mongodb.net", 
        "52.72.56.109 cluster0-shard-00-01.gfbrfcg.mongodb.net",
        "52.72.56.109 cluster0-shard-00-02.gfbrfcg.mongodb.net"
    )
    
    try {
        # Backup original hosts file
        Copy-Item $hostsFile "$hostsFile.backup" -Force
        
        # Add entries to hosts file
        Add-Content -Path $hostsFile -Value $hostsEntries
        Write-Host "✅ MongoDB Atlas entries added to hosts file" -ForegroundColor Green
        Write-Host "  Backup created: $hostsFile.backup" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Could not update hosts file: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Step 7: Disable IPv6 temporarily (can cause DNS issues)
Write-Host ""
Write-Host "🔧 Step 7: Optimizing network settings..." -ForegroundColor Yellow
try {
    # Prefer IPv4 over IPv6
    Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip6\Parameters" -Name "DisabledComponents" -Value 0x20 -Type DWord -Force
    Write-Host "✅ IPv4 preference configured" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Could not configure IPv4 preference" -ForegroundColor Yellow
}

# Final test
Write-Host ""
Write-Host "🧪 Final Test: Testing MongoDB Atlas connection..." -ForegroundColor Yellow
try {
    $testResult = & node -e "import mongoose from 'mongoose'; try { await mongoose.connect('mongodb+srv://meghana123:meghana1234@cluster0.gfbrfcg.mongodb.net/eventhub?retryWrites=true&w=majority&appName=Cluster0', {serverSelectionTimeoutMS: 5000}); console.log('SUCCESS'); await mongoose.disconnect(); } catch (error) { console.log('FAILED: ' + error.message); }" 2>$null
    
    if ($testResult -eq "SUCCESS") {
        Write-Host "🎉 MongoDB Atlas connection successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ MongoDB Atlas connection failed: $testResult" -ForegroundColor Red
        Write-Host ""
        Write-Host "Additional troubleshooting steps:" -ForegroundColor Yellow
        Write-Host "1. Restart your computer to apply all changes" -ForegroundColor Gray
        Write-Host "2. Disable VPN/Proxy temporarily" -ForegroundColor Gray
        Write-Host "3. Check with your ISP about DNS filtering" -ForegroundColor Gray
        Write-Host "4. Try connecting from a different network" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Could not test MongoDB connection" -ForegroundColor Red
}

Write-Host ""
Write-Host "📋 Configuration Summary:" -ForegroundColor Cyan
Write-Host "- DNS Servers: 8.8.8.8, 1.1.1.1, 8.8.4.4, 1.0.0.1" -ForegroundColor Gray
Write-Host "- DNS Cache: Cleared" -ForegroundColor Gray
Write-Host "- Firewall: MongoDB rule added" -ForegroundColor Gray
Write-Host "- Network: IPv4 optimized" -ForegroundColor Gray
if (-not $dnsWorking) {
    Write-Host "- Hosts File: MongoDB Atlas IPs added" -ForegroundColor Gray
}
Write-Host ""
Write-Host "🚀 DNS configuration complete!" -ForegroundColor Green
Write-Host "You can now start your application with: npm start" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to continue"