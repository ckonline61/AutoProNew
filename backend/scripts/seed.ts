/**
 * Auto Pro — Database Seed Script
 * ─────────────────────────────────
 * Seeds the database with initial data required for the app to work:
 *  - Admin user
 *  - Service categories
 *  - Services
 *  - Spare parts
 *  - Used car listings
 *  - Coupons
 *  - Feature flags
 *  - App config
 *
 * Usage:
 *   cd backend
 *   node scripts/seed.js
 *
 * Or with ts-node:
 *   npx ts-node scripts/seed.ts
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole, ListingStatus, FuelType } from '../src/types';

// ─── Models ───────────────────────────────────────────────────────────────────
import { User } from '../src/models/user.model';
import { ServiceCategory } from '../src/models/service-category.model';
import { Service } from '../src/models/service.model';
import { SparePart } from '../src/models/spare-part.model';
import { UsedCarListing } from '../src/models/used-car-listing.model';
import { Coupon, CouponDiscountType } from '../src/models/coupon.model';
import { FeatureFlag } from '../src/models/feature-flag.model';
import { AppConfig } from '../src/models/app-config.model';
// FeatureFlag and AppConfig registered via dynamic mongoose.model() below

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auto-pro-dev';

// Use Google DNS to resolve SRV records (ISP DNS blocks SRV lookups)
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function seed() {
  console.log('🌱 Auto Pro Seed Script Starting...');
  console.log(`📡 Connecting to: ${MONGODB_URI.replace(/:([^@]+)@/, ':***@')}`);

  await mongoose.connect(MONGODB_URI);
  console.log('✅ Database connected\n');

  // ─── 1. Admin User ──────────────────────────────────────────────────────────
  console.log('👤 Creating admin user...');
  const adminExists = await User.findOne({ email: 'admin@autopro.in' });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('Admin@123', 12);
    await User.create({
      name: 'Auto Pro Admin',
      email: 'admin@autopro.in',
      phone: '9000000001',
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
      isVerified: true,
    });
    console.log('   ✅ Admin created — email: admin@autopro.in | password: Admin@123');
  } else {
    console.log('   ⏭️  Admin already exists');
  }

  // Demo Customer
  const customerExists = await User.findOne({ email: 'customer@autopro.in' });
  if (!customerExists) {
    const hashedPassword = await bcrypt.hash('Customer@123', 12);
    await User.create({
      name: 'Rahul Sharma',
      email: 'customer@autopro.in',
      phone: '9000000002',
      password: hashedPassword,
      role: UserRole.CUSTOMER,
      isActive: true,
      isVerified: true,
    });
    console.log('   ✅ Demo customer — email: customer@autopro.in | password: Customer@123');
  }

  // ─── 2. Service Categories ──────────────────────────────────────────────────
  console.log('\n📂 Creating service categories...');
  const categoriesData = [
    { name: 'Periodic Service', description: 'Engine oil, filter replacement & 40-point inspection', icon: '🔧', sortOrder: 1 },
    { name: 'AC Service & Repair', description: 'Gas refill, condenser clean & cooling inspection', icon: '❄️', sortOrder: 2 },
    { name: 'Denting & Painting', description: 'Grade-A paint booth & scratch removal', icon: '🎨', sortOrder: 3 },
    { name: 'Batteries', description: 'Free doorstep testing & branded battery replacement', icon: '🔋', sortOrder: 4 },
    { name: 'Tyres & Wheel Care', description: 'Wheel alignment, balancing & tyre replacement', icon: '🛞', sortOrder: 5 },
    { name: 'Windshield & Lights', description: 'Crack repair, headlight restoration & wipers', icon: '💡', sortOrder: 6 },
    { name: 'Suspension & Steering', description: 'Shock absorber, steering & underbody inspection', icon: '⚙️', sortOrder: 7 },
    { name: 'Brakes', description: 'Brake pad, disc & fluid replacement', icon: '🛑', sortOrder: 8 },
  ];

  const categoryMap: Record<string, mongoose.Types.ObjectId> = {};
  for (const cat of categoriesData) {
    const existing = await ServiceCategory.findOne({ name: cat.name });
    if (!existing) {
      const created = await ServiceCategory.create({ ...cat, isActive: true });
      categoryMap[cat.name] = created._id as mongoose.Types.ObjectId;
      console.log(`   ✅ ${cat.name}`);
    } else {
      categoryMap[cat.name] = existing._id as mongoose.Types.ObjectId;
      console.log(`   ⏭️  ${cat.name} exists`);
    }
  }

  // ─── 3. Services ────────────────────────────────────────────────────────────
  console.log('\n🔧 Creating services...');
  const servicesData = [
    {
      category: 'Periodic Service',
      name: 'Basic Car Service',
      description: 'Comprehensive basic car service including engine oil change, oil filter replacement, and 20-point safety inspection to keep your car running smoothly.',
      shortDescription: 'Engine oil + filter + 20-point check',
      price: 1999,
      discountedPrice: 1599,
      duration: 120,
      features: ['Engine Oil Change (3.5L Synthetic)', 'Oil Filter Replacement', '20-Point Safety Inspection', 'Brake Fluid Top-up', 'Coolant Level Check', 'Wiper Fluid Refill'],
    },
    {
      category: 'Periodic Service',
      name: 'Standard Car Service',
      description: 'Full standard service package with 40-point inspection, engine oil, filters, and exterior wash.',
      shortDescription: 'Engine oil + all filters + 40-point check',
      price: 3499,
      discountedPrice: 2799,
      duration: 180,
      features: ['Engine Oil Change (4L Premium Synthetic)', 'Oil Filter + Air Filter + Cabin Filter', '40-Point Comprehensive Inspection', 'Brake Inspection', 'Battery Health Check', 'Exterior Wash & Vacuum'],
    },
    {
      category: 'AC Service & Repair',
      name: 'AC Service & Gas Refill',
      description: 'Complete AC service including gas refill, condenser cleaning, and performance check.',
      shortDescription: 'Gas refill + condenser clean',
      price: 1799,
      discountedPrice: 1499,
      duration: 90,
      features: ['AC Gas Refill (R134a)', 'Condenser Cleaning', 'Evaporator Check', 'Compressor Inspection', 'Cooling Performance Test', 'Cabin Filter Check'],
    },
    {
      category: 'Batteries',
      name: 'Battery Replacement (Exide/Amaron)',
      description: 'Doorstep battery testing and replacement with top brands. Includes old battery pickup.',
      shortDescription: 'Doorstep battery replacement',
      price: 4999,
      discountedPrice: 3999,
      duration: 45,
      features: ['Free Battery Load Test', 'Brand New Branded Battery', 'Professional Installation', 'Old Battery Pickup', '18-Month Warranty', 'Free Home Delivery'],
    },
    {
      category: 'Tyres & Wheel Care',
      name: 'Wheel Alignment & Balancing',
      description: 'Computerized wheel alignment and dynamic balancing for smooth ride and even tyre wear.',
      shortDescription: 'Alignment + balancing',
      price: 799,
      discountedPrice: 599,
      duration: 60,
      features: ['4-Wheel Computerized Alignment', 'Dynamic Wheel Balancing', 'Tyre Pressure Check & Adjust', 'Rotation Recommendation', 'Tyre Condition Report'],
    },
    {
      category: 'Brakes',
      name: 'Brake Pad Replacement (Front)',
      description: 'Front brake pad replacement with quality OEM/OES pads and brake fluid top-up.',
      shortDescription: 'Front brake pad replacement',
      price: 2499,
      discountedPrice: 1999,
      duration: 90,
      features: ['Front Brake Pad Replacement', 'Brake Disc Inspection', 'Brake Fluid Top-up', 'Caliper Cleaning & Lubrication', 'Road Test After Service'],
    },
    {
      category: 'Suspension & Steering',
      name: 'Suspension Inspection & Repair',
      description: 'Complete suspension and steering system inspection with repair recommendations.',
      shortDescription: 'Full suspension check',
      price: 1299,
      discountedPrice: 999,
      duration: 60,
      features: ['Shock Absorber Check', 'Steering Play Inspection', 'Ball Joint Check', 'Tie Rod End Inspection', 'Detailed Report'],
    },
    {
      category: 'Windshield & Lights',
      name: 'Headlight Restoration',
      description: 'Professional headlight polishing and UV coating restoration for clear visibility.',
      shortDescription: 'Headlight polish & UV coating',
      price: 999,
      discountedPrice: 799,
      duration: 60,
      features: ['Headlight Wet Sanding', 'UV Polishing Compound', 'UV Protective Coating', 'Before/After Comparison', 'Both Headlights Included'],
    },
  ];

  for (const svc of servicesData) {
    const catId = categoryMap[svc.category];
    if (!catId) continue;
    const existing = await Service.findOne({ name: svc.name });
    if (!existing) {
      await Service.create({ ...svc, categoryId: catId, isActive: true });
      console.log(`   ✅ ${svc.name}`);
    } else {
      console.log(`   ⏭️  ${svc.name} exists`);
    }
  }

  // ─── 4. Spare Parts ─────────────────────────────────────────────────────────
  console.log('\n🔩 Creating spare parts...');
  const spareParts = [
    { name: 'Bosch Engine Oil Filter', description: 'Premium oil filter compatible with most Indian cars', brand: 'Bosch', categoryTag: 'filters', price: 349, discountedPrice: 299, stock: 50, images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'], compatibility: ['Maruti Suzuki', 'Hyundai', 'Honda', 'Tata'] },
    { name: 'Mobil 1 5W-30 Fully Synthetic Oil 4L', description: 'Advanced full synthetic engine oil for superior performance and protection', brand: 'Mobil 1', categoryTag: 'engine-oil', price: 2199, discountedPrice: 1899, stock: 30, images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400'], compatibility: ['All petrol engines'] },
    { name: 'Exide 35Ah FMI0-DIN35L Battery', description: 'Maintenance free battery for small cars — Maruti Alto, WagonR, i10', brand: 'Exide', categoryTag: 'batteries', price: 3499, discountedPrice: 2999, stock: 20, images: ['https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400'], compatibility: ['Maruti Alto', 'WagonR', 'Hyundai i10', 'Tata Nano'] },
    { name: 'TVS Euro-Grip Tyres 185/65 R15', description: 'High performance tubeless radial tyre for sedans and hatchbacks', brand: 'TVS', categoryTag: 'tyres', price: 3999, discountedPrice: 3599, stock: 15, images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'], compatibility: ['Honda City', 'Hyundai Verna', 'Maruti Ciaz'] },
    { name: 'Brembo Brake Pad Set (Front)', description: 'OEM quality brake pads for smooth stopping power', brand: 'Brembo', categoryTag: 'brakes', price: 1499, discountedPrice: 1299, stock: 25, images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'], compatibility: ['Hyundai Creta', 'Kia Seltos', 'Tata Nexon'] },
    { name: 'Denso Air Filter', description: 'High quality engine air filter for better fuel efficiency', brand: 'Denso', categoryTag: 'filters', price: 449, discountedPrice: 399, stock: 40, images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'], compatibility: ['Toyota', 'Honda', 'Maruti Suzuki'] },
    { name: '3M Car Care Kit', description: 'Complete exterior protection kit with polish, wax and glass cleaner', brand: '3M', categoryTag: 'car-care', price: 1299, discountedPrice: 999, stock: 35, images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'], compatibility: ['All cars'] },
    { name: 'Amaron 55Ah Go Battery', description: 'High performance maintenance free battery for mid-size sedans', brand: 'Amaron', categoryTag: 'batteries', price: 4299, discountedPrice: 3799, stock: 18, images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'], compatibility: ['Honda City', 'Maruti Swift', 'Hyundai i20'] },
  ];

  for (const part of spareParts) {
    const existing = await SparePart.findOne({ name: part.name });
    if (!existing) {
      await SparePart.create({ ...part, isActive: true });
      console.log(`   ✅ ${part.name}`);
    } else {
      console.log(`   ⏭️  ${part.name} exists`);
    }
  }

  // ─── 5. Used Car Listings ───────────────────────────────────────────────────
  console.log('\n🚗 Creating used car listings...');

  // Get admin user as seller
  const seller = await User.findOne({ email: 'admin@autopro.in' });

  if (seller) {
    const usedCars = [
      { brand: 'Honda', model: 'City ZX CVT', variant: 'ZX CVT Petrol', year: 2021, fuelType: FuelType.PETROL, mileage: 32000, price: 1140000, negotiable: true, description: 'Single owner, fully serviced at Honda authorized center, accident-free. Sunroof, leather seats, all original accessories.', images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600'], location: { city: 'Pune', state: 'Maharashtra' }, transmission: 'AUTOMATIC' },
      { brand: 'Tata', model: 'Harrier XZA+', variant: 'XZA+ Dark Kryotec', year: 2022, fuelType: FuelType.DIESEL, mileage: 28500, price: 1890000, negotiable: false, description: 'First owner, warranty active till 2025, fully loaded. ADAS, panoramic sunroof, all features intact.', images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600'], location: { city: 'Mumbai', state: 'Maharashtra' }, transmission: 'AUTOMATIC' },
      { brand: 'Maruti Suzuki', model: 'Swift VXI', variant: 'VXI AMT', year: 2020, fuelType: FuelType.PETROL, mileage: 45000, price: 695000, negotiable: true, description: 'Family car, all service records available, 2nd owner. Good condition, newly replaced tyres.', images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600'], location: { city: 'Bangalore', state: 'Karnataka' }, transmission: 'AUTOMATIC' },
      { brand: 'Hyundai', model: 'Creta SX(O)', variant: 'SX(O) 1.5 Turbo', year: 2023, fuelType: FuelType.PETROL, mileage: 19200, price: 1650000, negotiable: false, description: 'Like new condition, 1st owner, all accessories included. DCT automatic, sunroof, connected features.', images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600'], location: { city: 'Delhi', state: 'Delhi' }, transmission: 'AUTOMATIC' },
      { brand: 'Toyota', model: 'Innova Crysta 2.4 GX', variant: '2.4 GX MT 7-seater', year: 2019, fuelType: FuelType.DIESEL, mileage: 78000, price: 1650000, negotiable: true, description: 'Fleet maintained, all service done at Toyota. 7-seater family MPV in excellent condition.', images: ['https://images.unsplash.com/photo-1543465077-db45d34b88a5?w=600'], location: { city: 'Hyderabad', state: 'Telangana' }, transmission: 'MANUAL' },
    ];

    for (const car of usedCars) {
      const existing = await UsedCarListing.findOne({ brand: car.brand, model: car.model, year: car.year });
      if (!existing) {
        await UsedCarListing.create({ ...car, sellerId: seller._id, status: ListingStatus.ACTIVE, isActive: true, viewCount: 0 });
        console.log(`   ✅ ${car.year} ${car.brand} ${car.model}`);
      } else {
        console.log(`   ⏭️  ${car.brand} ${car.model} exists`);
      }
    }
  }

  // ─── 6. Coupons ─────────────────────────────────────────────────────────────
  console.log('\n🎟️  Creating coupons...');
  const now = new Date();
  const future = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days

  const coupons: Array<{
    code: string;
    description: string;
    discountType: CouponDiscountType;
    discountValue: number;
    minOrderAmount: number;
    maxDiscountAmount?: number;
    usageLimit: number;
    validFrom: Date;
    validTo: Date;
    isActive: boolean;
  }> = [
    { code: 'AUTOPRO20', description: 'Get 20% OFF on Periodic Service. Valid on all service bookings.', discountType: 'PERCENTAGE', discountValue: 20, minOrderAmount: 1499, maxDiscountAmount: 500, usageLimit: 100, validFrom: now, validTo: future, isActive: true },
    { code: 'PARTS15', description: 'Flat 15% OFF on all Spare Parts orders.', discountType: 'PERCENTAGE', discountValue: 15, minOrderAmount: 999, maxDiscountAmount: 300, usageLimit: 200, validFrom: now, validTo: future, isActive: true },
    { code: 'WELCOME500', description: 'Welcome discount — ₹500 OFF on your first booking!', discountType: 'FIXED', discountValue: 500, minOrderAmount: 1299, usageLimit: 1000, validFrom: now, validTo: future, isActive: true },
    { code: 'BATTERY500', description: 'Flat ₹500 OFF on Battery Replacement service.', discountType: 'FIXED', discountValue: 500, minOrderAmount: 3000, usageLimit: 50, validFrom: now, validTo: future, isActive: true },
    { code: 'FREEAC', description: 'Free AC check with any periodic service booking.', discountType: 'FIXED', discountValue: 299, minOrderAmount: 1999, usageLimit: 100, validFrom: now, validTo: future, isActive: true },
  ];

  for (const coupon of coupons) {
    const existing = await Coupon.findOne({ code: coupon.code });
    if (!existing) {
      await Coupon.create({ ...coupon, usedCount: 0 });
      console.log(`   ✅ ${coupon.code}`);
    } else {
      console.log(`   ⏭️  ${coupon.code} exists`);
    }
  }

  // ─── 7. Feature Flags ───────────────────────────────────────────────────────
  console.log('\n🚩 Creating feature flags...');
  const flags = [
    { key: 'emergency_sos', name: 'Emergency SOS', description: 'Enable emergency roadside assistance feature', isActive: true },
    { key: 'used_cars_marketplace', name: 'Used Cars Marketplace', description: 'Enable used car buying/selling feature', isActive: true },
    { key: 'spare_parts_store', name: 'Spare Parts Store', description: 'Enable spare parts e-commerce', isActive: true },
    { key: 'ai_recommendations', name: 'AI Recommendations', description: 'Enable AI mechanic recommendation engine', isActive: true },
    { key: 'razorpay_payments', name: 'Online Payments', description: 'Enable Razorpay online payment gateway', isActive: false },
  ];

  const FeatureFlagModel = FeatureFlag;
  for (const flag of flags) {
    const existing = await FeatureFlagModel.findOne({ key: flag.key });
    if (!existing) {
      await FeatureFlagModel.create(flag);
      console.log(`   ✅ ${flag.key}: ${flag.isActive ? 'ON' : 'OFF'}`);
    } else {
      console.log(`   ⏭️  ${flag.key} exists`);
    }
  }

  // ─── 8. App Config ──────────────────────────────────────────────────────────
  console.log('\n⚙️  Creating app config...');
  const AppConfigModel = AppConfig as any; // value: Mixed causes TS overload issues
  const configs: Array<{ key: string; value: string; type: 'STRING'; description: string }> = [
    { key: 'app_version_android', value: '1.0.0', type: 'STRING', description: 'Minimum supported Android app version' },
    { key: 'app_version_ios', value: '1.0.0', type: 'STRING', description: 'Minimum supported iOS app version' },
    { key: 'support_phone', value: '+91 90000 00000', type: 'STRING', description: 'Customer support phone number' },
    { key: 'support_email', value: 'support@autopro.in', type: 'STRING', description: 'Customer support email' },
    { key: 'service_areas', value: 'Mumbai, Pune, Bangalore, Delhi, Hyderabad, Chennai', type: 'STRING', description: 'Active service cities' },
    { key: 'booking_advance_days', value: '7', type: 'STRING', description: 'How many days in advance can a booking be made' },
  ];

  for (const cfg of configs) {
    const existing = await AppConfigModel.findOne({ key: cfg.key });
    if (!existing) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (AppConfigModel as any).create(cfg);      console.log(`   ✅ ${cfg.key}`);
    } else {
      console.log(`   ⏭️  ${cfg.key} exists`);
    }
  }

  // ─── Done ────────────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  ✅ SEED COMPLETE!');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Admin Login:    admin@autopro.in  / Admin@123');
  console.log('  Customer Login: customer@autopro.in / Customer@123');
  console.log('═══════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
