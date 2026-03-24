import { User } from "../models/userSchema.js";
import { Notification } from "../models/notificationSchema.js";

// Follow a merchant
export const followMerchant = async (req, res) => {
  try {
    const { merchantId } = req.params;
    const userId = req.user.userId || req.user._id;

    console.log(`=== FOLLOW MERCHANT ===`);
    console.log(`User ID: ${userId}`);
    console.log(`Merchant ID: ${merchantId}`);

    // Validate merchant exists and is a merchant
    const merchant = await User.findById(merchantId);
    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: "Merchant not found"
      });
    }

    if (merchant.role !== "merchant") {
      return res.status(400).json({
        success: false,
        message: "User is not a merchant"
      });
    }

    // Can't follow yourself
    if (String(userId) === String(merchantId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself"
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if already following
    const isAlreadyFollowing = user.followingMerchants.includes(merchantId);
    if (isAlreadyFollowing) {
      return res.status(400).json({
        success: false,
        message: "You are already following this merchant"
      });
    }

    // Add merchant to following list
    user.followingMerchants.push(merchantId);
    await user.save();

    // Create notification for merchant
    try {
      await Notification.create({
        user: merchantId,
        message: `${user.name} started following you`,
        type: "follow"
      });
    } catch (notifError) {
      console.error("Failed to create follow notification:", notifError);
    }

    console.log(`✅ User ${userId} now following merchant ${merchantId}`);

    return res.status(200).json({
      success: true,
      message: "Successfully followed merchant",
      isFollowing: true
    });

  } catch (error) {
    console.error("Follow merchant error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to follow merchant"
    });
  }
};

// Unfollow a merchant
export const unfollowMerchant = async (req, res) => {
  try {
    const { merchantId } = req.params;
    const userId = req.user.userId || req.user._id;

    console.log(`=== UNFOLLOW MERCHANT ===`);
    console.log(`User ID: ${userId}`);
    console.log(`Merchant ID: ${merchantId}`);

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if currently following
    const isFollowing = user.followingMerchants.includes(merchantId);
    if (!isFollowing) {
      return res.status(400).json({
        success: false,
        message: "You are not following this merchant"
      });
    }

    // Remove merchant from following list
    user.followingMerchants = user.followingMerchants.filter(
      id => String(id) !== String(merchantId)
    );
    await user.save();

    console.log(`✅ User ${userId} unfollowed merchant ${merchantId}`);

    return res.status(200).json({
      success: true,
      message: "Successfully unfollowed merchant",
      isFollowing: false
    });

  } catch (error) {
    console.error("Unfollow merchant error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to unfollow merchant"
    });
  }
};

// Check if user is following a merchant
export const checkFollowStatus = async (req, res) => {
  try {
    const { merchantId } = req.params;
    const userId = req.user.userId || req.user._id;

    console.log(`=== CHECK FOLLOW STATUS ===`);
    console.log(`User ID: ${userId}`);
    console.log(`Merchant ID: ${merchantId}`);

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isFollowing = user.followingMerchants.includes(merchantId);

    return res.status(200).json({
      success: true,
      isFollowing: isFollowing
    });

  } catch (error) {
    console.error("Check follow status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check follow status"
    });
  }
};

// Get user's following merchants
export const getFollowingMerchants = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;

    console.log(`=== GET FOLLOWING MERCHANTS ===`);
    console.log(`User ID: ${userId}`);

    // Find user with populated following merchants
    const user = await User.findById(userId)
      .populate("followingMerchants", "name email businessName serviceType")
      .select("followingMerchants");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      followingMerchants: user.followingMerchants || []
    });

  } catch (error) {
    console.error("Get following merchants error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get following merchants"
    });
  }
};

// Get merchant's followers
export const getMerchantFollowers = async (req, res) => {
  try {
    const merchantId = req.user.userId || req.user._id;

    console.log(`=== GET MERCHANT FOLLOWERS ===`);
    console.log(`Merchant ID: ${merchantId}`);

    // Find all users who are following this merchant
    const followers = await User.find({
      followingMerchants: merchantId
    }).select("name email");

    return res.status(200).json({
      success: true,
      followers: followers || [],
      followerCount: followers.length
    });

  } catch (error) {
    console.error("Get merchant followers error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get followers"
    });
  }
};