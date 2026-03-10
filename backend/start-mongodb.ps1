# MongoDB Quick Start Script for PowerShell
# Run this script to start MongoDB and test connection

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MongoDB Quick Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "[ERROR] This script must be run as Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please right-click on PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host "[INFO] Checking MongoDB service..." -ForegroundColor Yellow
Write-Host ""

# Try to start MongoDB service
try {
    $service = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
    
    if ($service) {
        if ($service.Status -eq "Running") {
            Write-Host "[SUCCESS] MongoDB service is already running!" -ForegroundColor Green
        } else {
            Write-Host "[INFO] Starting MongoDB service..." -ForegroundColor Yellow
            Start-Service -Name "MongoDB"
            Write-Host "[SUCCESS] MongoDB service started!" -ForegroundColor Green
        }
    } else {
        Write-Host "[WARNING] MongoDB service not found. Trying manual start..." -ForegroundColor Yellow
        Write-Host ""
        
        # Try to find MongoDB installation
        $mongoPath = "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
        
        if (Test-Path $mongoPath) {
            Write-Host "[INFO] Found MongoDB at: $mongoPath" -ForegroundColor Green
            Write-Host ""
            
            # Create data directory
            $dataDir = "C:\data\db"
            if (-not (Test-Path $dataDir)) {
                Write-Host "[INFO] Creating data directory: $dataDir" -ForegroundColor Yellow
                New-Item -ItemType Directory -Force -Path $dataDir | Out-Null
            }
            
            Write-Host "[INFO] Starting MongoDB manually..." -ForegroundColor Yellow
            Write-Host "Press Ctrl+C to stop MongoDB" -ForegroundColor Cyan
            Write-Host ""
            
            # Start MongoDB
            Start-Process -FilePath $mongoPath -ArgumentList "--dbpath `"$dataDir`"" -Wait
        } else {
            Write-Host "[ERROR] MongoDB not found!" -ForegroundColor Red
            Write-Host ""
            Write-Host "Please install MongoDB from:" -ForegroundColor Yellow
            Write-Host "https://www.mongodb.com/try/download/community" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Or use MongoDB Atlas (cloud):" -ForegroundColor Yellow
            Write-Host "https://www.mongodb.com/cloud/atlas" -ForegroundColor Cyan
            Write-Host ""
            pause
            exit 1
        }
    }
} catch {
    Write-Host "[ERROR] Failed to start MongoDB: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    pause
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing Database Connection" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test database connection
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
& node "$scriptPath\scripts\checkDatabase.js"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  MongoDB is ready!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now start your backend server:" -ForegroundColor Cyan
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  Connection test failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Wait 10 seconds and try again" -ForegroundColor White
    Write-Host "2. Check MONGO_URI in config.env" -ForegroundColor White
    Write-Host "3. Make sure port 27017 is not blocked" -ForegroundColor White
    Write-Host ""
}

pause
