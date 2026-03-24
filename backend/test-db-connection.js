import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';
import { promisify } from 'util';

// Load environment variables
dotenv.config({ path: './config/config.env' });

const resolveSrv = promisify(dns.resolveSrv);
const lookup = promisify(dns.lookup);

async function testDNSResolution() {
  console.log('\n🔍 Testing DNS Resolution...');
  
  try {
    // Test basic DNS
    const googleDNS = await lookup('google.com');
    console.log('✅ Basic DNS working:', googleDNS.address);
    
    // Test MongoDB Atlas DNS
    const mongoHost = 'cluster0.gfbrfcg.mongodb.net';
    console.log(`🔍 Testing MongoDB Atlas DNS: ${mongoHost}`);
    
    try {
      const mongoIP = await lookup(mongoHost);
      console.log('✅ MongoDB Atlas DNS resolved:', mongoIP.address);
    } catch (dnsError) {
      console.error('❌ MongoDB Atlas DNS failed:', dnsError.message);
      return false;
    }
    
    // Test SRV record
    try {
      const srvRecords = await resolveSrv(`_mongodb._tcp.${mongoHost}`);
      console.log('✅ SRV records found:', srvRecords.length);
    } catch (srvError) {
      console.error('❌ SRV record lookup failed:', srvError.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ DNS test failed:', error.message);
    return false;
  }
}

async function testMongoConnection() {
  console.log('\n🔌 Testing MongoDB Connection...');
  
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    console.error('❌ MONGO_URI not found in environment variables');
    return false;
  }
  
  console.log('📋 Connection URI:', mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
  
  const connectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4, // Force IPv4
    bufferCommands: false,
    maxPoolSize: 10,
    retryWrites: true,
    w: 'majority'
  };
  
  try {
    console.log('⏳ Connecting to MongoDB...');
    const connection = await mongoose.connect(mongoURI, connectionOptions);
    
    console.log('✅ MongoDB connection successful!');
    console.log('📦 Database:', connection.connection.db.databaseName);
    console.log('🌐 Host:', connection.connection.host);
    console.log('📊 Ready state:', connection.connection.readyState);
    
    // Test database operations
    try {
      const collections = await connection.connection.db.listCollections().toArray();
      console.log('📋 Collections:', collections.map(c => c.name).join(', ') || 'None');
    } catch (listError) {
      console.log('⚠️ Could not list collections, but connection is working');
    }
    
    await mongoose.disconnect();
    console.log('✅ Disconnected successfully');
    return true;
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    // Provide specific error guidance
    if (error.message.includes('querySrv ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      console.error('\n🔧 DNS/Network Issue Solutions:');
      console.error('1. Check internet connection');
      console.error('2. Try different DNS servers (8.8.8.8, 1.1.1.1)');
      console.error('3. Disable VPN/Proxy');
      console.error('4. Check firewall settings');
      console.error('5. Try from different network');
    } else if (error.message.includes('authentication failed')) {
      console.error('\n🔐 Authentication Issue:');
      console.error('Check MongoDB Atlas username/password');
    } else if (error.message.includes('IP not whitelisted')) {
      console.error('\n🌐 Network Access Issue:');
      console.error('Add your IP to MongoDB Atlas Network Access');
    }
    
    return false;
  }
}

async function runDiagnostics() {
  console.log('🚀 MongoDB Connection Diagnostics');
  console.log('================================');
  
  const dnsOk = await testDNSResolution();
  const mongoOk = await testMongoConnection();
  
  console.log('\n📊 Summary:');
  console.log('DNS Resolution:', dnsOk ? '✅ Working' : '❌ Failed');
  console.log('MongoDB Connection:', mongoOk ? '✅ Working' : '❌ Failed');
  
  if (dnsOk && mongoOk) {
    console.log('\n🎉 All tests passed! Database should work fine.');
  } else {
    console.log('\n⚠️ Issues detected. Please fix the above problems.');
  }
  
  process.exit(mongoOk ? 0 : 1);
}

runDiagnostics().catch(console.error);