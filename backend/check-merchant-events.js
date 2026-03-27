import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: "./config/config.env" });

const { Event } = await import('./models/eventSchema.js');
const { User } = await import('./models/userSchema.js');

try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  // Find all merchants
  const merchants = await User.find({ role: 'merchant' });
  console.log(`Found ${merchants.length} merchant(s)\n`);

  for (const merchant of merchants) {
    console.log(`Merchant: ${merchant.name} (${merchant.email})`);
    console.log(`ID: ${merchant._id}\n`);
    
    const events = await Event.find({ createdBy: merchant._id });
    console.log(`Events created: ${events.length}`);
    
    if (events.length > 0) {
      events.forEach((event, index) => {
        console.log(`  ${index + 1}. ${event.title}`);
        console.log(`     ID: ${event._id}`);
        console.log(`     Date: ${event.date || 'No date'}`);
        console.log('');
      });
    } else {
      console.log('  ❌ No events found for this merchant\n');
    }
    console.log('---\n');
  }

  await mongoose.disconnect();
  console.log('✅ Database connection closed');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
