# Permanent Fix for Port 5000 Issue
# This script stops all Node processes and starts the backend cleanly

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Backend Server Manager" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop all Node.js processes
Write-Host "Stopping all Node.js processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "✓ Stopped all Node.js processes" -ForegroundColor Green
Start-Sleep -Seconds 2

# Step 2: Wait for port to be released
Write-Host "Waiting for port 5000 to be released..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Step 3: Check if port 5000 is still in use
$portInUse = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "✗ Port 5000 is still in use by another application" -ForegroundColor Red
    Write-Host "Please close any applications using port 5000" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Common culprits:" -ForegroundColor Yellow
    Write-Host "  - Another Node.js instance" -ForegroundColor Gray
    Write-Host "  - Windows IIS Admin Service" -ForegroundColor Gray
    Write-Host "  - Skype or other communication apps" -ForegroundColor Gray
    pause
    exit
} else {
    Write-Host "✓ Port 5000 is available" -ForegroundColor Green
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Starting Backend Server" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Step 4: Start the backend
Set-Location -Path "$PSScriptRoot\backend"
npm start

pause
