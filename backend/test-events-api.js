import axios from 'axios';

const testEventsAPI = async () => {
  try {
    console.log('🔍 Testing Events API...');
    
    const response = await axios.get('http://localhost:4001/api/v1/events', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWI5MmIwYmZjNmQxYWRiYmEyYjJmYWQiLCJyb2xlIjoidXNlciIsImlhdCI6MTczNzM4NzE5MSwiZXhwIjoxNzM3OTkxOTkxfQ.Ej8Ej_Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'
      }
    });
    
    console.log('✅ API Response Status:', response.status);
    console.log('✅ Success:', response.data.success);
    console.log('✅ Events Count:', response.data.events?.length || 0);
    
    if (response.data.events && response.data.events.length > 0) {
      console.log('\n📊 First 3 Events:');
      response.data.events.slice(0, 3).forEach((event, index) => {
        console.log(`\n${index + 1}. ${event.title}`);
        console.log(`   ID: ${event._id}`);
        console.log(`   Event Type: ${event.eventType || 'NOT SET'}`);
        console.log(`   Price: ₹${event.price || 0}`);
        console.log(`   Status: ${event.status}`);
        console.log(`   Ticket Types: ${event.ticketTypes?.length || 0}`);
        
        if (event.ticketTypes && event.ticketTypes.length > 0) {
          event.ticketTypes.forEach((ticket, i) => {
            console.log(`     ${i + 1}. ${ticket.name} - ₹${ticket.price}`);
          });
        }
      });
      
      // Check for events missing eventType
      const missingEventType = response.data.events.filter(e => !e.eventType);
      if (missingEventType.length > 0) {
        console.log(`\n❌ ${missingEventType.length} events missing eventType:`);
        missingEventType.forEach(event => {
          console.log(`   - ${event.title} (ID: ${event._id})`);
        });
      } else {
        console.log('\n✅ All events have eventType set');
      }
    }
    
  } catch (error) {
    console.error('❌ API Test Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
};

testEventsAPI();