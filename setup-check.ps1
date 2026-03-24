#!/usr/bin/env powershell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   MERN Stack App Setup Checker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Host "✗ Node.js not found in PATH" -ForegroundColor Red
    Write-Host "  Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host ""
}

# Check npm
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "✓ npm found: $npmVersion" -ForegroundColor Green
    } else {
        throw "npm not found"
    }
} catch {
    Write-Host "✗ npm not found in PATH" -ForegroundColor Red
    Write-Host "  npm comes with Node.js installation" -ForegroundColor Yellow
    Write-Host ""
}

# Check MongoDB
Write-Host "Checking MongoDB installation..." -ForegroundColor Yellow
$mongoPath = "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
if (Test-Path $mongoPath) {
    Write-Host "✓ MongoDB found at: $mongoPath" -ForegroundColor Green
} else {
    Write-Host "✗ MongoDB not found at default location" -ForegroundColor Red
    Write-Host "  Please install MongoDB from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Next Steps" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "1. Install Node.js:" -ForegroundColor Yellow
    Write-Host "   - Go to https://nodejs.org/" -ForegroundColor White
    Write-Host "   - Download LTS version (recommended)" -ForegroundColor White
    Write-Host "   - Run installer and restart terminal" -ForegroundColor White
    Write-Host ""
}

if (-not (Test-Path $mongoPath)) {
    Write-Host "2. Install MongoDB:" -ForegroundColor Yellow
    Write-Host "   - Go to https://www.mongodb.com/try/download/community" -ForegroundColor White
    Write-Host "   - Download Community Server" -ForegroundColor White
    Write-Host "   - Install as Windows Service (recommended)" -ForegroundColor White
    Write-Host ""
}

Write-Host "3. After installation, restart PowerShell and run:" -ForegroundColor Yellow
Write-Host "   .\start-app.ps1" -ForegroundColor White
Write-Host ""

pause