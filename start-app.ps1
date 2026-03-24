#!/usr/bin/env powershell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Starting MERN Stack Event App" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
$nodeExists = Get-Command node -ErrorAction SilentlyContinue
$npmExists = Get-Command npm -ErrorAction SilentlyContinue

if (-not $nodeExists -or -not $npmExists) {
    Write-Host "❌ Node.js/npm not found!" -ForegroundColor Red
    Write-Host "Please run: .\setup-check.ps1 first" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✓ Node.js and npm found" -ForegroundColor Green
Write-Host ""

# Start MongoDB
Write-Host "Starting MongoDB..." -ForegroundColor Yellow
$mongoPath = "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"

if (Test-Path $mongoPath) {
    Write-Host "Found MongoDB at: $mongoPath" -ForegroundColor Green
    
    # Check if running as admin
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
    
    if ($isAdmin) {
        Write-Host "✓ Running as Administrator" -ForegroundColor Green
        Write-Host "Starting MongoDB service..." -ForegroundColor Yellow
        
        try {
            Start-Service MongoDB -ErrorAction Stop
            Write-Host "✓ MongoDB service started" -ForegroundColor Green
        } catch {
            Write-Host "Service not found, starting manually..." -ForegroundColor Yellow
            
            # Create data directory
            if (-not (Test-Path "C:\data\db")) {
                New-Item -ItemType Directory -Path "C:\data\db" -Force | Out-Null
                Write-Host "✓ Created data directory: C:\data\db" -ForegroundColor Green
            }
            
            Write-Host "Starting MongoDB manually..." -ForegroundColor Yellow
            Start-Process -FilePath $mongoPath -ArgumentList "--dbpath", "C:\data\db" -WindowStyle Minimized
            Start-Sleep 3
            Write-Host "✓ MongoDB started manually" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠️  Not running as Administrator" -ForegroundColor Yellow
        Write-Host "Attempting to start MongoDB service..." -ForegroundColor Yellow
        
        try {
            net start MongoDB 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ MongoDB service started" -ForegroundColor Green
            } else {
                throw "Service start failed"
            }
        } catch {
            Write-Host "❌ Cannot start MongoDB service without admin rights" -ForegroundColor Red
            Write-Host "Please run this script as Administrator or start MongoDB manually" -ForegroundColor Yellow
            pause
            exit 1
        }
    }
} else {
    Write-Host "❌ MongoDB not found!" -ForegroundColor Red
    Write-Host "Please install MongoDB first" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host ""

# Install dependencies if needed
Write-Host "Checking backend dependencies..." -ForegroundColor Yellow
Set-Location backend
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "Checking frontend dependencies..." -ForegroundColor Yellow
Set-Location ..\frontend
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Starting Servers" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Start backend
Write-Host "Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; npm run dev" -WindowStyle Normal

Start-Sleep 2

# Start frontend
Write-Host "Starting frontend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "✓ Servers starting..." -ForegroundColor Green
Write-Host ""
Write-Host "Backend will be available at: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend will be available at: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
pause