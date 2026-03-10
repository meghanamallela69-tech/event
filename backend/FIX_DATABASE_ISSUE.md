# 🚑 MongoDB Emergency Fix Guide

## ⚡ **QUICK FIX - Automated Solution**

### **Run the Start Script:**

1. **Right-click** on `start-mongodb.bat` in your backend folder
2. Select **"Run as administrator"**
3. Wait for it to start MongoDB
4. It will automatically test the connection

**The script will:**
- ✅ Start MongoDB service (if installed)
- ✅ Or start MongoDB manually
- ✅ Create data directory if needed
- ✅ Test database connection
- ✅ Tell you if everything is working

---

## 🔧 **Manual Fix - Step by Step**

### **Problem 1: MongoDB Service Not Running**

#### **Solution: Start MongoDB**

**Option A - Command Prompt (Admin):**
```cmd
net start MongoDB
```

**Option B - PowerShell (Admin):**
```powershell
Start-Service MongoDB
```

**Option C - Windows Services:**
1. Press `Win + R`
2. Type: `services.msc`
3. Find "MongoDB"
4. Right-click → **Start**

---

### **Problem 2: MongoDB Not Installed**

#### **Solution: Install MongoDB**

**Step 1: Download**
- Go to: https://www.mongodb.com/try/download/community
- Select: **Windows** → **x86_64** → **MSI**
- Click **Download**

**Step 2: Install**
1. Run the downloaded `.msi` file
2. Click **Next** → **Next**
3. Choose **"Complete"** installation
4. ✅ **IMPORTANT:** Check "Install MongoDB as a Service"
5. Click **Next** → **Install**
6. Wait for installation to complete

**Step 3: Verify Installation**
```cmd
mongosh --version
```

Should show version number like: `2.0.1`

---

### **Problem 3: Don't Want to Install MongoDB**

#### **Solution: Use MongoDB Atlas (Cloud)**

**No installation needed! Works immediately.**

**Step 1: Create Free Account**
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google account
3. It's FREE for small projects

**Step 2: Create Cluster**
1. Click "Build a Database"
2. Choose **FREE** tier (M0 Sandbox)
3. Select region closest to you
4. Click "Create Cluster" (takes 3 minutes)

**Step 3: Get Connection String**
1. Click **"Connect"** button on your cluster
2. Choose **"Connect your application"**
3. Copy the connection string
4. It looks like:
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

**Step 4: Update Your Config**

Open: `backend\config\config.env`

Replace this line:
```env
MONGO_URI=mongodb://127.0.0.1:27017/mern-stack-event-project
```

With your Atlas connection:
```env
MONGO_URI=mongodb+srv://username:yourpassword@cluster0.xxxxx.mongodb.net/mern-stack-event-project?retryWrites=true&w=majority
```

**Important:** Replace `<password>` with your actual password!

**Step 5: Test Connection**
```cmd
cd backend
node scripts/checkDatabase.js
```

---

## 📋 **Verification Steps**

After fixing MongoDB, verify it works:

### **Test 1: Check MongoDB is Running**
```cmd
mongosh
```

**Success shows:**
```
Current Mongosh Log ID: ...
Connected to: mongodb://127.0.0.1:27017/
Using MongoDB: 7.0.x
```

**Type `exit` to quit**

### **Test 2: Check Database Connection**
```cmd
cd backend
node scripts/checkDatabase.js
```

**Success shows:**
```
✅ CONNECTION SUCCESSFUL!
📦 Database Name: mern-stack-event-project
```

### **Test 3: Start Backend Server**
```cmd
npm run dev
```

**Success shows:**
```
✅ Connected to database successfully!
📦 Database name: mern-stack-event-project
Server listening at port 4000
```

---

## ❌ **Common Errors & Solutions**

### **"Access Denied" / "Administrator Required"**

**Solution:** Run as Administrator
- Right-click Command Prompt
- Select "Run as Administrator"
- Then try commands again

### **"Service not found" / "MongoDB service does not exist"**

**Solution:** MongoDB not installed as service
- Either install MongoDB with "Install as Service" option
- Or use the `start-mongodb.bat` script
- Or use MongoDB Atlas (cloud)

### **"Port 27017 already in use"**

**Solution:** MongoDB is already running
```cmd
net stop MongoDB
net start MongoDB
```

### **"Connection refused" after starting**

**Solution:** 
1. Wait 10 seconds after starting MongoDB
2. Check Windows Firewall isn't blocking
3. Try: `telnet 127.0.0.1 27017`

### **"Authentication failed" (Atlas only)**

**Solution:**
1. Double-check username and password
2. Make sure no spaces in connection string
3. In Atlas: Network Access → Add IP Address → Allow from anywhere (0.0.0.0/0)

---

## 🎯 **Choose Your Path**

| Method | Difficulty | Speed | Best For |
|--------|-----------|-------|----------|
| **Run start-mongodb.bat** | ⭐ Easy | Fast | Quick fix |
| **Install MongoDB locally** | ⭐⭐ Medium | Fastest | Long-term development |
| **Use MongoDB Atlas** | ⭐ Easy | Fast | No installation needed |

---

## 💡 **Recommended Approach**

### **For Development (Long-term):**
1. Install MongoDB locally
2. It auto-starts with Windows
3. Faster performance
4. Works offline

### **For Testing (Quick):**
1. Use MongoDB Atlas (cloud)
2. No installation needed
3. Free forever
4. Access from anywhere

### **For Immediate Fix:**
1. Run `start-mongodb.bat` as Administrator
2. This will start MongoDB temporarily
3. You'll need to restart it every time you reboot

---

## 📞 **Still Having Issues?**

### **Check These:**

1. **Is MongoDB installed?**
   ```cmd
   mongosh --version
   ```

2. **Is the service running?**
   ```cmd
   sc query MongoDB
   ```
   Should show: `STATE: 4 RUNNING`

3. **Can you connect manually?**
   ```cmd
   mongosh
   ```

4. **Is the config correct?**
   Check `backend\config\config.env`:
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/mern-stack-event-project
   ```

5. **Is firewall blocking?**
   - Windows Firewall → Allow app through firewall
   - Find MongoDB and allow it

---

## ✅ **Success Checklist**

Once everything works, you should see:

- [ ] ✅ MongoDB service is running
- [ ] ✅ `mongosh` connects successfully
- [ ] ✅ `checkDatabase.js` shows success
- [ ] ✅ Backend starts without errors
- [ ] ✅ Database name is `mern-stack-event-project`
- [ ] ✅ No ECONNREFUSED errors
- [ ] ✅ All collections created automatically

---

## 🎉 **You're Ready!**

Once MongoDB is running, your application will work perfectly!

**Next steps:**
1. ✅ Migrate services: `node scripts/migrateAllServices.js`
2. ✅ Start backend: `npm run dev`
3. ✅ Start frontend: `cd ../frontend && npm run dev`
4. ✅ Visit: `http://localhost:5173/services`

**Your database issues are now resolved!** 🚀
