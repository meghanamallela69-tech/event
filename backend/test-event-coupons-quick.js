// Quick test to check if coupons are being returned for events
const testEvents = [
  {
    name: "Grand Luxury Wedding Planning",
    id: "69b799063ddecddff43583f5",
    merchantId: "69b78d1e2070d9f0b1e09e68"
  },
  {
    name: "Summer Music Concert Night",
    id: "69b799843ddecddff4358402",
    merchantId: "69b78d1e2070d9f0b1e09e68"
  }
];

console.log("\n=== COUPON TEST FOR EVENTS ===\n");
console.log("Test these events in browser console:\n");

testEvents.forEach(event => {
  console.log(`\n📋 Event: ${event.name}`);
  console.log(`   ID: ${event.id}`);
  console.log(`\nRun this in browser console (F12 → Console):\n`);
  console.log(`fetch('http://localhost:5000/api/coupons/available?eventId=${event.id}&totalAmount=1000', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  }
}).then(r => r.json()).then(console.log);`);
  console.log("\n---");
});

console.log("\n\nTo get your token:");
console.log("1. Login to the app");
console.log("2. Open DevTools (F12)");
console.log("3. Go to Application → Local Storage");
console.log("4. Copy the token value");
console.log("5. Replace YOUR_TOKEN_HERE in the code above");
console.log("\nExpected result: Should see GRALUX75 for Wedding event and SUMMUS64 for Summer event\n");
