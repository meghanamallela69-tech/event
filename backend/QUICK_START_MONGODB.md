# 🚀 Quick Start - MongoDB Setup

## ⚡ **Choose Your Database Option**

You have **2 options** for running MongoDB:

---

## **Option 1: Local MongoDB (Recommended for Development)**

### **Step 1: Install MongoDB**

#### **Windows:**
1. Download: https://www.mongodb.com/try/download/community
2. Run installer → Next → Next → Install
3. Choose "Complete" installation
4. Install as Windows Service (check this option)

#### **Verify Installation:**
```bash
mongosh
```
Should connect successfully.

### **Step 2: Start MongoDB**

MongoDB should auto-start as a Windows service. If not:

```bash
# Method 1: Using Command Prompt (Admin)
net start MongoDB

# Method 2: Using PowerShell (Admin)
Start-Service MongoDB

# Method 3: Restart via Services
# Press Win+R → services.msc → Find "MongoDB" → Right-click → Start
```

### **Step 3: Verify It's Running**
```bash
mongosh
```
Should show: `Current Mongosh Log ID` and connected to `test` database

### **Step 4: Test Connection**
```bash
cd backend
node scripts/checkDatabase.js
```

**Expected Output:**
```
✅ CONNECTION SUCCESSFUL!
📦 Database Name: mern-stack-event-project
```

---

## **Option 2: MongoDB Atlas (Cloud - Free Tier)**

If you don't want to install MongoDB locally, use MongoDB Atlas (cloud).

### **Step 1: Create Free Account**
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up for free account
3. Create a new cluster (takes 3-5 minutes)

### **Step 2: Get Connection String**
1. In Atlas Dashboard → Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. It looks like: `mongodb+srv://username:password@cluster.mongodb.net/...`

### **Step 3: Update config.env**

Open `config/config.env` and replace the MONGO_URI line:

```env
# Replace this line:
MONGO_URI=mongodb://127.0.0.1:27017/mern-stack-event-project

# With your Atlas connection string:
MONGO_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/mern-stack-event-project?retryWrites=true&w=majority
```

**Important:** 
- Replace `<password>` with your actual password
- Database name should be: `mern-stack-event-project`

### **Step 4: Test Connection**
```bash
cd backend
node scripts/checkDatabase.js
```

---

## ✅ **Quick Verification**

After setting up either option, run:

```bash
node scripts/checkDatabase.js
```

**Success shows:**
```
✅ CONNECTION SUCCESSFUL!
📦 Database Name: mern-stack-event-project
📦 COLLECTIONS IN DATABASE:
1. users
2. events
3. services
...
```

---

## 🎯 **Which Should You Choose?**

| Feature | Local MongoDB | MongoDB Atlas |
|---------|--------------|---------------|
| **Speed** | ⚡ Faster | 🐢 Slightly slower |
| **Cost** | 💰 Free | 💰 Free tier available |
| **Setup** | 🔧 Requires installation | ✅ No installation |
| **Internet** | 📶 Works offline | 🌐 Requires internet |
| **Best for** | Development | Production/Testing |

**Recommendation:** 
- Use **Local MongoDB** for development (faster, works offline)
- Use **MongoDB Atlas** if you can't install software or need cloud access

---

## ❓ **Common Issues**

### **"MongoDB service not found"**
**Solution:** Install MongoDB Community Server from official website

### **"Connection refused"**
**Solution:** MongoDB is not running. Start it using:
```bash
net start MongoDB
```

### **"Authentication failed" (Atlas)**
**Solution:** 
1. Check username/password in connection string
2. Make sure IP address is whitelisted in Atlas (use 0.0.0.0/0 for allow all)

### **"Network timeout" (Atlas)**
**Solution:**
1. Check internet connection
2. Whitelist your IP in Atlas Security settings

---

## 🔄 **Switching Between Options**

Just update `config/config.env`:

**For Local:**
```env
MONGO_URI=mongodb://127.0.0.1:27017/mern-stack-event-project
```

**For Atlas:**
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/mern-stack-event-project
```

Then restart your backend server!

---

## 🎉 **Next Steps**

Once connected successfully:

1. ✅ Migrate services: `node scripts/migrateAllServices.js`
2. ✅ Start backend: `npm run dev`
3. ✅ Start frontend: `cd ../frontend && npm run dev`
4. ✅ Visit: `http://localhost:5173/services`

**Your database is now ready to use!** 🚀
