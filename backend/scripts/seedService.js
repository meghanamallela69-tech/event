import mongoose from "mongoose";
import dotenv from "dotenv";
import { Service } from "./models/serviceSchema.js";
import { User } from "./models/userSchema.js";

dotenv.config();

const seedService = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find first admin user
    const admin = await User.findOne({ role: "admin" });
    
    if (!admin) {
      console.log("❌ No admin user found. Please create an admin first.");
      process.exit(1);
    }

    console.log("Found admin:", admin.email);

    // Create sample service
    const service = await Service.create({
      title: "Professional Wedding Photography",
      description: "Capture your special moments with our professional wedding photography service. Includes pre-wedding shoot, ceremony coverage, and edited photos.",
      category: "photography",
      price: 15000,
      rating: 4.8,
      images: [
        {
          public_id: "sample_wedding_1",
          url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800"
        },
        {
          public_id: "sample_wedding_2", 
          url: "https://images.unsplash.com/photo-1511285560982-1356c11d4606?w=800"
        }
      ],
      isActive: true,
      createdBy: admin._id
    });

    console.log("✅ Service created successfully!");
    console.log("Service ID:", service._id);
    console.log("Title:", service.title);
    console.log("Price: ₹", service.price);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

seedService();
