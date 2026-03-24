import express from "express";
import { 
  followMerchant, 
  unfollowMerchant, 
  checkFollowStatus, 
  getFollowingMerchants, 
  getMerchantFollowers 
} from "../controller/followController.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Follow/unfollow merchant routes
router.post("/follow/:merchantId", auth, followMerchant);
router.delete("/unfollow/:merchantId", auth, unfollowMerchant);

// Check follow status
router.get("/status/:merchantId", auth, checkFollowStatus);

// Get following merchants (for user)
router.get("/following", auth, getFollowingMerchants);

// Get followers (for merchant)
router.get("/followers", auth, getMerchantFollowers);

export default router;