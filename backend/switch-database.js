import fs from 'fs';
import path from 'path';

const switchDatabase = (target) => {
  const configPath = './config/config.env';
  let config = fs.readFileSync(configPath, 'utf8');
  
  const localURI = 'mongodb://localhost:27017/mern-stack-event-project';
  const atlasURI = 'mongodb+srv://meghana123:meghana1234@cluster0.gfbrfcg.mongodb.net/eventhub?retryWrites=true&w=majority';
  
  if (target === 'local') {
    console.log('🔄 Switching to Local MongoDB...');
    config = config.replace(/MONGO_URI=.*/g, `MONGO_URI=${localURI}`);
    console.log('✅ Configured for Local MongoDB');
    console.log('📍 Database: mern-stack-event-project');
    console.log('🔌 Restart server: node server.js');
  } else if (target === 'atlas') {
    console.log('🔄 Switching to MongoDB Atlas...');
    config = config.replace(/MONGO_URI=.*/g, `MONGO_URI=${atlasURI}`);
    console.log('✅ Configured for MongoDB Atlas');
    console.log('📍 Database: eventhub');
    console.log('🔌 Restart server: node server.js');
    console.log('⚠️  Make sure Atlas network access is configured!');
  } else {
    console.log('❌ Invalid target. Use: node switch-database.js local|atlas');
    process.exit(1);
  }
  
  fs.writeFileSync(configPath, config);
  console.log('💾 Configuration saved');
};

const target = process.argv[2];
if (!target) {
  console.log('Usage: node switch-database.js [local|atlas]');
  console.log('');
  console.log('Examples:');
  console.log('  node switch-database.js local   # Switch to local MongoDB');
  console.log('  node switch-database.js atlas   # Switch to MongoDB Atlas');
} else {
  switchDatabase(target);
}