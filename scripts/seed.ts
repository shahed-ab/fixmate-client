import path from 'path';
import dotenv from 'dotenv';
import { ObjectId } from 'mongodb';

// Load environment variables before importing auth/db modules
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '../server/.env') });
dotenv.config();

import { mockUsers, mockServices, mockBookings, mockPayments } from '../lib/mock-data';

// Default universal password for seeded accounts (meets all complexity rules)
const SEED_PASSWORD = 'Password123!';

async function seed() {
  console.log('====================================================');
  console.log('FixMate Database Seed');
  console.log('====================================================\n');

  // Dynamic imports to ensure process.env.MONGODB_URI is loaded
  const { auth } = await import('../lib/auth');
  const { clientPromise } = await import('../lib/mongodb');

  const mongoClient = await clientPromise;
  const dbName = process.env.DB_NAME || 'fixmate';
  const db = mongoClient.db(dbName);

  const usersCol = db.collection('user');
  const servicesCol = db.collection('services');
  const bookingsCol = db.collection('bookings');
  const paymentsCol = db.collection('payments');

  // --------------------------------------------------------------------------
  // 1. SEED USERS THROUGH auth.api.signUpEmail
  // (1 Admin, 3 Technicians, 3 Customers)
  // --------------------------------------------------------------------------
  console.log('--- 1. Seeding Users (auth.api.signUpEmail) ---');

  for (const u of mockUsers) {
    const existing = await usersCol.findOne({ email: u.email });
    if (!existing) {
      console.log(`Creating ${u.role}: ${u.name} <${u.email}>...`);
      try {
        await auth.api.signUpEmail({
          body: {
            name: u.name,
            email: u.email,
            password: SEED_PASSWORD,
            role: u.role,
            phone: u.phone || '',
            area: u.area || '',
            bio: u.bio || '',
            image: u.image || '',
          },
        });
        console.log(`  ✓ Successfully registered: ${u.email}`);
      } catch (err: unknown) {
        console.error(`  ✗ Error creating ${u.email}:`, (err as Error).message);
      }
    } else {
      console.log(`  - User already exists: ${u.email} (skipping signup)`);
    }
  }

  // Set the admin role directly in Mongo per specification
  const adminUser = mockUsers.find((u) => u.role === 'admin');
  if (adminUser) {
    console.log(`\nPromoting ${adminUser.email} to 'admin' role directly in MongoDB...`);
    await usersCol.updateOne(
      { email: adminUser.email },
      {
        $set: {
          role: 'admin',
          image: adminUser.image,
          phone: adminUser.phone,
          area: adminUser.area,
          bio: adminUser.bio,
        },
      }
    );
    console.log('  ✓ Admin role verified directly in MongoDB.');
  }

  // Ensure rich profile fields (image, phone, area, bio) are set for all users
  for (const u of mockUsers) {
    await usersCol.updateOne(
      { email: u.email },
      {
        $set: {
          image: u.image,
          phone: u.phone,
          area: u.area,
          bio: u.bio,
        },
      }
    );
  }

  // --------------------------------------------------------------------------
  // 2. SEED SERVICES (14 Approved across all 7 Categories + pending/rejected)
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Seeding Services (14 approved across all 7 categories) ---');

  // Deterministic 24-character hex ObjectIds for reproducible foreign key linking
  const serviceIdMap = new Map<string, ObjectId>();
  const serviceHexPrefix = '65a0000000000000000000';

  mockServices.forEach((s, idx) => {
    const hex = `${serviceHexPrefix}${String(idx + 1).padStart(2, '0')}`;
    serviceIdMap.set(s._id, new ObjectId(hex));
  });

  for (const s of mockServices) {
    const targetId = serviceIdMap.get(s._id)!;
    const existing = await servicesCol.findOne({
      $or: [{ _id: targetId }, { title: s.title }],
    });

    if (!existing) {
      console.log(`Inserting [${s.category}] [${s.approvalStatus}]: "${s.title}"...`);
      await servicesCol.insertOne({
        _id: targetId,
        title: s.title,
        category: s.category,
        description: s.description,
        image: s.image,
        basePrice: Number(s.basePrice),
        estimatedDuration: s.estimatedDuration,
        serviceMode: s.serviceMode,
        serviceArea: s.serviceArea,
        technicianName: s.technicianName,
        technicianEmail: s.technicianEmail,
        approvalStatus: s.approvalStatus,
        isAvailable: s.isAvailable,
        createdAt: new Date(s.createdAt),
      });
      console.log(`  ✓ Inserted: ${s.title}`);
    } else {
      console.log(`  - Service already exists: "${s.title}" (skipping)`);
    }
  }

  // --------------------------------------------------------------------------
  // 3. SEED BOOKINGS (In every status: requested, accepted, in-progress, completed, rejected, cancelled)
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Seeding Bookings (all statuses) ---');

  const bookingIdMap = new Map<string, ObjectId>();
  const bookingHexPrefix = '65b0000000000000000000';

  mockBookings.forEach((b, idx) => {
    const hex = `${bookingHexPrefix}${String(idx + 1).padStart(2, '0')}`;
    bookingIdMap.set(b._id, new ObjectId(hex));
  });

  for (const b of mockBookings) {
    const targetBookingId = bookingIdMap.get(b._id)!;
    const mappedServiceId = serviceIdMap.get(b.serviceId);
    const serviceIdStr = mappedServiceId ? mappedServiceId.toString() : b.serviceId;

    const existing = await bookingsCol.findOne({
      $or: [
        { _id: targetBookingId },
        {
          customerEmail: b.customerEmail,
          technicianEmail: b.technicianEmail,
          serviceTitle: b.serviceTitle,
          status: b.status,
        },
      ],
    });

    if (!existing) {
      console.log(`Inserting booking [${b.status}]: ${b.serviceTitle} (${b.customerName})...`);
      await bookingsCol.insertOne({
        _id: targetBookingId,
        serviceId: serviceIdStr,
        serviceTitle: b.serviceTitle,
        serviceImage: b.serviceImage,
        category: b.category,
        basePrice: Number(b.basePrice),
        technicianName: b.technicianName,
        technicianEmail: b.technicianEmail,
        customerName: b.customerName,
        customerEmail: b.customerEmail,
        customerPhone: b.customerPhone,
        address: b.address,
        preferredDate: new Date(b.preferredDate),
        problemDescription: b.problemDescription,
        status: b.status,
        finalAmount: Number(b.finalAmount),
        paymentStatus: b.paymentStatus,
        createdAt: new Date(b.createdAt),
      });
      console.log(`  ✓ Inserted booking: ${targetBookingId}`);
    } else {
      console.log(`  - Booking already exists: [${b.status}] ${b.serviceTitle} (skipping)`);
    }
  }

  // --------------------------------------------------------------------------
  // 4. SEED PAYMENTS (For paid completed bookings)
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Seeding Payments (paid bookings) ---');

  const paymentIdMap = new Map<string, ObjectId>();
  const paymentHexPrefix = '65c0000000000000000000';

  mockPayments.forEach((p, idx) => {
    const hex = `${paymentHexPrefix}${String(idx + 1).padStart(2, '0')}`;
    paymentIdMap.set(p._id, new ObjectId(hex));
  });

  for (const p of mockPayments) {
    const targetPaymentId = paymentIdMap.get(p._id)!;
    const mappedBookingId = bookingIdMap.get(p.bookingId);
    const bookingIdStr = mappedBookingId ? mappedBookingId.toString() : p.bookingId;

    const existing = await paymentsCol.findOne({
      $or: [
        { _id: targetPaymentId },
        { stripeSessionId: p.stripeSessionId },
        { transactionId: p.transactionId },
        { bookingId: bookingIdStr },
      ],
    });

    if (!existing) {
      console.log(`Inserting payment: ${p.transactionId} ($${p.amount}) for booking ${bookingIdStr}...`);
      await paymentsCol.insertOne({
        _id: targetPaymentId,
        bookingId: bookingIdStr,
        serviceTitle: p.serviceTitle,
        customerName: p.customerName,
        customerEmail: p.customerEmail,
        technicianName: p.technicianName,
        technicianEmail: p.technicianEmail,
        amount: Number(p.amount),
        currency: p.currency || 'usd',
        transactionId: p.transactionId,
        stripeSessionId: p.stripeSessionId,
        paymentStatus: p.paymentStatus,
        paidAt: new Date(p.paidAt),
      });
      console.log(`  ✓ Inserted payment: ${targetPaymentId}`);
    } else {
      console.log(`  - Payment already exists: ${p.transactionId} (skipping)`);
    }
  }

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  const [totalUsers, totalServices, totalBookings, totalPayments] = await Promise.all([
    usersCol.countDocuments(),
    servicesCol.countDocuments(),
    bookingsCol.countDocuments(),
    paymentsCol.countDocuments(),
  ]);

  console.log('\n====================================================');
  console.log('FixMate Seeding Completed Successfully!');
  console.log('====================================================');
  console.log(`Total Users in DB:    ${totalUsers}`);
  console.log(`Total Services in DB: ${totalServices}`);
  console.log(`Total Bookings in DB: ${totalBookings}`);
  console.log(`Total Payments in DB: ${totalPayments}`);
  console.log(`\nAll seeded user accounts use password: "${SEED_PASSWORD}"`);
  console.log('Admin account: admin@fixmate.io');
  console.log('Technicians:   alex.technician@fixmate.io, marcus.technician@fixmate.io, david.technician@fixmate.io');
  console.log('Customers:     sarah.customer@fixmate.io, michael.customer@fixmate.io, emily.customer@fixmate.io');
  console.log('====================================================\n');

  await mongoClient.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('\nSeed failed with uncaught error:', err);
  process.exit(1);
});
