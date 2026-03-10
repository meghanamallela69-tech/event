import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Service } from "../models/serviceSchema.js";
import { User } from "../models/userSchema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env file from config directory
dotenv.config({ path: join(__dirname, "..", "config", "config.env") });

// All hardcoded services from Services.jsx page
const hardcodedServices = [
  {
    title: "Wedding Planning",
    description: "End-to-end planning and coordination for your perfect wedding day.",
    category: "wedding",
    price: 75000,
    rating: 5,
    images: [
      {
        public_id: "wedding_planning_1",
        url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800"
      }
    ]
  },
  {
    title: "Corporate Events",
    description: "Professional event management for conferences, retreats, and product launches.",
    category: "corporate",
    price: 50000,
    rating: 4,
    images: [
      {
        public_id: "corporate_events_1",
        url: "https://images.unsplash.com/photo-1511578314322-374afb18df0b?w=800"
      }
    ]
  },
  {
    title: "Birthday Parties",
    description: "Memorable birthday celebrations with themes, décor, and entertainment.",
    category: "birthday",
    price: 25000,
    rating: 5,
    images: [
      {
        public_id: "birthday_parties_1",
        url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800"
      }
    ]
  },
  {
    title: "Catering Services",
    description: "Delicious custom menus and full-service catering for all occasions.",
    category: "catering",
    price: 30000,
    rating: 4,
    images: [
      {
        public_id: "catering_services_1",
        url: "https://images.unsplash.com/photo-1555244162-803834f70033?w=800"
      }
    ]
  },
  {
    title: "Photography & Videography",
    description: "Professional photo and video coverage to capture your special moments.",
    category: "photography",
    price: 15000,
    rating: 5,
    images: [
      {
        public_id: "photography_1",
        url: "https://images.unsplash.com/photo-1520854221256-17451cc330e7?w=800"
      }
    ]
  },
  {
    title: "Decoration & Floral Design",
    description: "Beautiful themed décor and floral arrangements for any event.",
    category: "decoration",
    price: 20000,
    rating: 4,
    images: [
      {
        public_id: "decoration_1",
        url: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800"
      }
    ]
  },
  {
    title: "Live Music & DJs",
    description: "Professional musicians and DJs to keep your guests entertained.",
    category: "concert",
    price: 35000,
    rating: 5,
    images: [
      {
        public_id: "music_1",
        url: "https://images.unsplash.com/photo-1514525253440-b393452e8d26?w=800"
      }
    ]
  },
  {
    title: "Camping & Outdoor Events",
    description: "Unique outdoor event experiences including camping setups.",
    category: "camping",
    price: 40000,
    rating: 4,
    images: [
      {
        public_id: "camping_1",
        url: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800"
      }
    ]
  },
  {
    title: "Gaming & Entertainment",
    description: "Interactive gaming stations and entertainment activities.",
    category: "gaming",
    price: 18000,
    rating: 4,
    images: [
      {
        public_id: "gaming_1",
        url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800"
      }
    ]
  },
  {
    title: "Anniversary Celebrations",
    description: "Romantic anniversary parties and milestone celebrations.",
    category: "anniversary",
    price: 28000,
    rating: 5,
    images: [
      {
        public_id: "anniversary_1",
        url: "https://images.unsplash.com/photo-1532712938310-34cb3958d42d?w=800"
      }
    ]
  }
];

const migrateServices = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find first admin user
    console.log("🔍 Finding admin user...");
    const admin = await User.findOne({ role: "admin" });
    
    if (!admin) {
      console.log("❌ No admin user found. Please create an admin first.");
      process.exit(1);
    }

    console.log("✅ Found admin:", admin.email);

    // Delete existing services (optional - remove this if you want to keep existing)
    console.log("🗑️  Clearing existing services...");
    await Service.deleteMany({});
    console.log("✅ Existing services cleared");

    // Insert all hardcoded services
    console.log("📝 Migrating", hardcodedServices.length, "services to database...");
    
    const servicesToInsert = hardcodedServices.map(service => ({
      ...service,
      isActive: true,
      createdBy: admin._id
    }));

    const insertedServices = await Service.insertMany(servicesToInsert);

    console.log("\n✅ Successfully migrated", insertedServices.length, "services!\n");
    
    console.log("📋 Migrated Services:");
    console.log("=" .repeat(60));
    insertedServices.forEach((service, index) => {
      console.log(`${index + 1}. ${service.title}`);
      console.log(`   Category: ${service.category}`);
      console.log(`   Price: ₹${service.price.toLocaleString()}`);
      console.log(`   Rating: ${service.rating} ⭐`);
      console.log(`   Active: ${service.isActive ? 'Yes ✅' : 'No ❌'}`);
      console.log("");
    });

    console.log("=" .repeat(60));
    console.log("\n🎉 Migration complete!");
    console.log("✨ All services are now available in Admin Dashboard");
    console.log("✨ Visit /dashboard/admin/services to manage them\n");
    
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration Error:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  }
};

migrateServices();
