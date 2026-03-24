# Database Connection Troubleshooting Guide

## Current Issue
The application is experiencing DNS resolution issues when connecting to MongoDB Atlas, resulting in the error:
```
querySrv ECONNREFUSED _mongodb._tcp.cluster0.gfbrfcg.mongodb.net
```

## Quick Fixes (Try in Order)

### 1. Fix DNS Settings (Recommended)
Run as Administrator:
```bash
# Windows
./fix-dns-windows.bat

# Manual DNS fix
netsh interface ip set dns "Wi-Fi" static 8.8.8.8
netsh interface ip add dns "Wi-Fi" 1.1.1.1 index=2
ipconfig /flushdns
```

### 2. Test Database Connection
```bash
node test-db-connection.js
```

### 3. Use Local MongoDB (Fallback)
```bash
# Install MongoDB Community Server first
./setup-local-mongodb.bat

# Then copy the local config
copy config.env.local config.env
```

### 4. Network Troubleshooting
- Disable VPN/Proxy temporarily
- Check Windows Firewall settings
- Try from a different network (mobile hotspot)
- Restart your router/modem

## Solutions by Error Type

### DNS Resolution Errors
- `querySrv ECONNREFUSED`
- `ENOTFOUND cluster0.gfbrfcg.mongodb.net`

**Solutions:**
1. Change DNS servers to 8.8.8.8, 1.1.1.1
2. Flush DNS cache: `ipconfig /flushdns`
3. Disable IPv6 temporarily
4. Check hosts file for conflicts

### Authentication Errors
- `authentication failed`

**Solutions:**
1. Verify username/password in MongoDB Atlas
2. Check database user permissions
3. Ensure user has read/write access to the database

### Network Access Errors
- `IP not whitelisted`
- `connection refused`

**Solutions:**
1. Add your IP to MongoDB Atlas Network Access
2. Use 0.0.0.0/0 for development (not recommended for production)
3. Check if your ISP blocks MongoDB ports

## Environment Configuration

### Current Atlas Configuration
```env
MONGO_URI=mongodb+srv://meghana123:meghana1234@cluster0.gfbrfcg.mongodb.net/eventhub?retryWrites=true&w=majority&appName=Cluster0
```

### Local MongoDB Configuration
```env
MONGO_URI=mongodb://localhost:27017/eventhub
```

### Direct Atlas Connection (if SRV fails)
```env
MONGO_URI=mongodb://meghana123:meghana1234@cluster0-shard-00-00.gfbrfcg.mongodb.net:27017,cluster0-shard-00-01.gfbrfcg.mongodb.net:27017,cluster0-shard-00-02.gfbrfcg.mongodb.net:27017/eventhub?ssl=true&replicaSet=atlas-123abc-shard-0&authSource=admin&retryWrites=true&w=majority
```

## Testing Commands

### Test DNS Resolution
```bash
nslookup cluster0.gfbrfcg.mongodb.net 8.8.8.8
```

### Test MongoDB Connection
```bash
node test-db-connection.js
```

### Start Application with Debug
```bash
npm start
```

## MongoDB Atlas Checklist

1. **Database User**: Verify user `meghana123` exists and has correct permissions
2. **Network Access**: Add your current IP address or use 0.0.0.0/0
3. **Database Name**: Ensure `eventhub` database exists
4. **Connection String**: Verify the cluster URL is correct

## Local MongoDB Setup

If Atlas continues to fail, set up local MongoDB:

1. Download MongoDB Community Server
2. Install with default settings
3. Start MongoDB service
4. Update config.env to use local connection
5. Create admin user if needed

## Contact Information

If issues persist:
1. Check MongoDB Atlas status page
2. Contact your network administrator
3. Try connecting from a different location
4. Consider using MongoDB Compass for GUI testing

## Files Created for Troubleshooting

- `test-db-connection.js` - Comprehensive connection testing
- `fix-dns-windows.bat` - DNS configuration fix
- `setup-local-mongodb.bat` - Local MongoDB setup
- `config.env.local` - Local database configuration
- Enhanced `database/dbConnection.js` - Improved error handling and retry logic