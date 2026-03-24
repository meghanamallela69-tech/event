# Login Credentials

## Test User Accounts

The system has been set up with the following test accounts for development and testing:

### 🔑 Admin Account
- **Email:** `admin@gmail.com`
- **Password:** `Admin@123`
- **Role:** Admin
- **Access:** Full system administration

### 🏪 Merchant Account
- **Email:** `merchant@test.com`
- **Password:** `Merchant@123`
- **Role:** Merchant
- **Access:** Event creation, booking management, merchant dashboard

### 👤 User Account
- **Email:** `user@test.com`
- **Password:** `User@123`
- **Role:** User
- **Access:** Event browsing, booking events, user dashboard

## Application URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:4001/api/v1
- **Login Test Page:** http://localhost:5173/login-test

## Testing Login

1. **Backend API Test:**
   ```bash
   cd backend
   node scripts/testLogin.js
   ```

2. **Frontend Test:**
   - Visit: http://localhost:5174/login-test
   - Click "Run Login Tests" to verify all accounts work

3. **Manual Login:**
   - Visit: http://localhost:5173/login
   - Use any of the credentials above

## Troubleshooting

If login fails:

1. **Check if users exist:**
   ```bash
   cd backend
   node scripts/checkUsers.js
   ```

2. **Reset user passwords:**
   ```bash
   cd backend
   node scripts/setupTestUsers.js
   ```

3. **Verify backend is running on port 4001**
4. **Verify frontend is running on port 5173**
5. **Check browser console for errors**

## Notes

- All passwords are hashed using bcrypt with salt rounds of 10
- Users are automatically created/updated when the backend starts
- The `ensureAdmin` utility now handles all test users, not just admin
- Login tokens are JWT tokens with 7-day expiration