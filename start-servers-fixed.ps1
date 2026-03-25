# ========================================
# PERMANENT FIX FOR CONNECTION REFUSED
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  STARTING SERVERS WITH PERMANENT FIX" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill all existing Node processes
Write-Host "[1/5] Stopping all Node.js processes..." -ForegroundColor Yellow
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3
Write-Host "✓ All Node processes stopped" -ForegroundColor Green

# Step 2: Clear DNS cache
Write-Host "[2/5] Clearing DNS cache..." -ForegroundColor Yellow
Clear-DnsClientCache -ErrorAction SilentlyContinue
Write-Host "✓ DNS cache cleared" -ForegroundColor Green

# Step 3: Verify ports are free
Write-Host "[3/5] Checking port availability..." -ForegroundColor Yellow
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue

if ($port5173) {
    Write-Host "⚠ Port 5173 is still in use. Waiting..." -ForegroundColor Red
    Start-Sleep -Seconds 2
} else {
    Write-Host "✓ Port 5173 is free" -ForegroundColor Green
}

if ($port5000) {
    Write-Host "⚠ Port 5000 is still in use. Waiting..." -ForegroundColor Red
    Start-Sleep -Seconds 2
} else {
    Write-Host "✓ Port 5000 is free" -ForegroundColor Green
}

# Step 4: Start Backend Server
Write-Host "[4/5] Starting Backend Server (Port 5000)..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; node server.js"
Start-Sleep -Seconds 5
Write-Host "✓ Backend server started" -ForegroundColor Green

# Step 5: Start Frontend Server
Write-Host "[5/5] Starting Frontend Server (Port 5173)..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev"
Start-Sleep -Seconds 5
Write-Host "✓ Frontend server started" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  SERVERS STARTED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test Page: http://localhost:5173/test-servers.html" -ForegroundColor Yellow
Write-Host ""
Write-Host "TIP: If you still see connection errors:" -ForegroundColor Magenta
Write-Host "  1. Press Ctrl+Shift+R to hard refresh" -ForegroundColor White
Write-Host "  2. Clear browser cache (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "  3. Check Windows Firewall settings" -ForegroundColor White
Write-Host ""
