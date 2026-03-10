import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import bcrypt from"bcrypt";
import { User } from "../models/userSchema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env file from config directory
dotenv.config({ path: join(__dirname, "..", "config", "config.env") });

const setupTestUsers = async () => {
  try {
   console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
   console.log("✅ Connected to database\n");

    // Clear existing test users (optional - comment out if you want to keep existing users)
   console.log("🗑️  Clearing existing test users...");
    await User.deleteMany({ 
      $or: [
        { email: "admin@gmail.com" },
        { email: "merchant@test.com" },
        { email: "user@test.com" }
      ] 
    });
   console.log("✅ Existing test users cleared\n");

    // Create test users
   const testUsers = [
      {
       name: "Admin User",
        email: "admin@gmail.com",
       password: "Admin@123",
        role: "admin"
      },
      {
       name: "Test Merchant",
        email: "merchant@test.com",
       password: "Merchant@123",
        role: "merchant",
        businessName: "Event Services Co.",
        phone: "+91 9876543210",
       serviceType: "Catering"
      },
      {
       name: "Test User",
        email: "user@test.com",
       password: "User@123",
        role: "user"
      }
    ];

   console.log("📝 Creating test users...\n");
    
    for (const userData of testUsers) {
     const hashedPassword = await bcrypt.hash(userData.password, 10);
      
     const user = await User.create({
       name: userData.name,
        email: userData.email,
       password: hashedPassword,
        role: userData.role,
        businessName: userData.businessName || "",
        phone: userData.phone || "",
       serviceType: userData.serviceType || ""
      });
      
     console.log(`✅ Created ${userData.role.toUpperCase()} user:`);
     console.log(`   Email: ${userData.email}`);
     console.log(`   Password: ${userData.password}`);
     console.log(`   Name: ${userData.name}`);
     if (userData.businessName) {
       console.log(`   Business: ${userData.businessName}`);
      }
     console.log("");
    }

   console.log("=" .repeat(60));
   console.log("\n🎉 TEST USERS CREATED SUCCESSFULLY!\n");
   console.log("=" .repeat(60));
   console.log("\n📋 LOGIN CREDENTIALS:\n");
   console.log("1. ADMIN:");
   console.log("   Email: admin@gmail.com");
   console.log("   Password: Admin@123");
   console.log("");
   console.log("2. MERCHANT:");
   console.log("   Email: merchant@test.com");
   console.log("   Password: Merchant@123");
   console.log("");
   console.log("3. USER:");
   console.log("   Email: user@test.com");
   console.log("   Password: User@123");
   console.log("");
   console.log("=" .repeat(60));
   console.log("\n✨ You can now login with any of these accounts!\n");
    
    await mongoose.disconnect();
   console.log("👋 Disconnected from database\n");
    
    process.exit(0);
    
  } catch (error) {
   console.error("\n❌ Error setting up test users:");
   console.error(error);
    process.exit(1);
  }
};

setupTestUsers();
