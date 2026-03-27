import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Coupon } from './models/couponSchema.js';
import { Event } from './models/eventSchema.js';
import { User } from './models/userSchema.js';

dotenv.config({ path: './config/config.env' });

const seedCoupons = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find a merchant user
    const merchant = await User.findOne({ role: 'merchant' });
    if (!merchant) {
      console.log('❌ No merchant user found. Please create a merchant first.');
      await mongoose.disconnect();
      return;
    }

    console.log(`👤 Using Merchant: ${merchant.name} (${merchant.email})\n`);

    // Find events created by this merchant
    const events = await Event.find({ createdBy: merchant._id });
    console.log(`📅 Found ${events.length} events created by merchant\n`);

    if (events.length === 0) {
      console.log('⚠️ No events found. Creating sample coupons for ALL events anyway.\n');
    }

    // Delete existing test coupons
    await Coupon.deleteMany({ 
      $or: [
        { code: 'WELCOME10' },
        { code: 'SAVE20' },
        { code: 'FLAT50' }
      ]
    });
    console.log('🗑️ Deleted existing test coupons\n');

    // Create sample coupons
    const couponsToCreate = [
      {
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        maxDiscount: 500,
        minAmount: 500,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        usageLimit: 100,
        usedCount: 0,
        isActive: true,
        description: 'Welcome offer - 10% off on your first booking',
        createdBy: merchant._id,
        merchantId: merchant._id,
        applyTo: 'ALL',
        eventId: null
      },
      {
        code: 'SAVE20',
        discountType: 'percentage',
        discountValue: 20,
        maxDiscount: 2000,
        minAmount: 1000,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        usageLimit: 50,
        usedCount: 0,
        isActive: true,
        description: 'Special discount - 20% off on bookings above ₹1000',
        createdBy: merchant._id,
        merchantId: merchant._id,
        applyTo: 'ALL',
        eventId: null
      },
      {
        code: 'FLAT50',
        discountType: 'flat',
        discountValue: 50,
        maxDiscount: null,
        minAmount: 300,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        usageLimit: 200,
        usedCount: 0,
        isActive: true,
        description: 'Flat ₹50 off on bookings above ₹300',
        createdBy: merchant._id,
        merchantId: merchant._id,
        applyTo: 'ALL',
        eventId: null
      }
    ];

    // If we have events, create event-specific coupon too
    if (events.length > 0) {
      const firstEvent = events[0];
      couponsToCreate.push({
        code: 'EVENT25',
        discountType: 'percentage',
        discountValue: 25,
        maxDiscount: 3000,
        minAmount: 1500,
        expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        usageLimit: 30,
        usedCount: 0,
        isActive: true,
        description: `Exclusive 25% off on ${firstEvent.title}`,
        createdBy: merchant._id,
        merchantId: merchant._id,
        applyTo: 'EVENT',
        eventId: firstEvent._id
      });
      console.log(`🎫 Created event-specific coupon: EVENT25 for "${firstEvent.title}"\n`);
    }

    // Create all coupons
    const createdCoupons = [];
    for (const couponData of couponsToCreate) {
      const coupon = await Coupon.create(couponData);
      createdCoupons.push(coupon);
      console.log(`✅ Created: ${coupon.code} - ${coupon.discountValue}${coupon.discountType === 'percentage' ? '%' : '₹'} | applyTo: ${coupon.applyTo}`);
    }

    console.log(`\n🎉 Successfully created ${createdCoupons.length} sample coupons!`);
    console.log('\n📋 Summary:');
    console.log(`   - WELCOME10: 10% off (All Events)`);
    console.log(`   - SAVE20: 20% off (All Events)`);
    console.log(`   - FLAT50: ₹50 off (All Events)`);
    if (events.length > 0) {
      console.log(`   - EVENT25: 25% off (Specific Event)`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

seedCoupons();
