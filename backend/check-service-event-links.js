import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: "./config/config.env" });

const { Service } = await import('./models/serviceSchema.js');
const { Event } = await import('./models/eventSchema.js');

try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  // Get all services
  const services = await Service.find({}).select('title eventId').limit(5);
  
  console.log('📋 SERVICES (first 5):\n');
  services.forEach((service, index) => {
    console.log(`${index + 1}. ${service.title}`);
    console.log(`   Service ID: ${service._id}`);
    console.log(`   Event ID: ${service.eventId || '❌ NO EVENT ID'}`);
    console.log('');
  });

  // Check if services are linked to Wedding or Music events
  const weddingEventId = "69b799063ddecddff43583f5";
  const musicEventId = "69b799843ddecddff4358402";
  
  const weddingServices = await Service.find({ eventId: weddingEventId });
  const musicServices = await Service.find({ eventId: musicEventId });
  
  console.log('\n=== SERVICE-EVENT LINKS ===');
  console.log(`Services linked to Wedding (${weddingEventId}):`, weddingServices.length);
  console.log(`Services linked to Music (${musicEventId}):`, musicServices.length);
  
  if (weddingServices.length > 0) {
    console.log('\nWedding Services:');
    weddingServices.forEach(s => console.log(`  - ${s.title} (${s._id})`));
  }
  
  if (musicServices.length > 0) {
    console.log('\nMusic Services:');
    musicServices.forEach(s => console.log(`  - ${s.title} (${s._id})`));
  }

  await mongoose.disconnect();
  console.log('\n✅ Database connection closed');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
