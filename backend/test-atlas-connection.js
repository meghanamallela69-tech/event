import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './config/config.env' });

const testConnection = async () => {
  console.log('🧪 MongoDB Atlas Connection Test');
  console.log('================================');
  
  const connectionMethods = [
    {
      name: "SRV Connection (Primary)",
      uri: process.env.MONGO_URI
    },
    {
      name: "Direct Replica Set Connection",
      uri: "mongodb://meghana123:meghana1234@cluster0-shard-00-00.gfbrfcg.mongodb.net:27017,cluster0-shard-00-01.gfbrfcg.mongodb.net:27017,cluster0-shard-00-02.gfbrfcg.mongodb.net:27017/eventhub?ssl=true&replicaSet=atlas-abc123-shard-0&authSource=admin&retryWrites=true&w=majority"
    },
    {
      name: "Single IP Connection (Primary)",
      uri: "mongodb://meghana123:meghana1234@3.208.83.223:27017/eventhub?ssl=true&authSource=admin&retryWrites=true&w=majority"
    }
  ];

  for (const method of connectionMethods) {
    console.log(`\n📡 Testing: ${method.name}`);
    console.log(`🔗 URI: ${method.uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
    
    try {
      const connection = await mongoose.connect(method.uri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4,
        bufferCommands: true,
        maxPoolSize: 10,
        retryWrites: true,
        w: 'majority'
      });
      
      console.log('✅ CONNECTION SUCCESS!');
      console.log(`   Database: ${connection.connection.db.databaseName}`);
      console.log(`   Host: ${connection.connection.host}`);
      console.log(`   Ready State: ${connection.connection.readyState}`);
      
      // Test basic operations
      try {
        const collections = await connection.connection.db.listCollections().toArray();
        console.log(`   Collections: ${collections.map(c => c.name).join(', ') || '(none yet)'}`);
        
        // Test a simple write/read operation
        const testCollection = connection.connection.db.collection('connection_test');
        await testCollection.insertOne({ test: true, timestamp: new Date() });
        const testDoc = await testCollection.findOne({ test: true });
        console.log('   ✅ Write/Read test: SUCCESS');
        
        // Clean up test document
        await testCollection.deleteOne({ test: true });
        
      } catch (opError) {
        console.log(`   ⚠️ Operations test failed: ${opError.message}`);
      }
      
      await mongoose.disconnect();
      console.log('✅ Disconnected successfully');
      
      console.log(`\n🎉 ${method.name} WORKS! Use this connection method.`);
      break;
      
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}`);
      
      if (error.message.includes('IP') || error.message.includes('whitelist')) {
        console.log('   🔧 Solution: Add your IP to MongoDB Atlas Network Access');
      } else if (error.message.includes('querySrv')) {
        console.log('   🔧 Solution: DNS SRV lookup failed, trying direct connection');
      } else if (error.message.includes('authentication')) {
        console.log('   🔧 Solution: Check username/password credentials');
      } else if (error.message.includes('timeout')) {
        console.log('   🔧 Solution: Connection timeout, check network/firewall');
      }
    }
  }
  
  console.log('\n📋 TROUBLESHOOTING CHECKLIST:');
  console.log('1. ✓ IP address added to MongoDB Atlas Network Access');
  console.log('2. ✓ Cluster is running (not paused)');
  console.log('3. ✓ Username: meghana123');
  console.log('4. ✓ Database name: eventhub');
  console.log('5. ✓ DNS servers configured (8.8.8.8, 1.1.1.1)');
  console.log('6. ✓ Hosts file updated with MongoDB IPs');
  
  process.exit(0);
};

testConnection().catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});