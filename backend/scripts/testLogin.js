// Using native fetch(no axios needed)
const API_BASE = "http://localhost:4000/api/v1";

const testLogin = async (email, password, roleName) => {
  try {
   console.log(`\n🧪 Testing ${roleName} login...`);
   console.log(`   Email: ${email}`);
   console.log(`   Password: ${password}`);
    
   const response = await fetch(`${API_BASE}/auth/login`, {
     method: 'POST',
     headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
   const data = await response.json();
    
   if (data.success) {
     console.log(`✅ ${roleName} login SUCCESSFUL!`);
     console.log(`   Token: ${data.token.substring(0, 20)}...`);
     console.log(`   User: ${data.user.name}`);
     console.log(`   Role: ${data.user.role}`);
     console.log(`   Email: ${data.user.email}`);
     return true;
    } else {
     console.log(`❌ ${roleName} login FAILED!`);
     console.log(`   Message: ${data.message}`);
     return false;
    }
  } catch (error) {
   console.log(`❌ ${roleName} login ERROR!`);
   console.log(`   Error: ${error.message}`);
   return false;
  }
};

const runTests = async () => {
  console.log("=".repeat(60));
  console.log("🔐 LOGIN SYSTEM TEST");
  console.log("=".repeat(60));
  
  const tests = [
    { email: "admin@gmail.com", password: "Admin@123", role: "ADMIN" },
    { email: "merchant@test.com", password: "Merchant@123", role: "MERCHANT" },
    { email: "user@test.com", password: "User@123", role: "USER" }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
   const result = await testLogin(test.email, test.password, test.role);
   if (result) {
     passed++;
    } else {
      failed++;
    }
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("📊 TEST RESULTS");
  console.log("=".repeat(60));
  console.log(`Total Tests: ${passed + failed}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log("=".repeat(60));
  
  if (failed === 0) {
   console.log("\n🎉 ALL LOGIN TESTS PASSED!\n");
   console.log("✨ Login system is working perfectly for all roles!");
  } else {
   console.log("\n⚠️  Some tests failed. Check the errors above.");
  }
  console.log("");
};

runTests();
