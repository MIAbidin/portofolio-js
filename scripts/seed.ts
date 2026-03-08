// scripts/seed.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import User from '../models/User';
import Category from '../models/Category';
import Project from '../models/Project';
import Experience from '../models/Experience';
import Skill from '../models/Skill';
import Setting from '../models/Setting';
import Message from '../models/Message';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('⚠️ MONGODB_URI tidak ditemukan di .env.local');

async function seedDatabase() {
  try {
    console.log('🔄 Menghubungkan ke MongoDB...');
    await mongoose.connect(MONGODB_URI as string);
    console.log('✅ Terhubung ke database:', mongoose.connection.name, '\n');

    console.log('🗑️  Menghapus data lama...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Project.deleteMany({}),
      Experience.deleteMany({}),
      Skill.deleteMany({}),
      Setting.deleteMany({}),
      Message.deleteMany({}),
    ]);
    console.log('✅ Data lama terhapus\n');

    // ── 1. USERS ──────────────────────────────────────────────────────────────
    console.log('🌱 Seeding Users...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const user = await User.create({
      name: 'Admin',
      email: 'admin@portfolio.com',
      password: hashedPassword,
      role: 'admin',
    });
    console.log(`✅ Created user: ${user.email}\n`);

    // ── 2. SETTINGS ───────────────────────────────────────────────────────────
    console.log('🌱 Seeding Settings...');
    const settings = await Setting.insertMany([
      { key: 'hero_title',    value: 'Muhammad Irfan Abidin', type: 'text' },
      { key: 'hero_subtitle', value: 'IT Operations internship di PT Pan Brothers Tbk dengan pengalaman menangani 40+ kasus support per minggu. Lulusan S1 Teknik Informatika dengan keahlian IT Support, Network Infrastructure, Troubleshooting, dan Web Development. Berfokus pada Machine Learning dan AI untuk transformasi digital.', type: 'textarea' },
      { key: 'hero_cta_text', value: 'Download CV', type: 'text' },
      { key: 'about_title',   value: 'Tentang', type: 'text' },
      { key: 'about_text',    value: `Saya adalah lulusan S1 Teknik Informatika dari Universitas Muhammadiyah Surakarta dengan IPK 3.83/4.00. Saat ini bekerja sebagai IT Operations internship di PT Pan Brothers Tbk, bertanggung jawab menangani rata-rata 40+ kasus support per minggu terkait hardware, software, jaringan, dan sistem komunikasi dalam lingkungan manufaktur skala besar.

Memiliki pengalaman sebagai IT Support dan Asisten Dosen di UMS, serta IT Support internship di DPRD Kota Surakarta. Terampil dalam troubleshooting sistem, instalasi dan konfigurasi infrastruktur IT, manajemen jaringan LAN, instalasi CCTV, serta inventarisasi dan dokumentasi aset IT. Berpengalaman dalam perbaikan hardware, maintenance preventive, dan memberikan dukungan teknis yang efisien.

Selain keahlian IT Support, saya memiliki minat mendalam dalam Data Science, Machine Learning, dan Artificial Intelligence. Telah menyelesaikan berbagai sertifikasi profesional dari Cisco, MSIB, DBS Foundation, dan Dicoding. Saya berkomitmen untuk terus mengembangkan kemampuan teknis dan berkontribusi dalam transformasi digital melalui solusi teknologi yang inovatif.`, type: 'textarea' },
      { key: 'contact_email',    value: 'muhammadirfanabidin@gmail.com',                  type: 'text' },
      { key: 'contact_phone',    value: '+62 896 6939 1458',                              type: 'text' },
      { key: 'contact_location', value: 'Karanganyar, Jawa Tengah',                      type: 'text' },
      { key: 'social_github',    value: 'https://github.com/MIAbidin',                   type: 'url'  },
      { key: 'social_linkedin',  value: 'https://linkedin.com/in/muhammad-irfan-abidin', type: 'url'  },
      { key: 'social_instagram', value: 'https://instagram.com/mia.abidin',              type: 'url'  },
      { key: 'brand_initials',   value: 'MIA',  type: 'text' },
      { key: 'brand_suffix',     value: '.Dev', type: 'text' },
      { key: 'site_title',       value: 'Muhammad Irfan Abidin - IT Support & Software Developer Portfolio', type: 'text' },
      { key: 'site_description', value: 'Portfolio profesional Muhammad Irfan Abidin - Lulusan Teknik Informatika dengan keahlian IT Support, Network Infrastructure, Web Development, Machine Learning, dan Data Science. Berpengalaman sebagai IT Support dan Asisten Dosen.', type: 'textarea' },
      { key: 'site_keywords',    value: 'IT Support, Network Infrastructure, Troubleshooting, Web Developer, Machine Learning, Data Science, Artificial Intelligence, Python, SQL, Laravel, Teknik Informatika, UMS', type: 'text' },
    ]);
    console.log(`✅ Created ${settings.length} settings\n`);

    // ── 3. CATEGORIES ─────────────────────────────────────────────────────────
    console.log('🌱 Seeding Categories...');
    const categories = await Category.insertMany([
      { name: 'Web Development',                 slug: 'web-development',   icon: 'code-bracket'  },
      { name: 'Data Science & Machine Learning', slug: 'data-science-ml',  icon: 'chart-bar'     },
      { name: 'IT Infrastructure',               slug: 'it-infrastructure', icon: 'server'        },
      { name: 'Network & Security',              slug: 'network-security',  icon: 'shield-check'  },
    ]);
    console.log(`✅ Created ${categories.length} categories`);

    const [webDevId, aiId, infraId, netSecId] = categories.map(c => c._id);
    console.log(`   - Web Dev ID:  ${webDevId}`);
    console.log(`   - AI/DS ID:    ${aiId}`);
    console.log(`   - Infra ID:    ${infraId}`);
    console.log(`   - NetSec ID:   ${netSecId}\n`);

    // ── 4. PROJECTS ───────────────────────────────────────────────────────────
    console.log('🌱 Seeding Projects...');
    const projects = await Project.insertMany([
      {
        categoryId: webDevId, title: 'Sistem Informasi Manajemen Barang',
        slug: 'sistem-informasi-manajemen-barang',
        description: 'Aplikasi web untuk mengelola inventori barang di gudang dengan fitur tracking stok real-time, laporan otomatis, dan multi-user access control. Sistem ini dirancang untuk meningkatkan efisiensi pengelolaan barang masuk dan keluar dengan interface yang user-friendly.',
        shortDescription: 'Web app untuk manajemen inventori dengan tracking real-time dan reporting otomatis.',
        imagePath: 'https://images.unsplash.com/photo-1586528116311-ad8ed7c50a63?w=800&q=80',
        techStack: ['Laravel 10', 'MySQL', 'Bootstrap 5', 'jQuery', 'Chart.js'],
        githubUrl: 'https://github.com/yourusername/inventory-system',
        demoUrl: 'https://demo-inventory.yourdomain.com',
        isFeatured: true, order: 1, completedAt: new Date('2023-11-15'),
      },
      {
        categoryId: webDevId, title: 'Platform Manajemen Magang',
        slug: 'platform-manajemen-magang',
        description: 'Platform untuk mengelola program magang mahasiswa dengan fitur pendaftaran online, monitoring aktivitas, penilaian, dan laporan. Sistem ini memfasilitasi komunikasi antara mahasiswa, pembimbing kampus, dan pembimbing industri.',
        shortDescription: 'Platform digital untuk pengelolaan program magang mahasiswa.',
        imagePath: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
        techStack: ['Laravel 9', 'MySQL', 'Tailwind CSS', 'Alpine.js', 'Livewire'],
        githubUrl: 'https://github.com/yourusername/internship-platform',
        demoUrl: null, isFeatured: true, order: 2, completedAt: new Date('2023-08-20'),
      },
      {
        categoryId: webDevId, title: 'Sistem Absensi Online',
        slug: 'sistem-absensi-online',
        description: 'Aplikasi absensi karyawan berbasis web dengan fitur geolocation untuk memastikan kehadiran dari lokasi yang valid. Dilengkapi dengan dashboard analytics, export laporan, dan notifikasi real-time untuk HR.',
        shortDescription: 'Sistem absensi dengan geolocation dan analytics dashboard.',
        imagePath: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
        techStack: ['PHP', 'Laravel 10', 'MySQL', 'Google Maps API', 'Vue.js 3'],
        githubUrl: 'https://github.com/yourusername/attendance-system',
        demoUrl: 'https://demo-attendance.yourdomain.com',
        isFeatured: false, order: 3, completedAt: new Date('2023-05-10'),
      },
      {
        categoryId: aiId, title: 'Klasifikasi Gambar Produk dengan CNN',
        slug: 'klasifikasi-gambar-produk-cnn',
        description: 'Model machine learning untuk mengklasifikasikan gambar produk garmen ke dalam 10 kategori berbeda menggunakan Convolutional Neural Network. Model mencapai akurasi 92% pada validation set dengan data augmentation dan transfer learning menggunakan ResNet50.',
        shortDescription: 'CNN model untuk klasifikasi gambar produk dengan akurasi 92%.',
        imagePath: 'https://images.unsplash.com/photo-1627404068305-65fb5a6538b5?w=800&q=80',
        techStack: ['Python', 'TensorFlow', 'Keras', 'OpenCV', 'NumPy', 'Pandas'],
        githubUrl: 'https://github.com/yourusername/image-classification-cnn',
        demoUrl: null, isFeatured: true, order: 4, completedAt: new Date('2022-06-30'),
      },
      {
        categoryId: aiId, title: 'Dashboard Analytics IT Support',
        slug: 'dashboard-analytics-it-support',
        description: 'Dashboard interaktif untuk memvisualisasikan data performa IT support team menggunakan data historis tiket support. Menampilkan metrik KPI seperti resolution time, ticket volume, category breakdown, dan trend analysis.',
        shortDescription: 'Dashboard untuk analytics dan visualisasi data IT support.',
        imagePath: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
        techStack: ['Python', 'Pandas', 'Matplotlib', 'Seaborn', 'Jupyter Notebook', 'SQL'],
        githubUrl: 'https://github.com/yourusername/it-support-analytics',
        demoUrl: null, isFeatured: false, order: 5, completedAt: new Date('2023-03-15'),
      },
      {
        categoryId: infraId, title: 'Network Monitoring System',
        slug: 'network-monitoring-system',
        description: 'Sistem monitoring jaringan untuk memantau status perangkat network (router, switch, access point) secara real-time. Dilengkapi dengan alerting system dan historical data untuk analisis network performance.',
        shortDescription: 'Real-time network monitoring dengan alerting system.',
        imagePath: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
        techStack: ['Python', 'Flask', 'SNMP', 'Redis', 'PostgreSQL', 'Chart.js'],
        githubUrl: 'https://github.com/yourusername/network-monitoring',
        demoUrl: null, isFeatured: true, order: 6, completedAt: new Date('2023-09-25'),
      },
      {
        categoryId: infraId, title: 'CCTV Management Dashboard',
        slug: 'cctv-management-dashboard',
        description: 'Dashboard web untuk mengelola dan memonitor status CCTV IP Camera di multiple lokasi. Fitur mencakup live view, playback recording, camera health monitoring, dan storage management.',
        shortDescription: 'Dashboard untuk manajemen dan monitoring CCTV IP Camera.',
        imagePath: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80',
        techStack: ['Laravel', 'MySQL', 'WebRTC', 'FFmpeg', 'Bootstrap'],
        githubUrl: null, demoUrl: null, isFeatured: false, order: 7, completedAt: new Date('2023-07-10'),
      },
      {
        categoryId: netSecId, title: 'Mikrotik Configuration Scripts',
        slug: 'mikrotik-configuration-scripts',
        description: 'Koleksi script dan template konfigurasi Mikrotik RouterOS untuk berbagai use case: bandwidth management, hotspot setup, VPN configuration, firewall rules, dan network security hardening.',
        shortDescription: 'Script collection untuk konfigurasi dan automation Mikrotik.',
        imagePath: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80',
        techStack: ['RouterOS Script', 'Bash', 'Python', 'Mikrotik API'],
        githubUrl: 'https://github.com/yourusername/mikrotik-scripts',
        demoUrl: null, isFeatured: false, order: 8, completedAt: new Date('2023-10-05'),
      },
    ]);
    console.log(`✅ Created ${projects.length} projects`);
    console.log(`   - Featured: ${projects.filter(p => p.isFeatured).length}\n`);

    // ── 5. SKILLS ─────────────────────────────────────────────────────────────
    console.log('🌱 Seeding Skills...');
    const skills = await Skill.insertMany([
      { name: 'Laravel',           category: 'hard', subcategory: 'Web Dev',        proficiency: 85, icon: 'laravel',    isFeatured: true,  order: 1  },
      { name: 'Next.js',           category: 'hard', subcategory: 'Web Dev',        proficiency: 80, icon: 'react',      isFeatured: true,  order: 2  },
      { name: 'Python',            category: 'hard', subcategory: 'Programming',    proficiency: 80, icon: 'python',     isFeatured: true,  order: 3  },
      { name: 'Deep Learning',     category: 'hard', subcategory: 'AI/ML',          proficiency: 75, icon: 'brain',      isFeatured: true,  order: 4  },
      { name: 'Network Admin',     category: 'hard', subcategory: 'Infrastructure', proficiency: 80, icon: 'server',     isFeatured: true,  order: 5  },
      { name: 'MySQL / Database',  category: 'hard', subcategory: 'Database',       proficiency: 85, icon: 'mysql',      isFeatured: true,  order: 6  },
      { name: 'PHP',               category: 'hard', subcategory: 'Web Dev',        proficiency: 80, icon: 'php',        isFeatured: false, order: 7  },
      { name: 'JavaScript',        category: 'hard', subcategory: 'Web Dev',        proficiency: 75, icon: 'javascript', isFeatured: false, order: 8  },
      { name: 'Linux',             category: 'hard', subcategory: 'Infrastructure', proficiency: 75, icon: 'linux',      isFeatured: false, order: 9  },
      { name: 'Git',               category: 'hard', subcategory: 'Tools',          proficiency: 80, icon: 'git',        isFeatured: false, order: 10 },
      { name: 'Problem Solving',     category: 'soft', proficiency: 90, icon: 'puzzle', isFeatured: false, order: 11 },
      { name: 'Analytical Thinking', category: 'soft', proficiency: 85, icon: 'brain',  isFeatured: false, order: 12 },
      { name: 'Team Collaboration',  category: 'soft', proficiency: 85, icon: 'users',  isFeatured: false, order: 13 },
      { name: 'Time Management',     category: 'soft', proficiency: 80, icon: 'clock',  isFeatured: false, order: 14 },
    ]);
    console.log(`✅ Created ${skills.length} skills\n`);

    // ── 6. EXPERIENCES ────────────────────────────────────────────────────────
    console.log('🌱 Seeding Experiences...');
    const experiences = await Experience.insertMany([
      {
        type: 'work', title: 'IT Operations Intern', company: 'PT Pan Brothers Tbk',
        location: 'Sragen, Jawa Tengah',
        startDate: new Date('2025-10-01'), endDate: null,
        description: 'Bertanggung jawab sebagai First Level Support dalam lingkungan manufaktur garmen dengan skala besar. Menangani troubleshooting dan maintenance infrastruktur IT mencakup hardware, software, jaringan, dan sistem komunikasi untuk mendukung operasional perusahaan yang efisien.',
        achievements: [
          'Menangani rata-rata 40+ tiket support per minggu terkait hardware, software, jaringan, dan sistem telepon dengan response time optimal',
          'Melakukan perbaikan dan upgrade perangkat PC/laptop termasuk penggantian HDD, RAM, keyboard, baterai, speaker, printer, dan UPS',
          'Instalasi dan konfigurasi Windows OS, email server, software internal perusahaan, dan printer sharing untuk multiple users',
          'Troubleshooting jaringan LAN, koneksi internet, sistem telepon internal, serta instalasi dan konfigurasi CCTV untuk monitoring area produksi',
          'Mengelola inventarisasi aset IT dan dokumentasi data melalui sistem internal maupun Microsoft Office untuk reporting yang akurat',
        ],
        order: 1,
      },
      {
        type: 'work', title: 'Asisten Dosen', company: 'Universitas Muhammadiyah Surakarta',
        location: 'Sukoharjo, Jawa Tengah',
        startDate: new Date('2023-09-11'), endDate: new Date('2025-07-07'),
        description: 'Membantu proses pembelajaran di laboratorium komputer dengan fokus pada praktikum dan pembimbingan mahasiswa. Bertanggung jawab dalam penyampaian materi kuliah, evaluasi tugas, serta pengelolaan fasilitas laboratorium untuk mendukung kegiatan akademik yang optimal.',
        achievements: [
          'Menyampaikan materi kuliah dan praktikum terkait bidang komputer dengan metode pembelajaran yang interaktif',
          'Menilai dan mengevaluasi tugas, ujian, serta proyek mahasiswa secara objektif dan konstruktif',
          'Mengelola dan merawat fasilitas laboratorium komputer mencakup hardware dan software',
          'Membantu mahasiswa dalam penggunaan peralatan laboratorium dan penyelesaian masalah teknis',
          'Memberikan bimbingan teknis untuk meningkatkan pemahaman mahasiswa terhadap praktikum',
        ],
        order: 2,
      },
      {
        type: 'work', title: 'IT Support', company: 'Universitas Muhammadiyah Surakarta',
        location: 'Sukoharjo, Jawa Tengah',
        startDate: new Date('2023-09-11'), endDate: new Date('2025-07-07'),
        description: 'Memberikan dukungan teknis komprehensif untuk infrastruktur IT laboratorium, mencakup troubleshooting, maintenance, dan optimalisasi sistem. Memastikan semua perangkat dan jaringan berfungsi optimal untuk mendukung kegiatan praktikum dan pembelajaran.',
        achievements: [
          'Melakukan troubleshooting dan perbaikan pada perangkat komputer serta jaringan dengan response time yang efisien',
          'Mengelola inventaris peralatan laboratorium komputer secara sistematis dan terorganisir',
          'Melakukan update OS, install ulang sistem, serta instalasi software sesuai kebutuhan praktikum',
          'Memberikan dukungan teknis kepada mahasiswa dalam penggunaan peralatan laboratorium',
          'Melakukan preventive maintenance untuk meminimalkan downtime sistem',
        ],
        order: 3,
      },
      {
        type: 'work', title: 'IT Support Intern', company: 'DPRD Kota Surakarta',
        location: 'Surakarta, Jawa Tengah',
        startDate: new Date('2024-05-01'), endDate: new Date('2024-06-30'),
        description: 'Memberikan dukungan teknis IT untuk operasional DPRD Kota Surakarta, termasuk pengembangan aplikasi e-Notulen, troubleshooting sistem, dan dukungan operasional IT harian. Berkontribusi dalam digitalisasi proses administrasi pemerintahan.',
        achievements: [
          'Mengembangkan aplikasi e-Notulen untuk digitalisasi pencatatan rapat DPRD',
          'Melakukan troubleshooting hardware dan software untuk memastikan operasional lancar',
          'Mendukung operasional IT mencakup input data, siaran langsung rapat, dan monitoring sistem',
          'Melakukan monitoring CCTV dan infrastruktur jaringan untuk keamanan gedung',
          'Memberikan technical support kepada pegawai dalam penggunaan sistem informasi',
        ],
        order: 4,
      },
      {
        type: 'education', title: 'S1 Teknik Informatika', company: 'Universitas Muhammadiyah Surakarta',
        location: 'Sukoharjo, Jawa Tengah',
        startDate: new Date('2021-09-01'), endDate: new Date('2025-07-22'),
        description: 'Program Studi Teknik Informatika dengan fokus pada pengembangan sistem informasi, jaringan komputer, data science, dan artificial intelligence. Menyelesaikan pendidikan dengan prestasi akademik yang sangat baik.',
        achievements: [
          'Lulus dengan IPK 3.83/4.00 - Prestasi Akademik Sangat Memuaskan',
          'Berpengalaman sebagai Asisten Dosen dan IT Support di laboratorium komputer',
          'Mengikuti berbagai pelatihan dan sertifikasi di bidang IT (Networking, Web Development, Machine Learning, Data Science)',
          'Aktif dalam kegiatan akademik dan pengembangan skill melalui program MSIB dan DBS Foundation',
          'Memiliki pengetahuan mendalam tentang troubleshooting, jaringan, programming, dan data analytics',
        ],
        order: 5,
      },
    ]);
    console.log(`✅ Created ${experiences.length} experiences`);
    console.log(`   - Work:      ${experiences.filter(e => e.type === 'work').length}`);
    console.log(`   - Education: ${experiences.filter(e => e.type === 'education').length}\n`);

    // ── 7. MESSAGES (sample) ──────────────────────────────────────────────────
    console.log('🌱 Seeding Messages...');
    const message = await Message.create({
      senderName: 'John Doe', senderEmail: 'johndoe@example.com',
      subject: 'Peluang Kerjasama',
      message: 'Halo, saya sangat terkesan dengan portfolio Anda. Apakah Anda terbuka untuk mendiskusikan peluang proyek web development dalam waktu dekat?',
      isRead: false,
    });
    console.log(`✅ Created message from: ${message.senderName}\n`);

    // ── VERIFICATION ──────────────────────────────────────────────────────────
    console.log('🔍 Verifying seeded data...');
    const counts = {
      users:            await User.countDocuments(),
      categories:       await Category.countDocuments(),
      projects:         await Project.countDocuments(),
      featuredProjects: await Project.countDocuments({ isFeatured: true }),
      skills:           await Skill.countDocuments(),
      experiences:      await Experience.countDocuments(),
      settings:         await Setting.countDocuments(),
      messages:         await Message.countDocuments(),
    };

    console.log('\n📊 Database Summary:');
    console.table(counts);
    console.log('\n🎉 SEEDING COMPLETED SUCCESSFULLY! 🎉\n');

    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ SEEDING ERROR:');
    console.error(error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedDatabase();