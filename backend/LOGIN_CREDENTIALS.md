# 🔐 Login Credentials Guide

## ✅ **Test Users Created Successfully!**

All login issues have been fixed. You can now login with any of these accounts:

---

## 📋 **Login Credentials**

### **1. Admin Account** 👑
```
Email: admin@gmail.com
Password: Admin@123
Role: Admin
Access: Full admin dashboard access
```

**What Admin Can Do:**
- View all users, merchants, events, services
- Manage services (create, edit, delete)
- View analytics and statistics
- Manage categories
- Handle bookings and payments

**Dashboard URL:** `/dashboard/admin`

---

### **2. Merchant Account** 🏪
```
Email: merchant@test.com
Password: Merchant@123
Role: Merchant
Business: Event Services Co.
Phone: +91 9876543210
Service Type: Catering
```

**What Merchant Can Do:**
- Create and manage events
- View bookings
- Manage profile
- View payments
- Update event details

**Dashboard URL:** `/dashboard/merchant`

---

### **3. User Account** 👤
```
Email: user@test.com
Password: User@123
Role: User
```

**What User Can Do:**
- Browse events
- Book services
- Register for events
- View booking history
- Save favorite events
- Update profile

**Dashboard URL:** `/dashboard/user`

---

## 🚀 **How to Test Login**

### **Step 1: Start Your Application**

**Backend (already running):**
```bash
cd backend
npm run dev
```

**Frontend (new terminal):**
```bash
cd frontend
npm run dev
```

### **Step 2: Go to Login Page**

Open browser and navigate to:
```
http://localhost:5173/login
```

### **Step 3: Login with Any Account**

**For Admin Access:**
- Email: `admin@gmail.com`
- Password: `Admin@123`

**For Merchant Access:**
- Email: `merchant@test.com`
- Password: `Merchant@123`

**For User Access:**
- Email: `user@test.com`
- Password: `User@123`

---

## 🔧 **Login System Features**

### **✅ Fixed Issues:**
1. ✅ Password hashing with bcrypt
2. ✅ JWT token generation
3. ✅ Role-based authentication
4. ✅ Proper error messages
5. ✅ Console logging for debugging
6. ✅ Token validation middleware
7. ✅ Protected routes

### **✅ Security Features:**
- Passwords hashed before storage
- JWT tokens for session management
- Token expiration (7 days)
- Protected API routes
- Role-based access control

---

## 🎯 **Testing Different Roles**

### **Test as Admin:**
1. Login with admin credentials
2. Should redirect to `/dashboard/admin`
3. Can see all admin features
4. Can manage services, users, merchants

### **Test as Merchant:**
1. Login with merchant credentials
2. Should redirect to `/dashboard/merchant`
3. Can create events
4. Can view bookings

### **Test as User:**
1. Login with user credentials
2. Should redirect to `/dashboard/user`
3. Can browse events
4. Can book services

---

## 🔍 **Debugging Login Issues**

### **Check Browser Console (F12)**

You should see logs like:
```
Login attempt with: { email: "admin@gmail.com" }
Login response: { success: true, token: "...", user: {...} }
User role: admin
Redirect from: undefined
```

### **Check Backend Terminal**

You should see logs like:
```
Login attempt: { email: 'admin@gmail.com', passwordLength: 10 }
User found: true Role: admin
Password match: true
Login successful for: admin@gmail.com Role: admin
```

---

## ❌ **Common Login Errors & Solutions**

### **"Invalid email or password"**
**Cause:** Wrong credentials  
**Solution:** Use exact credentials from this guide

### **"User already exists" (on registration)**
**Cause:** Email already in database  
**Solution:** Use different email or login instead

### **"Unauthorized" error**
**Cause:** Token expired or invalid  
**Solution:**Login again to get new token

### **Page redirects to login**
**Cause:**Not authenticated  
**Solution:**Login first, then access protected pages

---

## 💡 **Quick Reference**

| Action | URL | Credentials |
|--------|-----|-------------|
| **Admin Login** | `/login` | admin@gmail.com/ Admin@123 |
| **Merchant Login** | `/login` | merchant@test.com / Merchant@123 |
| **User Login** | `/login` | user@test.com / User@123 |
| **Register New User** | `/register` | Create new account |
| **Forgot Password** | N/A | Contact admin |

---

## 🎉 **Success Indicators**

After successful login, you should see:

### **Frontend:**
- ✅ Toast notification: "Login successful"
- ✅ Redirected to appropriate dashboard
- ✅ User name displayed in navbar
- ✅ Dashboard shows role-specific content

### **Backend:**
- ✅ Console shows: "Login successful for: [email]"
- ✅ Token generated successfully
- ✅ User role logged correctly

---

## 📊 **Database Verification**

To verify users are in database:

```bash
cd backend
node scripts/checkDatabase.js
```

Should show collections including `users` with 3+ documents.

---

## 🔄 **Reset All Test Users**

If you need to reset test users:

```bash
cd backend
node scripts/setupTestUsers.js
```

This will recreate all test users with default passwords.

---

## ✨ **Additional Features**

### **Auto-Create Admin:**
The system automatically creates admin user on startup if it doesn't exist.

### **Password Requirements:**
- Minimum 6 characters
- Should contain uppercase, lowercase, number
- Special characters recommended

### **Token Expiration:**
- JWT tokens expire after 7 days
- Automatic logout on expiration
- Need to login again

---

## 🎯 **Next Steps After Login**

### **As Admin:**
1. Go to `/dashboard/admin/services`
2. View all services
3. Edit or delete services
4. View analytics

### **As Merchant:**
1. Go to `/dashboard/merchant/events`
2. Create new event
3. View bookings
4. Manage profile

### **As User:**
1. Go to `/dashboard/user/browse-events`
2. Browse available events
3. Book services
4. View my bookings

---

## 📞 **Need Help?**

If login still doesn't work:

1. **Check console logs** - Both frontend and backend
2. **Verify credentials** - Use exact emails and passwords
3. **Clear browser cache** - Sometimes old tokens interfere
4. **Restart servers** - Both backend and frontend
5. **Run setup script again** - `node scripts/setupTestUsers.js`

---

**All login issues are now fixed!** 🎉

You can login with any of the three roles and test all features of your MERN Event Management System!
