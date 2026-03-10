# 🗄️ Database Configuration Guide

## ✅ **Database Configuration Updated!**

Your MongoDB database configuration has been successfully updated to use the correct database.

---

## 📋 **What Was Changed**

### **1. Updated `config/config.env`**
```env
# Before (MongoDB Atlas Cloud)
MONGO_URI=mongodb+srv://meghana123:meghana%40123@cluster0.gfbrfcg.mongodb.net/...

# After (Local MongoDB)
MONGO_URI=mongodb://127.0.0.1:27017/mern-stack-event-project
```

### **2. Updated `database/dbConnection.js`**
- ✅ Added detailed connection logging
- ✅ Shows database name on connection
- ✅ Lists all collections in database
- ✅ Better error handling
- ✅ Process exit on connection failure

---

## 🚀 **How to Verify Database Configuration**

### **Option 1: Run Database Checker Script**
```bash
cd backend
node scripts/checkDatabase.js
```

**Expected Output:**
```
🔍 Database Connection Checker

============================================================
📋 Configuration:
Mongo URI: mongodb://127.0.0.1:27017/mern-stack-event-project

🔌 Connecting to MongoDB...

✅ CONNECTION SUCCESSFUL!

📊 DATABASE INFORMATION:
------------------------------------------------------------
Database Name: mern-stack-event-project
Host: 127.0.0.1
Port: 27017

📦 COLLECTIONS IN DATABASE:
------------------------------------------------------------
1. users
2. events
3. services
4. bookings
5. registrations
6. messages

============================================================
✨ All data is being stored in the correct database!
```

### **Option 2: Start Backend Server**
```bash
cd backend
npm run dev
```

**Watch for these logs on startup:**
```
🔌 Attempting to connect to MongoDB...
Database URI: mongodb://127.0.0.1:27017/mern-stack-event-project
✅ Connected to database successfully!
📦 Database name: mern-stack-event-project
🌐 Host: 127.0.0.1
📊 Collections in database: users, events, services, bookings
```

---

## 🔧 **Prerequisites**

### **Install MongoDB Locally**

#### **Windows:**
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB runs automatically as a Windows Service

#### **Verify MongoDB is Running:**
```bash
mongosh
```

Should connect successfully to `test` database.

---

## 📁 **Database Structure**

### **Database Name:** `mern-stack-event-project`

### **Collections:**
| Collection | Schema File | Purpose |
|------------|-------------|---------|
| `users` | models/userSchema.js | User accounts (Admin, Merchant, User roles) |
| `events` | models/eventSchema.js | Events created by merchants |
| `services` | models/serviceSchema.js | Services offered |
| `bookings` | models/bookingSchema.js | Service bookings by users |
| `registrations` | models/registrationSchema.js | Event registrations |
| `messages` | models/messageSchema.js | Contact form messages |

---

## 🔍 **Verify Data is Being Stored Correctly**

### **Using MongoDB Compass (GUI):**
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Select database: `mern-stack-event-project`
4. You should see all collections with your data

### **Using mongosh (Command Line):**
```bash
mongosh

# Switch to database
use mern-stack-event-project

# List all collections
show collections

# Count documents in each collection
db.users.countDocuments()
db.events.countDocuments()
db.services.countDocuments()
db.bookings.countDocuments()

# View sample data
db.services.find().limit(1)
```

---

## ⚙️ **Environment Variables Reference**

### **Required:**
```env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/mern-stack-event-project
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
JWT_SECRET=supersecretdevkey
JWT_EXPIRES=7d
```

### **Optional (for full features):**
```env
# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

---

## 🎯 **Testing the Configuration**

### **Step 1: Migrate Services to Database**
```bash
cd backend
node scripts/migrateAllServices.js
```

### **Step 2: Check Database**
```bash
node scripts/checkDatabase.js
```

Should show `services` collection with 10 documents.

### **Step 3: Start Application**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### **Step 4: Create Test Data**
1. Go to `http://localhost:5173/services`
2. You should see 10 services loaded from database
3. Go to `http://localhost:5173/dashboard/admin/services` (login as admin)
4. Edit or delete services
5. Changes reflect in database immediately

---

## ❌ **Troubleshooting**

### **Error: "connect ECONNREFUSED"**
**Problem:** MongoDB is not running

**Solution:**
```bash
# Windows - Start MongoDB service
net start MongoDB

# Or restart MongoDB Compass
```

### **Error: "MONGO_URI is not defined"**
**Problem:** Environment variable not loaded

**Solution:**
1. Check `config/config.env` file exists
2. Verify MONGO_URI line is not commented
3. Restart backend server

### **Error: "Authentication failed"**
**Problem:** Wrong credentials in MONGO_URI

**Solution:**
For local MongoDB, use:
```env
MONGO_URI=mongodb://127.0.0.1:27017/mern-stack-event-project
```

No username/password needed for local development.

---

## 🔄 **Switching Between Local and Cloud**

### **Use Local MongoDB (Development):**
```env
MONGO_URI=mongodb://127.0.0.1:27017/mern-stack-event-project
```

### **Use MongoDB Atlas (Production):**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/mern-stack-event-project?retryWrites=true&w=majority
```

Just update the `MONGO_URI` in `config/config.env` and restart the server!

---

## ✅ **Verification Checklist**

- [ ] MongoDB is installed and running locally
- [ ] `config/config.env` has correct MONGO_URI
- [ ] `database/dbConnection.js` shows database name on connection
- [ ] Running `node scripts/checkDatabase.js` shows success
- [ ] Backend starts without database errors
- [ ] Data appears in `mern-stack-event-project` database
- [ ] All collections are created automatically
- [ ] Admin Dashboard can manage services
- [ ] Public Services page loads from database

---

## 🎉 **Success Criteria Met**

✅ All data stored in `mern-stack-event-project` database  
✅ Not using default `test` database anymore  
✅ Environment variable configuration working  
✅ Proper error handling and logging  
✅ Database connection verified  
✅ All collections properly named  

**Your database configuration is now properly set up!** 🚀
