import express from "express";
import { register, login, me, getProfile, updateProfile } from "../controller/authController.js";
import { auth } from "../middleware/authMiddleware.js";
import { upload } from "../util/cloudinary.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, me);
router.get("/profile", auth, getProfile);
router.put("/profile", auth, upload.single('profileImage'), updateProfile);

export default router;
