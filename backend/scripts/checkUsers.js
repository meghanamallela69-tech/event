// Check if test users exist in the database
import { User } from "../models/userSchema.js";
import { dbConnection } from "../database/dbConnection.js";
import dotenv from "dotenv";

dotenv.config({ path: "./config/config.env" });

const checkUsers = async () => {
  try {
    await dbConnection();
    console.log("=".repeat(50));
    console.log("👥 CHECKING USERS IN DATABASE");
    console.log("=".repeat(50));
    
    const users = await User.find({}, 'name email role createdAt');
    
    console.log(`Found ${users.length} users in database:`);
    console.log("");
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log("");
    });
    
    // Check specific test users
    const testUsers = [
      { email: "admin@gmail.com", role: "admin" },
      { email: "merchant@test.com", role: "merchant" },
      { email: "user@test.com", role: "user" }
    ];
    
    console.log("=".repeat(50));
    console.log("🔍 CHECKING TEST USERS");
    console.log("=".repeat(50));
    
    for (const testUser of testUsers) {
      const found = await User.findOne({ email: testUser.email });
      if (found) {
        console.log(`✅ ${testUser.role.toUpperCase()}: ${testUser.email} - EXISTS`);
        console.log(`   Name: ${found.name}`);
        console.log(`   Role: ${found.role}`);
        console.log(`   Password Hash: ${found.password ? 'SET' : 'NOT SET'}`);
      } else {
        console.log(`❌ ${testUser.role.toUpperCase()}: ${testUser.email} - NOT FOUND`);
      }
      console.log("");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error checking users:", error);
    process.exit(1);
  }
};

checkUsers();