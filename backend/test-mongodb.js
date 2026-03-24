import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './config/config.env' });

const testMongoConnection = async () => {
    console.log('🔍 Testing MongoDB Atlas Connection...\n');
    
    const mongoUri = process.env.MONGO_URI;
    console.log('📋 Connection String:', mongoUri.replace(/:[^:@]*@/, ':****@'));
    
    try {
        console.log('🔌 Attempting to connect...');
        
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000, // 10 seconds
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        
        console.log('✅ MongoDB Atlas connection successful!');
        console.log('📊 Database:', mongoose.connection.db.databaseName);
        console.log('🌐 Host:', mongoose.connection.host);
        
        // Test a simple operation
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📁 Available collections:', collections.length);
        
        await mongoose.disconnect();
        console.log('🔌 Disconnected successfully');
        
    } catch (error) {
        console.log('❌ Connection failed!');
        console.log('🔍 Error details:');
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('   - Network connection refused');
            console.log('   - Check your internet connection');
            console.log('   - Verify MongoDB Atlas cluster is running');
        } else if (error.message.includes('authentication failed')) {
            console.log('   - Authentication failed');
            console.log('   - Check username and password');
        } else if (error.message.includes('querySrv')) {
            console.log('   - DNS resolution failed');
            console.log('   - Check cluster URL');
            console.log('   - Try using IP whitelist 0.0.0.0/0 in Atlas');
        }
        
        console.log('\n📝 Full error:', error.message);
        
        console.log('\n🔧 Troubleshooting steps:');
        console.log('1. Check MongoDB Atlas dashboard');
        console.log('2. Verify cluster is running (not paused)');
        console.log('3. Check Network Access - add 0.0.0.0/0 to IP whitelist');
        console.log('4. Verify Database Access - check username/password');
        console.log('5. Try connecting from MongoDB Compass with same credentials');
    }
};

testMongoConnection();