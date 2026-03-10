import express from "express";
import { dbConnection } from "./database/dbConnection.js";
import dotenv from "dotenv";
import messageRouter from "./router/messageRouter.js";
import authRouter from "./router/authRouter.js";
import eventRouter from "./router/eventRouter.js";
import merchantRouter from "./router/merchantRouter.js";
import adminRouter from "./router/adminRouter.js";
import bookingRouter from "./router/bookingRouter.js";
import serviceRouter from "./router/serviceRouter.js";
import cors from "cors";
import { ensureAdmin } from "./util/ensureAdmin.js";

const app = express();

dotenv.config({ path: "./config/config.env" });

app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/message", messageRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/events", eventRouter);
app.use("/api/v1/merchant", merchantRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/services", serviceRouter);

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

dbConnection();

// Ensure admin is created after DB connection is ready
const initAdmin = async () => {
  try {
    await ensureAdmin();
    console.log("Admin initialization completed");
  } catch (error) {
    console.error("Admin initialization failed:", error);
  }
};

// Delay admin creation slightly to ensure DB is connected
setTimeout(initAdmin, 2000);

export default app;
