import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './config/config.env' });

const testConnection = async () => {
    console.log('🔍 Testing MongoDB Connection...');
    console.log('================================');
    
    const mongoURI = process.env.MONGO_URI;
    console.log('📋 MongoDB URI:', mongoURI);
    
    if (!mongoURI) {
        console.log('❌ MONGO_URI not found in environment variables');
        return;
    }
    
    try {
        console.log('🔌 Attempting to connect...');
        
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 10000,
        });
        
        console.log('✅ MongoDB connection successful!');
        console.log('📊 Database name:', mongoose.connection.db.databaseName);
        console.log('🌐 Host:', mongoose.connection.host);
        console.log('🔢 Port:', mongoose.connection.port);
        
        // Test creating a simple document
        console.log('\n🧪 Testing document creation...');
        
        const testSchema = new mongoose.Schema({
            name: String,
            createdAt: { type: Date, default: Date.now }
        });
        
        const TestModel = mongoose.model('Test', testSchema);
        
        const testDoc = new TestModel({ name: 'Connection Test' });
        const savedDoc = await testDoc.save();
        
        console.log('✅ Document created successfully:', savedDoc._id);
        
        // Clean up test document
        await TestModel.deleteOne({ _id: savedDoc._id });
        console.log('🧹 Test document cleaned up');
        
        // List existing collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📁 Existing collections:');
        collections.forEach(col => {
            console.log(`   - ${col.name}`);
        });
        
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected successfully');
        
    } catch (error) {
        console.log('❌ Connection failed!');
        console.log('🔍 Error:', error.message);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 Possible solutions:');
            console.log('   1. Start MongoDB service: net start MongoDB');
            console.log('   2. Or start manually: mongod --dbpath "C:\\data\\db"');
            console.log('   3. Check if MongoDB is installed');
        }
    }
};

testConnection();