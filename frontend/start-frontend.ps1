# PowerShell script to start frontend server without MongoDB PATH conflicts
Write-Host "Starting frontend development server..." -ForegroundColor Green
Write-Host "Using direct node command to avoid PATH conflicts" -ForegroundColor Yellow

# Start vite directly using node
node node_modules/vite/bin/vite.js