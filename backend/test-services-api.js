import axios from 'axios';

const testServicesAPI = async () => {
  try {
    console.log('🔍 Testing Services API...');
    
    const response = await axios.get('http://localhost:4001/api/v1/services');
    
    console.log('✅ API Response Status:', response.status);
    console.log('✅ Success:', response.data.success);
    console.log('✅ Services Count:', response.data.services?.length || 0);
    
    if (response.data.services && response.data.services.length > 0) {
      console.log('\n📊 First 3 Services:');
      response.data.services.slice(0, 3).forEach((service, index) => {
        console.log(`\n${index + 1}. ${service.title}`);
        console.log(`   ID: ${service._id}`);
        console.log(`   Category: ${service.category}`);
        console.log(`   Price: ₹${service.price}`);
        console.log(`   Rating: ${service.rating}`);
        console.log(`   Images: ${service.images?.length || 0}`);
        console.log(`   Active: ${service.isActive}`);
        console.log(`   Created By: ${service.createdBy}`);
      });
    } else {
      console.log('\n⚠️ No services found in database');
      console.log('   This means no services have been created yet.');
      console.log('   Services need to be created by admin through the admin panel.');
    }
    
  } catch (error) {
    console.error('❌ API Test Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
};

testServicesAPI();