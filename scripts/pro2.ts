import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// IMPORT MODEL SESUAI STRUKTUR PROJECT KAMU
import Category from '../models/Category';
import Project from '../models/Project';

const MONGODB_URI = process.env.MONGODB_URI!;

async function main() {
  if (!MONGODB_URI) {
    throw new Error('❌ MONGODB_URI belum ada di .env.local');
  }

  await mongoose.connect(MONGODB_URI);
  console.log('✅ MongoDB connected');

  try {
    // =========================================================
    // 1. AMBIL CATEGORY ID
    // =========================================================
    const itInfrastructure = await Category.findOne({ slug: 'it-infrastructure' });
    const networkSecurity = await Category.findOne({ slug: 'network-security' });

    if (!itInfrastructure) {
      console.log('⚠️ Category it-infrastructure tidak ditemukan');
    }
    if (!networkSecurity) {
      console.log('⚠️ Category network-security tidak ditemukan');
    }

    // =========================================================
    // 2. UPSERT PROJECTS (TANPA HAPUS DATA LAMA)
    // =========================================================
    const projects = [
      {
        categoryId: itInfrastructure?._id,
        title: 'MikroTik Bandwidth Management & Quality of Service (QoS)',
        slug: 'mikrotik-bandwidth-qos',
        imagePath: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
        techStack: ['MikroTik RouterOS', 'WinBox', 'Simple Queue', 'Queue Tree'],
        githubUrl: null,
        demoUrl: null,
        isFeatured: true,
        order: 8,
        completedAt: new Date('2024-07-01'),

        description:
          'Implemented a robust QoS system on MikroTik routers to prevent network congestion. Used Mangle rules to mark packets and Queue Tree to allocate dedicated bandwidth for Zoom, VoIP, and Web Browsing, ensuring stable connectivity for all users.',
        shortDescription:
          'Optimized internet traffic distribution using Queue Tree and Mangle to prioritize critical application bandwidth.',

        description_id:
          'Menerapkan sistem QoS pada router MikroTik untuk mencegah kongesti jaringan. Menggunakan aturan Mangle untuk menandai paket dan Queue Tree untuk mengalokasikan bandwidth khusus bagi Zoom, VoIP, dan browsing web guna memastikan koneksi stabil bagi semua pengguna.',
        shortDescription_id:
          'Mengoptimalkan distribusi trafik internet menggunakan Queue Tree dan Mangle untuk memprioritaskan bandwidth aplikasi kritis.',
      },
      {
        categoryId: networkSecurity?._id,
        title: 'Integrated IP Surveillance System Deployment',
        slug: 'ip-camera-setup',
        imagePath: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80',
        techStack: ['IP Camera', 'NVR', 'PoE Switch', 'TCP/IP', 'Crimping Tool'],
        githubUrl: null,
        demoUrl: null,
        isFeatured: true,
        order: 9,
        completedAt: new Date('2024-05-20'),

        description:
          'Designed a security surveillance network involving multiple IP Cameras connected via PoE Switches. Configured the NVR for continuous recording, set up motion detection alerts, and enabled remote viewing through mobile applications via Cloud P2P.',
        shortDescription:
          'End-to-end installation and network configuration of IP-based CCTV for centralized and remote security monitoring.',

        description_id:
          'Merancang jaringan pengawasan keamanan yang melibatkan beberapa Kamera IP yang terhubung melalui Switch PoE. Mengonfigurasi NVR untuk perekaman kontinu, mengatur peringatan deteksi gerak, dan mengaktifkan pemantauan jarak jauh melalui aplikasi seluler via Cloud P2P.',
        shortDescription_id:
          'Instalasi dan konfigurasi jaringan CCTV berbasis IP untuk pemantauan keamanan terpusat dan jarak jauh.',
      },
      {
        categoryId: itInfrastructure?._id,
        title: 'Enterprise Hardware Maintenance & Troubleshooting',
        slug: 'hardware-maintenance-troubleshooting',
        imagePath: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80',
        techStack: ['Hardware Diagnostics', 'BIOS/UEFI', 'Thermal Management', 'Windows Server'],
        githubUrl: null,
        demoUrl: null,
        isFeatured: false,
        order: 10,
        completedAt: new Date('2024-04-10'),

        description:
          'Managed the lifecycle of office IT assets, including routine cleaning, thermal paste replacement, and hardware upgrades (RAM/SSD). Conducted deep-level troubleshooting for POST failures, OS corruption, and hardware-level stability issues.',
        shortDescription:
          'Performed regular hardware maintenance, component upgrades, and troubleshooting for high-performance workstations.',

        description_id:
          'Mengelola siklus hidup aset IT kantor, termasuk pembersihan rutin, penggantian thermal paste, dan upgrade perangkat keras (RAM/SSD). Melakukan troubleshooting tingkat mendalam untuk kegagalan POST, korupsi OS, dan masalah stabilitas tingkat perangkat keras.',
        shortDescription_id:
          'Melakukan pemeliharaan perangkat keras berkala, upgrade komponen, dan perbaikan pada workstation berperforma tinggi.',
      },
    ];

    for (const project of projects) {
      if (!project.categoryId) {
        console.log(`⚠️ Skip ${project.slug} karena categoryId tidak ditemukan`);
        continue;
      }

      await Project.findOneAndUpdate(
        { slug: project.slug },
        { $set: project },
        { upsert: true, new: true }
      );

      console.log(`✅ Upserted: ${project.slug}`);
    }

    console.log('🎉 Update selesai');
  } catch (error) {
    console.error('❌ Error saat update data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
}

main().catch(async (err) => {
  console.error('❌ Fatal error:', err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});