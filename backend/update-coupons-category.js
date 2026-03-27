import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Coupon } from './models/couponSchema.js';
import { User } from './models/userSchema.js';

dotenv.config({ path: './config/config.env' });

const updateCouponsWithCategory = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all merchants
    const merchants = await User.find({ role: 'merchant' });
    console.log(`Found ${merchants.length} merchant(s)\n`);

    let updatedCount = 0;

    for (const merchant of merchants) {
      console.log(`Processing merchant: ${merchant.name} (${merchant.email})`);
      
      // Find all coupons by this merchant
      const merchantCoupons = await Coupon.find({ 
        $or: [
          { createdBy: merchant._id },
          { merchantId: merchant._id }
        ]
      });

      console.log(`  Found ${merchantCoupons.length} coupons`);

      // Update each coupon with a category based on code or description
      for (const coupon of merchantCoupons) {
        let category = null;

        // Assign category based on code or description patterns
        if (coupon.code.includes('WEDDING') || coupon.description?.toLowerCase().includes('wedding')) {
          category = 'Wedding';
        } else if (coupon.code.includes('MUSIC') || coupon.description?.toLowerCase().includes('music')) {
          category = 'Music';
        } else if (coupon.code.includes('CORPORATE') || coupon.description?.toLowerCase().includes('corporate')) {
          category = 'Corporate';
        } else if (coupon.code.includes('BIRTHDAY') || coupon.description?.toLowerCase().includes('birthday')) {
          category = 'Birthday';
        } else {
          // Default: apply to all categories (null means no restriction)
          category = null;
        }

        if (category) {
          coupon.category = category;
          await coupon.save();
          updatedCount++;
          console.log(`    ✓ Updated ${coupon.code} → Category: ${category}`);
        }
      }
      
      console.log('');
    }

    console.log(`\n🎉 Update complete!`);
    console.log(`   Total coupons processed: ${updatedCount}`);
    console.log(`   Coupons without category: Will work across ALL categories`);

    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

updateCouponsWithCategory();
