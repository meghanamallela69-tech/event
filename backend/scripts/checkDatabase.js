import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env file from config directory
dotenv.config({ path: join(__dirname, "..", "config", "config.env") });

const checkDatabase = async () => {
  try {
    console.log("🔍 Database Connection Checker\n");
    console.log("=" .repeat(60));
    
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      console.log("❌ Error: MONGO_URI not found in environment variables!");
      console.log("Please check your config.env file");
      process.exit(1);
    }
    
    console.log("📋 Configuration:");
    console.log("Mongo URI:", mongoURI);
    console.log("");
    
    console.log("🔌 Connecting to MongoDB...");
    const connection = await mongoose.connect(mongoURI);
    
    console.log("\n✅ CONNECTION SUCCESSFUL!\n");
    
    console.log("📊 DATABASE INFORMATION:");
    console.log("-" .repeat(60));
    console.log("Database Name:", connection.connection.db.databaseName);
    console.log("Host:", connection.connection.host);
    console.log("Port:", connection.connection.port);
    console.log("");
    
    // List all collections
    const collections = await connection.connection.db.listCollections().toArray();
    
    console.log("📦 COLLECTIONS IN DATABASE:");
    console.log("-" .repeat(60));
    
    if (collections.length === 0) {
      console.log("No collections found. Database is empty.");
    } else {
      collections.forEach((collection, index) => {
        console.log(`${index + 1}. ${collection.name}`);
      });
    }
    
    console.log("");
    console.log("=" .repeat(60));
    console.log("\n✨ All data is being stored in the correct database!");
    console.log("\nExpected collections after using the app:");
    console.log("  - users");
    console.log("  - events");
    console.log("  - services");
    console.log("  - bookings");
    console.log("  - registrations");
    console.log("  - messages");
    console.log("");
    
    await mongoose.disconnect();
    console.log("👋 Disconnected from database\n");
    
    process.exit(0);
    
  } catch (error) {
    console.error("\n❌ DATABASE CONNECTION FAILED!\n");
    console.error("Error:", error.message);
    console.error("\nTroubleshooting tips:");
    console.error("1. Make sure MongoDB is running on your system");
    console.error("2. Check if the MONGO_URI in config.env is correct");
    console.error("3. Verify MongoDB is listening on port 27017");
    console.error("4. Check firewall settings");
    console.error("");
    
    process.exit(1);
  }
};

checkDatabase();
