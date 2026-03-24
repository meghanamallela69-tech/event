# Port Configuration - PERMANENT SETUP

## ✅ PORTS CONFIGURED PERMANENTLY

### Backend Server: Port 5000
- **Configuration File**: `backend/config/config.env` → `PORT=5000`
- **Server File**: `backend/server.js` → Default fallback to 5000
- **URL**: http://localhost:5000
- **API Base**: http://localhost:5000/api/v1

### Frontend Server: Port 5173
- **Configuration File**: `frontend/vite.config.js` → `port: 5173`
- **URL**: http://localhost:5173
- **Vite Dev Server**: Configured with `host: true` for network access

## 📁 FILES UPDATED

### Backend Configuration
- ✅ `backend/config/config.env` - PORT=5000
- ✅ `backend/server.js` - Default port 5000
- ✅ `backend/.env.example` - PORT=5000

### Frontend Configuration  
- ✅ `frontend/vite.config.js` - Server port 5173
- ✅ `frontend/src/lib/http.js` - API_BASE updated to port 5000
- ✅ `frontend/src/components/Contact.jsx` - API URL updated
- ✅ `frontend/src/components/Register.jsx` - API URL updated

### Test Files & Scripts
- ✅ `frontend/test-book-now.html` - API_BASE updated
- ✅ `frontend/debug.html` - Health check URL updated
- ✅ `frontend/debug-book-now.html` - API_BASE updated
- ✅ `backend/final-comprehensive-test.js` - API_BASE updated
- ✅ `backend/test-admin-endpoints.js` - API_BASE updated
- ✅ `backend/debug-auth.js` - API URLs updated
- ✅ `test-api-booking.js` - API_BASE updated
- ✅ `backend/test-api-booking.js` - API_BASE updated
- ✅ `backend/scripts/createTestEvent.js` - API_BASE updated
- ✅ `backend/scripts/createTestBookingOnly.js` - API_BASE updated

### Batch Scripts
- ✅ `start-both-servers.bat` - Port references updated
- ✅ `start-servers.bat` - Port references updated

### Documentation
- ✅ `backend/MONGODB_ATLAS_PERMANENT_SOLUTION.md` - Port updated

## 🚀 HOW TO START SERVERS

### Start Backend (Port 5000)
```bash
cd backend
node server.js
```
**Expected Output**: `Server listening at port 5000`

### Start Frontend (Port 5173)
```bash
cd frontend
npm run dev
```
**Expected Output**: `Local: http://localhost:5173/`

### Start Both Servers (Windows)
```bash
# Option 1: Use batch script
start-both-servers.bat

# Option 2: Manual (two terminals)
# Terminal 1:
cd backend && node server.js

# Terminal 2: 
cd frontend && npm run dev
```

## 🔗 APPLICATION URLS

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/v1
- **Health Check**: http://localhost:5000/api/v1/health
- **Config Check**: http://localhost:5000/api/v1/config-check

## ✅ VERIFICATION CHECKLIST

### Backend (Port 5000)
- [ ] `backend/config/config.env` shows `PORT=5000`
- [ ] Server starts with "Server listening at port 5000"
- [ ] Health endpoint responds: http://localhost:5000/api/v1/health
- [ ] MongoDB Atlas connection successful

### Frontend (Port 5173)
- [ ] `frontend/vite.config.js` shows `port: 5173`
- [ ] Vite starts with "Local: http://localhost:5173/"
- [ ] API calls go to http://localhost:5000/api/v1
- [ ] No CORS errors in browser console

### Integration
- [ ] Frontend can communicate with backend
- [ ] Login/Register works correctly
- [ ] API responses are successful
- [ ] No port conflicts with other applications

## 🔧 TROUBLESHOOTING

### Port Already in Use
```bash
# Check what's using port 5000
netstat -ano | findstr :5000

# Check what's using port 5173  
netstat -ano | findstr :5173

# Kill process if needed (replace PID)
taskkill /PID <process_id> /F
```

### CORS Issues
- Verify `backend/app.js` has `FRONTEND_URL=http://localhost:5173` in CORS config
- Check browser console for CORS errors
- Ensure both servers are running

### API Connection Issues
- Verify `frontend/src/lib/http.js` has correct API_BASE
- Check network tab in browser dev tools
- Test backend health endpoint directly

## 📝 NOTES

- **Permanent Configuration**: These port settings will persist across restarts
- **Network Access**: Frontend configured with `host: true` for network access
- **Environment Variables**: Backend uses PORT from config.env with fallback
- **Vite Configuration**: Frontend uses explicit port configuration in vite.config.js

---

**All port configurations are now permanently set and will survive system restarts.**