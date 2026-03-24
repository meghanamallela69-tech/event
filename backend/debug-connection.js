import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './config/config.env' });

const debugConnection = async () => {
  try {
    console.log('🔍 DEBUG: Database Connection Analysis');
    console.log('=====================================');
    
    console.log('Environment Variables:');
    console.log('MONGO_URI:', process.env.MONGO_URI);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    console.log('\n🔌 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    
    const connection = mongoose.connection;
    console.log('\n✅ Connected Successfully!');
    console.log('Database Name:', connection.db.databaseName);
    console.log('Host:', connection.host);
    console.log('Port:', connection.port);
    
    // List all collections
    const collections = await connection.db.listCollections().toArray();
    console.log('\n📁 Collections in this database:');
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    // Count documents in each collection
    console.log('\n📊 Document counts:');
    for (const col of collections) {
      const count = await connection.db.collection(col.name).countDocuments();
      console.log(`   ${col.name}: ${count} documents`);
    }
    
    // Check if this is Atlas or Local
    const isAtlas = process.env.MONGO_URI.includes('mongodb+srv://');
    const isLocal = process.env.MONGO_URI.includes('localhost');
    
    console.log('\n🏷️  Database Type:');
    if (isAtlas) {
      console.log('   Type: MongoDB Atlas (Cloud)');
      console.log('   Cluster:', process.env.MONGO_URI.match(/@([^/]+)/)?.[1] || 'Unknown');
    } else if (isLocal) {
      console.log('   Type: Local MongoDB');
      console.log('   Location: localhost');
    } else {
      console.log('   Type: Unknown');
    }
    
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
};

debugConnection();