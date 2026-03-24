# Frontend Port 5173 Configuration

## Changes Made

### 1. Updated package.json
**File:** `frontend/package.json`
```json
"scripts": {
  "dev": "vite --port 5173",
  // ... other scripts
}
```
- Added explicit `--port 5173` flag to the dev script
- Ensures npm run dev always uses port 5173

### 2. Enhanced vite.config.js
**File:** `frontend/vite.config.js`
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    strictPort: true, // Fail if port 5173 is not available
    open: false
  }
})
```
- Added `strictPort: true` - Vite will fail if port 5173 is occupied
- Added `open: false` - Prevents auto-opening browser
- Ensures consistent port usage

### 3. Created Helper Scripts

#### Batch File: `frontend/start-5173.bat`
```batch
@echo off
echo Starting frontend on port 5173...
cd /d "%~dp0"
npm run dev
pause
```

#### PowerShell Script: `frontend/start-5173.ps1`
```powershell
Write-Host "Starting frontend on port 5173..." -ForegroundColor Green
Set-Location $PSScriptRoot
npm run dev
```

## How to Start Frontend on Port 5173

### Method 1: npm command (Recommended)
```bash
cd frontend
npm run dev
```

### Method 2: Direct vite command
```bash
cd frontend
npx vite --port 5173
```

### Method 3: Using helper scripts
```bash
# Windows Batch
frontend/start-5173.bat

# PowerShell
frontend/start-5173.ps1
```

### Method 4: Node command (if npm issues)
```bash
cd frontend
node node_modules/vite/bin/vite.js --port 5173
```

## Configuration Benefits

1. **Consistent Port**: Always uses port 5173, never auto-increments
2. **Strict Mode**: Fails if port 5173 is occupied (prevents confusion)
3. **Multiple Start Options**: Various ways to start the server
4. **No Auto-Browser**: Doesn't automatically open browser windows

## Verification

✅ **Frontend URL**: http://localhost:5173/
✅ **Network Access**: http://[your-ip]:5173/
✅ **Port Locked**: Will not use alternative ports
✅ **Fast Startup**: Optimized Vite configuration

## Troubleshooting

### If Port 5173 is Occupied:
1. Check what's using the port:
   ```bash
   netstat -ano | findstr :5173
   ```

2. Kill the process:
   ```bash
   taskkill /PID [process-id] /F
   ```

3. Or use a different terminal/command prompt

### If npm run dev fails:
Use the direct node command:
```bash
cd frontend
node node_modules/vite/bin/vite.js --port 5173
```

The frontend is now configured to run exclusively on port 5173!