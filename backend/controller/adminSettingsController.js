import { Setting } from "../models/settingSchema.js";

// Get platform settings
export const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    
    // Create default settings if none exist
    if (!settings) {
      settings = await Setting.create({
        commissionPercentage: 10,
        platformName: "Event Management System",
        supportEmail: "support@eventmanagement.com"
      });
    }

    return res.status(200).json({ 
      success: true, 
      settings 
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch settings" });
  }
};

// Update platform settings
export const updateSettings = async (req, res) => {
  try {
    const updateData = req.body;
    
    // Remove readonly fields
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    let settings = await Setting.findOne();
    
    if (!settings) {
      settings = await Setting.create(updateData);
    } else {
      settings = await Setting.findByIdAndUpdate(
        settings._id,
        updateData,
        { new: true, runValidators: true }
      );
    }

    return res.status(200).json({ 
      success: true, 
      message: "Settings updated successfully",
      settings 
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to update settings" });
  }
};

// Reset settings to default
export const resetSettings = async (req, res) => {
  try {
    await Setting.deleteMany({});
    
    const settings = await Setting.create({
      commissionPercentage: 10,
      platformName: "Event Management System",
      supportEmail: "support@eventmanagement.com",
      enableCoupons: true,
      enableReviews: true,
      maintenanceMode: false
    });

    return res.status(200).json({ 
      success: true, 
      message: "Settings reset to default",
      settings 
    });
  } catch (error) {
    console.error("Reset settings error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to reset settings" });
  }
};
