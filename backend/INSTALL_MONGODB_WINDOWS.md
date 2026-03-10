# MongoDB Installation Guide for Windows

## 📥 **Step-by-Step Installation**

### **Step 1: Download MongoDB**

1. Go to: https://www.mongodb.com/try/download/community
2. Select these options:
   - **Version:** Latest (7.0.x or higher)
   - **Platform:** Windows
   - **Package:** MSI
3. Click **Download** button
4. Save the file (about 300MB)

---

### **Step 2: Install MongoDB**

1. **Run the downloaded .msi file**
   - Double-click to open it

2. **Accept License Agreement**
   - Check "I accept..."
   - Click **Next**

3. **Choose Setup Type**
   - Select **"Complete"** installation
   - Click **Next**

4. **Service Configuration** ⭐ IMPORTANT
   - ✅ **CHECK:** "Install MongoDB as a Service"
   - ✅ **CHECK:** "Run service as Network Service user"
   - Leave data directory as default: `C:\Program Files\MongoDB\Server\7.0\data`
   - OR change to: `C:\data\db` (simpler)
   - Click **Next**

5. **Install**
   - Click **Install**
   - Wait for installation to complete (2-3 minutes)
   - Click **Finish**

---

### **Step 3: Verify Installation**

Open Command Prompt and type:
```cmd
mongosh --version
```

**You should see:**
```
2.0.1  (or higher version number)
```

This means MongoDB is installed! ✅

---

### **Step 4: Start MongoDB**

MongoDB should auto-start since you installed it as a service.

**Check if it's running:**
```cmd
sc query MongoDB
```

**Look for:**
```
STATE                    : 4 RUNNING
```

**If not running, start it:**
```cmd
net start MongoDB
```

---

### **Step 5: Test Connection**

```cmd
mongosh
```

**Success shows:**
```
Current Mongosh Log ID: 65f8a1b2c3d4e5f6a7b8c9d0
Connecting to: mongodb://127.0.0.1:27017/?directConnection=true
Using MongoDB: 7.0.x
Using Mongosh: 2.0.1

test>
```

**Type `exit` to quit mongosh**

---

### **Step 6: Test with Your Project**

```cmd
cd C:\Users\Dell\OneDrive\Desktop\MERN_STACK_EVENT_PROJECT\backend
node scripts/checkDatabase.js
```

**Success shows:**
```
✅ CONNECTION SUCCESSFUL!
📦 Database Name: mern-stack-event-project
```

---

## 🎯 **Post-Installation Setup**

### **Create Data Directory (if needed)**

If you didn't specify a data directory during installation:

```cmd
mkdir C:\data\db
```

### **Set Up Your Project Database**

Your project will automatically create the database on first use.

Just make sure your `config.env` has:
```env
MONGO_URI=mongodb://127.0.0.1:27017/mern-stack-event-project
```

---

## 🔧 **Troubleshooting Installation**

### **"Windows protected your PC" warning**

**Solution:** 
- Click "More info"
- Then click "Run anyway"
- It's safe - official MongoDB installer

### **"Access Denied" during installation**

**Solution:**
- Right-click the .msi file
- Select "Run as administrator"

### **Service won't start after installation**

**Solution:**
```cmd
# Open Command Prompt as Administrator
net start MongoDB

# If that fails, check Event Viewer for errors
eventvwr.msc
# Look under: Windows Logs → Application
```

### **"mongosh: command not found"**

**Solution:** Add MongoDB to PATH

**Option 1: Manual PATH**
1. Press `Win + R`
2. Type: `sysdm.cpl`
3. Click "Advanced" tab
4. Click "Environment Variables"
5. Under "System variables", find "Path"
6. Click "Edit"
7. Click "New"
8. Add: `C:\Program Files\MongoDB\Server\7.0\bin`
9. Click OK on all windows
10. **Restart Command Prompt**

**Option 2: Use full path**
```cmd
"C:\Program Files\MongoDB\Server\7.0\bin\mongosh.exe"
```

---

## ✅ **Verify Everything Works**

After installation, run these tests:

### **Test 1: Version Check**
```cmd
mongosh --version
```
Should show version number ✅

### **Test 2: Connect Locally**
```cmd
mongosh
```
Should connect to `test` database ✅

### **Test 3: Check Service**
```cmd
sc query MongoDB
```
Should show `RUNNING` ✅

### **Test 4: Project Connection**
```cmd
cd backend
node scripts/checkDatabase.js
```
Should show success ✅

---

## 🚀 **Alternative: Quick Install Commands**

### **Using Winget (Windows Package Manager)**

If you have Windows 11 or updated Windows 10:

```cmd
winget install MongoDB.Server
```

This automatically downloads and installs MongoDB!

### **Using Chocolatey**

If you have Chocolatey installed:

```cmd
choco install mongodb -y
```

---

## 📊 **Installation Summary**

| Step | Action | Time | Status |
|------|--------|------|--------|
| 1 | Download MongoDB | 2 min | ⏳ |
| 2 | Run Installer | 1 min | ⏳ |
| 3 | Complete Setup | 3 min | ⏳ |
| 4 | Verify Installation | 30 sec | ⏳ |
| 5 | Test Connection | 30 sec | ⏳ |

**Total Time: ~7 minutes**

---

## 💡 **Tips After Installation**

1. **MongoDB auto-starts** with Windows (if installed as service)
2. **Data stored in:** `C:\Program Files\MongoDB\Server\7.0\data`
3. **Logs stored in:** `C:\Program Files\MongoDB\Server\7.0\log`
4. **Default port:** 27017
5. **No password needed** for local development

---

## 🎉 **You're Done!**

After installation:

1. ✅ MongoDB is installed
2. ✅ Service is running
3. ✅ You can connect via `mongosh`
4. ✅ Your MERN project can use MongoDB
5. ✅ All data saved in `mern-stack-event-project` database

**Now you can start your backend server!**
```cmd
npm run dev
```

**Happy coding!** 🚀
