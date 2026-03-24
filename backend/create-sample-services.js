import mongoose from "mongoose";
import { Service } from "./models/serviceSchema.js";
import { User } from "./models/userSchema.js";
import dotenv from "dotenv";

dotenv.config({ path: "./config/config.env" });

const createSampleServices = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find admin user
    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      console.error("❌ No admin user found. Please create an admin user first.");
      process.exit(1);
    }
    console.log("✅ Found admin user:", admin.email);

    // Check if services already exist
    const existingServices = await Service.countDocuments();
    if (existingServices > 0) {
      console.log(`⚠️ ${existingServices} services already exist. Skipping creation.`);
      process.exit(0);
    }

    const sampleServices = [
      {
        title: "Premium Wedding Planning",
        description: "Complete end-to-end wedding planning service including venue selection, decoration, catering coordination, and day-of management. We handle every detail to make your special day perfect.",
        category: "wedding",
        price: 150000,
        rating: 4.8,
        images: [
          {
            public_id: "sample_wedding_1",
            url: "/wedding.jpg"
          }
        ],
        createdBy: admin._id
      },
      {
        title: "Corporate Event Management",
        description: "Professional corporate event planning for conferences, product launches, team building events, and business meetings. Includes venue, catering, AV equipment, and logistics management.",
        category: "corporate",
        price: 75000,
        rating: 4.6,
        images: [
          {
            public_id: "sample_corporate_1",
            url: "/restaurant.jpg"
          }
        ],
        createdBy: admin._id
      },
      {
        title: "Birthday Party Celebration",
        description: "Fun and memorable birthday party planning with themed decorations, entertainment, cake arrangements, and party favors. Perfect for kids and adults of all ages.",
        category: "birthday",
        price: 25000,
        rating: 4.7,
        images: [
          {
            public_id: "sample_birthday_1",
            url: "/birthday.jpg"
          }
        ],
        createdBy: admin._id
      },
      {
        title: "Professional Catering Service",
        description: "High-quality catering service with customizable menus for all types of events. From intimate gatherings to large celebrations, we provide delicious food and professional service.",
        category: "catering",
        price: 35000,
        rating: 4.5,
        images: [
          {
            public_id: "sample_catering_1",
            url: "/party.jpg"
          }
        ],
        createdBy: admin._id
      },
      {
        title: "Event Photography & Videography",
        description: "Professional photography and videography services to capture your special moments. Includes pre-event consultation, full event coverage, and edited photos/videos delivered digitally.",
        category: "photography",
        price: 20000,
        rating: 4.9,
        images: [
          {
            public_id: "sample_photography_1",
            url: "/anniversary.jpg"
          }
        ],
        createdBy: admin._id
      },
      {
        title: "Event Decoration & Design",
        description: "Creative event decoration and design services including floral arrangements, lighting, backdrop design, and themed decorations to transform your venue into a magical space.",
        category: "decoration",
        price: 30000,
        rating: 4.4,
        images: [
          {
            public_id: "sample_decoration_1",
            url: "/gamenight.jpg"
          }
        ],
        createdBy: admin._id
      }
    ];

    console.log("🎯 Creating sample services...");
    const createdServices = await Service.insertMany(sampleServices);
    
    console.log(`✅ Successfully created ${createdServices.length} sample services:`);
    createdServices.forEach((service, index) => {
      console.log(`   ${index + 1}. ${service.title} - ₹${service.price} (${service.category})`);
    });

    await mongoose.disconnect();
    console.log("✅ Sample services creation completed");
  } catch (error) {
    console.error("❌ Error creating sample services:", error.message);
    process.exit(1);
  }
};

createSampleServices();