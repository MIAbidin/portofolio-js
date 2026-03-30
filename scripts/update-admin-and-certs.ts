import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import User from '../models/User';
import Setting from '../models/Setting';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('⚠️ MONGODB_URI not found in .env.local');

async function run() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected:', mongoose.connection.name);

    // ── 1. UPDATE ADMIN LOGIN ───────────────────────────────────────────────
    console.log('\n👤 Updating admin login...');
    const hashedPassword = await bcrypt.hash('adminNuz', 10);

    const updatedUser = await User.findOneAndUpdate(
      {
        $or: [
          { role: 'admin' },
          { email: 'admin@portfolio.com' },
          { email: 'admin' },
          { name: 'Admin' },
        ],
      },
      {
        $set: {
          name: 'Admin',
          email: 'admin', // login pakai "admin"
          password: hashedPassword,
          role: 'admin',
        },
      },
      { new: true }
    );

    if (updatedUser) {
      console.log(`✅ Admin updated -> login: ${updatedUser.email}`);
    } else {
      const newUser = await User.create({
        name: 'Admin',
        email: 'admin',
        password: hashedPassword,
        role: 'admin',
      });
      console.log(`✅ Admin created -> login: ${newUser.email}`);
    }

    // ── 2. REPLACE ALL CERTIFICATIONS ───────────────────────────────────────
    console.log('\n📜 Replacing certifications...');

    const certsEn = [
      'Introduction to Cybersecurity — Cisco Networking Academy (2024)',
      'Networking Basics — Cisco Networking Academy (2024)',
      'Learn Machine Learning Development — Dicoding Indonesia (2024)',
      'Bootcamp Digital Talent Scholarship — Kominfo & DBS Foundation (2023)',
    ];

    const certsId = [
      'Networking & Cybersecurity Basic — Cisco Academy (2024)',
      'Front End & Back End Web — MSIB Batch 6 (2024)',
      'Data Science — Dicoding Indonesia (2025)',
      'Machine Learning Engineer — DBS Foundation Coding Camp (2024)',
    ];

    await Setting.findOneAndUpdate(
      { key: 'certifications' },
      {
        $set: {
          key: 'certifications',
          type: 'textarea',
          value: certsEn.join('\n'),
          value_id: certsId.join('\n'),
        },
      },
      { upsert: true, new: true }
    );

    console.log('✅ Certifications replaced successfully');

    console.log('\n🎉 UPDATE COMPLETED SUCCESSFULLY!');
    console.log('\n📝 Login baru:');
    console.log('   Username/Login: admin');
    console.log('   Password      : adminNuz');

    console.log('\n📝 Sertifikasi baru:');
    certsEn.forEach((cert, i) => console.log(`   ${i + 1}. ${cert}`));

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ UPDATE ERROR:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

run();