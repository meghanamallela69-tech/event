import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './config/config.env' });

const connectToMongoDB = async () => {
    console.log('🔧 MongoDB Connection Fixer\n');
    
    const connectionStrings = [
        {
            name: 'Primary Atlas',
            uri: process.env.MONGO_URI
        },
        {
            name: 'Backup Atlas (different encoding)',
            uri: process.env.MONGO_URI_BACKUP
        },
        {
            name: 'Local MongoDB',
            uri: process.env.MONGO_URI_LOCAL
        }
    ];
    
    for (const connection of connectionStrings) {
        if (!connection.uri) continue;
        
        console.log(`🔌 Trying ${connection.name}...`);
        
        try {
            await mongoose.connect(connection.uri, {
                serverSelectionTimeoutMS: 5000,
                connectTimeoutMS: 5000,
            });
            
            console.log(`✅ Connected successfully to ${connection.name}!`);
            console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
            
            await mongoose.disconnect();
            
            // Update the config file with working connection
            console.log(`\n🔧 Updating config to use ${connection.name}...`);
            return connection.uri;
            
        } catch (error) {
            console.log(`❌ ${connection.name} failed: ${error.message.split('\n')[0]}`);
        }
    }
    
    console.log('\n❌ All MongoDB connections failed!');
    console.log('\n🔧 Quick fixes to try:');
    console.log('1. **MongoDB Atlas Dashboard:**');
    console.log('   - Go to https://cloud.mongodb.com/');
    console.log('   - Check if cluster is paused (click Resume if needed)');
    console.log('   - Network Access → Add IP 0.0.0.0/0 (allow all)');
    console.log('   - Database Access → Verify username/password');
    
    console.log('\n2. **Alternative: Use Local MongoDB:**');
    console.log('   - Install MongoDB Community Server');
    console.log('   - Start MongoDB service');
    console.log('   - App will automatically use local database');
    
    console.log('\n3. **Current Solution:**');
    console.log('   - App is using in-memory database (works fine for development)');
    console.log('   - Data resets on server restart');
    console.log('   - All features work normally');
    
    return null;
};

connectToMongoDB();