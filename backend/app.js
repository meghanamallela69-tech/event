import express from "express";
import { dbConnection } from "./database/dbConnection.js";
import dotenv from "dotenv";
import messageRouter from "./router/messageRouter.js";
import authRouter from "./router/authRouter.js";
import eventRouter from "./router/eventRouter.js";
import merchantRouter from "./router/merchantRouter.js";
import adminRouter from "./router/adminRouter.js";
import adminManagementRouter from "./router/adminManagementRouter.js";
import adminProfileRouter from "./router/adminProfileRouter.js";
import adminSettingsRouter from "./router/adminSettingsRouter.js";
import bookingRouter from "./router/bookingRouter.js";
import serviceRouter from "./router/serviceRouter.js";
import paymentsRouter from "./router/paymentsRouter.js";
import reviewRouter from "./router/reviewRouter.js";
import ratingRouter from "./router/ratingRouter.js";
import notificationRouter from "./router/notificationRouter.js";
import couponRouter from "./router/couponRouter.js";
import followRouter from "./router/followRouter.js";
import marketingRouter from "./router/marketingRouter.js";
import analyticsRouter from "./router/analyticsRouter.js";
import categoryRouter from "./router/categoryRouter.js";
import cors from "cors";
import { ensureAdmin } from "./util/ensureAdmin.js";

const app = express();

dotenv.config({ path: "./config/config.env" });

app.use(
  cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Allowed origins
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        'http://192.168.1.16:5173'
      ];
      
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/message", messageRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/events", eventRouter);
app.use("/api/v1/merchant", merchantRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/admin-management", adminManagementRouter);
app.use("/api/v1/admin-profile", adminProfileRouter);
app.use("/api/v1/admin-settings", adminSettingsRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/services", serviceRouter);
app.use("/api/v1/payments", paymentsRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/ratings", ratingRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/coupons", couponRouter);
app.use("/api/v1/follow", followRouter);
app.use("/api/v1/marketing", marketingRouter);
app.use("/api/v1/analytics", analyticsRouter);
app.use("/api/v1/categories", categoryRouter);

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Cloudinary config check endpoint
app.get("/api/v1/config-check", (req, res) => {
  res.status(200).json({
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME ? "Set" : "Not Set",
      apiKey: process.env.CLOUDINARY_API_KEY ? "Set" : "Not Set",
      apiSecret: process.env.CLOUDINARY_API_SECRET ? "Set" : "Not Set",
    },
  });
});

// Initialize database connection and admin
const initializeApp = async () => {
  try {
    console.log("🚀 Starting application initialization...");
    
    // Connect to database first
    const connection = await dbConnection();
    console.log("✅ Database connection established");
    
    // Only initialize admin after successful database connection
    if (connection) {
      console.log("👤 Initializing admin user...");
      await ensureAdmin();
      console.log("✅ Admin initialization completed");
    }
  } catch (error) {
    console.error("❌ Application initialization failed:", error.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Start initialization
initializeApp();

export default app;
