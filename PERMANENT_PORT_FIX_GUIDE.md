# Permanent Solution for Port 5000 Error

## 🔴 The Problem

**Error:** `listen EADDRINUSE: address already in use :::5000`

This happens when:
1. A previous Node.js process is still running in the background
2. Another application is using port 5000
3. The server didn't shut down properly

## ✅ Permanent Solutions

### Solution 1: Quick Fix (Use This Script) ⭐ RECOMMENDED

I've created two scripts for you:

#### **Option A: PowerShell Script (Best)**
```powershell
.\start-backend-fixed.ps1
```

**What it does:**
1. Stops ALL Node.js processes
2. Waits for port to be released
3. Checks if port 5000 is available
4. Starts backend cleanly

#### **Option B: Batch Script**
```cmd
.\start-backend-clean.bat
```

**What it does:**
1. Force kills all Node.js processes
2. Starts backend server

---

### Solution 2: Manual Fix (One-Time)

**Step 1: Find and kill the process**

Open PowerShell as Administrator and run:
```powershell
# Find process using port 5000
Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object OwningProcess -Unique

# Kill all Node.js processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

**Step 2: Verify port is free**
```powershell
# Check if port 5000 is now available
Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
# Should return nothing if port is free
```

**Step 3: Start backend**
```powershell
cd backend
npm start
```

---

### Solution 3: Change Backend Port (Alternative)

If you frequently have port conflicts, change the default port:

**Edit `backend/server.js`:**
```javascript
// Change from 5000 to 5001
const PORT = process.env.PORT || 5001;  // ← Changed to 5001
```

**Update frontend API calls:**
- Search for `http://localhost:5000` 
- Replace with `http://localhost:5001`

---

## 🛠️ Prevention Strategies

### 1. Always Use Scripts
From now on, **always use** the scripts I created:
- `start-backend-fixed.ps1` (PowerShell)
- `start-backend-clean.bat` (Command Prompt)

These scripts automatically clean up before starting.

### 2. Proper Shutdown
When stopping the server:
- Press `Ctrl + C` in the terminal
- Wait for "Server stopped" message
- Don't just close the terminal window

### 3. Check Before Starting
Before starting backend, check if port is in use:
```powershell
Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
```

If you see output, port is busy. Run the cleanup script first.

### 4. Task Manager Cleanup
If scripts don't work:
1. Press `Ctrl + Shift + Esc` (Task Manager)
2. Go to "Details" tab
3. Find all `node.exe` processes
4. Right-click → "End Task"
5. Repeat for each node process

---

## 📋 Quick Reference Commands

### Windows PowerShell
```powershell
# Kill all Node.js processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Check what's using port 5000
Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue

# Kill process by PID (replace 12345 with actual PID)
Stop-Process -Id 12345 -Force
```

### Command Prompt (CMD)
```cmd
:: Find process using port 5000
netstat -ano | findstr :5000

:: Kill process by PID (replace 12345)
taskkill /PID 12345 /F

:: Kill all Node.js processes
taskkill /F /IM node.exe
```

### Linux/Mac (if needed)
```bash
# Find process on port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or kill all node processes
pkill -f node
```

---

## 🚀 How to Use the Scripts

### Daily Workflow (Recommended)

**Morning - Starting Work:**
1. Open PowerShell in project root
2. Run: `.\start-backend-fixed.ps1`
3. Backend starts cleanly ✓

**During Development:**
- If you need to restart: Close terminal with Ctrl+C
- Then run the script again

**Evening - Ending Work:**
1. Press Ctrl+C in backend terminal
2. Wait for shutdown message
3. Close terminal

---

## 🔧 Advanced Troubleshooting

### If Port Still Shows as Busy

**Step 1: Identify the culprit**
```powershell
# Get detailed info about what's using port 5000
$connection = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
$process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
$process | Format-List *
```

**Step 2: Force kill**
```powershell
# Force kill by process ID
Stop-Process -Id $connection.OwningProcess -Force
```

**Step 3: Nuclear option (restart computer)**
If nothing works, restart your computer. This clears all stuck processes.

---

### Common Scenarios

#### Scenario 1: "Access Denied" when killing processes
**Solution:** Run PowerShell as Administrator
- Right-click PowerShell → "Run as Administrator"

#### Scenario 2: Process keeps respawning
**Solution:** Check for:
- VS Code extensions running Node
- Background services
- Auto-start scripts

#### Scenario 3: Multiple node.exe processes
**Solution:** Kill them all at once:
```powershell
Get-Process node | Stop-Process -Force
```

---

## 📝 Checklist for Clean Startup

Every time you start the backend:

- [ ] Close any open backend terminals properly (Ctrl+C)
- [ ] Run `.\start-backend-fixed.ps1`
- [ ] Wait for "Server listening at port 5000" message
- [ ] Verify no errors in console
- [ ] Frontend can connect to backend

---

## 🎯 Best Practices

### DO ✅
- Use the provided scripts
- Stop servers with Ctrl+C
- Check ports before starting
- Keep terminals open while developing

### DON'T ❌
- Close terminal windows without stopping server
- Run multiple backend instances
- Ignore "port in use" errors
- Manually edit package.json port without updating frontend

---

## 💡 Pro Tips

### Tip 1: Create Desktop Shortcut
Right-click `start-backend-fixed.ps1` → Send to → Desktop (shortcut)
Double-click to start backend anytime!

### Tip 2: Pin to Taskbar
Pin PowerShell to taskbar and set startup directory to project folder

### Tip 3: Use VS Code Integrated Terminal
VS Code → Terminal → New Terminal → Run script

### Tip 4: Add to VS Code Tasks
Create `.vscode/tasks.json` with custom "Start Backend" task

---

## 🆘 Emergency Contacts

If nothing works:

1. **Restart Computer** - Clears all processes
2. **Check Antivirus** - Some block ports
3. **Disable Windows IIS** - Can use port 5000
4. **Change Port** - Use 5001 or 3001 instead

---

## 📞 Support Commands

### Diagnose Issues
```powershell
# Show all Node processes
Get-Process node | Format-Table Id, ProcessName, CPU

# Show all connections on port 5000
Get-NetTCPConnection -LocalPort 5000 | Format-Table -AutoSize

# Show what's listening on common ports
Get-NetTCPConnection -LocalPort 5000, 5173, 3000 -ErrorAction SilentlyContinue
```

### Fix Everything
```powershell
# The "I give up" command - kills everything
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force
```

---

## 🎉 Success Indicators

You know it's working when:
- ✅ No "EADDRINUSE" errors
- ✅ "Server listening at port 5000" appears
- ✅ Frontend can connect
- ✅ No duplicate processes in Task Manager

---

**Status:** ✅ PERMANENT FIX PROVIDED  
**Scripts Created:** 
- `start-backend-fixed.ps1` (PowerShell - Recommended)
- `start-backend-clean.bat` (CMD alternative)

**Next Step:** Run `.\start-backend-fixed.ps1` and never worry about port conflicts again!
