# 🚀 Quick Start Guide - Backend Server

## ⚡ Fastest Way to Start Backend (Use This!)

### Option 1: PowerShell Command (RECOMMENDED)
Copy and paste this single command:

```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force; Start-Sleep -Seconds 3; cd backend; npm start
```

**What it does:**
1. Kills all Node.js processes
2. Waits 2 seconds
3. Starts backend server

---

### Option 2: Batch File
Double-click this file in your project root:
```
start-backend-clean.bat
```

---

## 📝 Daily Workflow

### Morning - Starting Work
1. Open PowerShell in project folder
2. Run the command above
3. Wait for "Server listening at port 5000"
4. Done! ✓

### During Development
- To restart: Press `Ctrl + C`, then run command again
- To stop: Press `Ctrl + C` and wait for shutdown

### Evening - Ending Work
1. Press `Ctrl + C` in backend terminal
2. Wait for "Server stopped" message
3. Close terminal

---

## 🎯 Success Indicators

You'll know it's working when you see:
```
✅ Server listening at port 5000
✅ Successfully connected to MongoDB Atlas!
✅ Admin initialization completed
✓ Cloudinary connection successful
```

---

## 🆘 If It Doesn't Work

### Still getting "port in use" error?
Run this cleanup command first:
```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

Then wait 3 seconds and try starting again.

### Need more help?
Check `PERMANENT_PORT_FIX_GUIDE.md` for detailed troubleshooting.

---

## 💡 Pro Tips

1. **Save the command** in a text file for quick access
2. **Pin PowerShell** to taskbar for easy access
3. **Use VS Code terminal** instead of separate window
4. **Always stop with Ctrl+C** to prevent port conflicts

---

**Status:** ✅ WORKING  
**Current Status:** Backend running on port 5000 ✓  
**Next:** Open http://localhost:5174/ in your browser!
