# MongoDB Atlas Setup Guide

## Current Status: ✅ FIXED - Data Persistence Working

The booking data disappearing issue has been **RESOLVED**. The backend now uses a persistent local MongoDB connection that maintains data across server restarts.

### What Was Fixed

1. **Enhanced Database Connection**: Improved `database/dbConnection.js` with better error handling and connection monitoring
2. **Persistent Local MongoDB**: Using `mongodb://localhost:27017/mern-stack-event-project` which persists data
3. **Connection Monitoring**: Added event listeners for connection status tracking
4. **Robust Error Handling**: Better error messages for different connection failure scenarios

### Current Configuration

```env
# MongoDB Configuration (Working)
MONGO_URI=mongodb://localhost:27017/mern-stack-event-project
```

### Verification Steps Completed

✅ **Backend Restart Test**: Server restarted successfully  
✅ **Data Persistence**: Bookings remain in database after restart  
✅ **API Functionality**: `/api/v1/payments/user/bookings` returns correct data  
✅ **Frontend Integration**: My Bookings page displays saved bookings  

---

## MongoDB Atlas Migration (Optional)

If you want to migrate to MongoDB Atlas for cloud storage, follow these steps:

### Step 1: Configure MongoDB Atlas Network Access

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to **Network Access** → **IP Access List**
3. Click **Add IP Address**
4. Choose **Add Current IP Address** or **Allow Access from Anywhere** (0.0.0.0/0)

### Step 2: Verify Atlas Connection

```bash
# Test Atlas connection
node test-atlas-connection.js
```

### Step 3: Update Environment Configuration

```env
# Switch to MongoDB Atlas
MONGO_URI=mongodb+srv://meghana123:meghana1234@cluster0.gfbrfcg.mongodb.net/eventhub?retryWrites=true&w=majority&appName=Cluster0
```

### Step 4: Migrate Existing Data

```bash
# Export local data
mongodump --db mern-stack-event-project --out ./backup

# Import to Atlas (requires mongorestore with Atlas connection)
mongorestore --uri "mongodb+srv://username:password@cluster.mongodb.net/eventhub" ./backup/mern-stack-event-project
```

---

## Troubleshooting

### Common Atlas Connection Issues

1. **ECONNREFUSED Error**
   - Check network access settings in Atlas
   - Verify IP address is whitelisted
   - Ensure internet connectivity

2. **Authentication Failed**
   - Verify username and password in Atlas Database Access
   - Check connection string format
   - Ensure user has proper permissions

3. **Timeout Errors**
   - Check firewall settings
   - Verify Atlas cluster is running
   - Test network connectivity

### Local MongoDB Issues

1. **Connection Refused**
   ```bash
   # Start MongoDB service (Windows)
   net start MongoDB
   
   # Check service status
   Get-Service MongoDB
   ```

2. **Data Directory Issues**
   - Ensure MongoDB data directory exists
   - Check disk space availability
   - Verify MongoDB service permissions

---

## Current Database Schema

The application uses these collections:
- `users` - User accounts (admin, merchant, user)
- `events` - Event listings (ticketed/full-service)
- `bookings` - Event bookings and payments
- `services` - Service listings
- `reviews` - Event reviews
- `ratings` - Event ratings
- `follows` - Merchant follow relationships
- `notifications` - User notifications
- `messages` - Contact messages

---

## Backup Recommendations

### Daily Backup (Local MongoDB)
```bash
# Create backup
mongodump --db mern-stack-event-project --out ./backups/$(date +%Y%m%d)

# Restore from backup
mongorestore --db mern-stack-event-project ./backups/20240316/mern-stack-event-project
```

### Atlas Automatic Backups
MongoDB Atlas provides automatic backups with point-in-time recovery when using M10+ clusters.

---

## Performance Monitoring

The enhanced connection includes monitoring for:
- Connection state changes
- Disconnection events
- Reconnection attempts
- Error logging with helpful messages

Check server logs for connection status:
```
✅ MongoDB Atlas Connected Successfully
📊 Database Name: mern-stack-event-project
🌐 Connection State: Connected
```