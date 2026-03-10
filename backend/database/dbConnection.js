import mongoose from "mongoose";

export const dbConnection = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      throw new Error("MONGO_URI is not defined in environment variables!");
    }
    
    console.log("🔌 Attempting to connect to MongoDB...");
    console.log("Database URI:", mongoURI);
    
    const connection = await mongoose.connect(mongoURI);
    
    console.log("✅ Connected to database successfully!");
    console.log("📦 Database name:", connection.connection.db.databaseName);
    console.log("🌐 Host:", connection.connection.host);
    console.log("📊 Collections in database:", (await connection.connection.db.listCollections().toArray()).map(c => c.name).join(", ") || "(none yet)");
    
  } catch (error) {
    console.error("❌ Database connection failed!");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    
    // Exit process with failure code
    process.exit(1);
  }
};
