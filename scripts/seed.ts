// scripts/seed.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import User     from '../models/User';
import Category from '../models/Category';
import Project  from '../models/Project';
import Experience from '../models/Experience';
import Skill    from '../models/Skill';
import Setting  from '../models/Setting';
import Message  from '../models/Message';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('⚠️ MONGODB_URI not found in .env.local');

async function seedDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI as string);
    console.log('✅ Connected to database:', mongoose.connection.name, '\n');

    console.log('🗑️  Clearing old data...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Project.deleteMany({}),
      Experience.deleteMany({}),
      Skill.deleteMany({}),
      Setting.deleteMany({}),
      Message.deleteMany({}),
    ]);
    console.log('✅ Old data cleared\n');

    // ── 1. USERS ───────────────────────────────────────────────────────────────
    console.log('🌱 Seeding Users...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const user = await User.create({
      name: 'Admin', email: 'admin@portfolio.com',
      password: hashedPassword, role: 'admin',
    });
    console.log(`✅ Created user: ${user.email}\n`);

    // ── 2. SETTINGS ────────────────────────────────────────────────────────────
    // value      = English (shown on public pages)
    // value_id   = Indonesian (shown on CV ID / CV Preview toggle)
    console.log('🌱 Seeding Settings...');
    await Setting.insertMany([
      {
        key: 'hero_title', type: 'text',
        value:    'Muhammad Irfan Abidin',
        value_id: 'Muhammad Irfan Abidin',  // name is language-neutral
      },
      {
        key: 'hero_subtitle', type: 'textarea',
        value: 'IT Operations intern at PT Pan Brothers Tbk with experience handling 40+ support cases per week. Graduate of S1 Informatics Engineering with expertise in IT Support, Network Infrastructure, Troubleshooting, and Web Development. Focused on Machine Learning and AI for digital transformation.',
        value_id: 'IT Operations internship di PT Pan Brothers Tbk dengan pengalaman menangani 40+ kasus support per minggu. Lulusan S1 Teknik Informatika dengan keahlian IT Support, Network Infrastructure, Troubleshooting, dan Web Development. Berfokus pada Machine Learning dan AI untuk transformasi digital.',
      },
      {
        key: 'hero_cta_text', type: 'text',
        value: 'Download CV', value_id: 'Unduh CV',
      },
      {
        key: 'about_title', type: 'text',
        value: 'About', value_id: 'Tentang',
      },
      {
        key: 'about_text', type: 'textarea',
        value: `I am a graduate of S1 Informatics Engineering from Universitas Muhammadiyah Surakarta with a GPA of 3.83/4.00. Currently working as an IT Operations intern at PT Pan Brothers Tbk, responsible for handling an average of 40+ support cases per week related to hardware, software, networking, and communication systems in a large-scale manufacturing environment.

I have experience as an IT Support and Teaching Assistant at UMS, as well as an IT Support intern at the Surakarta City Legislative Council (DPRD). Skilled in system troubleshooting, IT infrastructure installation and configuration, LAN network management, CCTV installation, and IT asset inventory and documentation. Experienced in hardware repair, preventive maintenance, and providing efficient technical support.

In addition to IT Support expertise, I have a deep interest in Data Science, Machine Learning, and Artificial Intelligence. I have completed various professional certifications from Cisco, MSIB, DBS Foundation, and Dicoding. I am committed to continuously developing my technical skills and contributing to digital transformation through innovative technology solutions.`,
        value_id: `Saya adalah lulusan S1 Teknik Informatika dari Universitas Muhammadiyah Surakarta dengan IPK 3.83/4.00. Saat ini bekerja sebagai IT Operations internship di PT Pan Brothers Tbk, bertanggung jawab menangani rata-rata 40+ kasus support per minggu terkait hardware, software, jaringan, dan sistem komunikasi dalam lingkungan manufaktur skala besar.

Memiliki pengalaman sebagai IT Support dan Asisten Dosen di UMS, serta IT Support internship di DPRD Kota Surakarta. Terampil dalam troubleshooting sistem, instalasi dan konfigurasi infrastruktur IT, manajemen jaringan LAN, instalasi CCTV, serta inventarisasi dan dokumentasi aset IT. Berpengalaman dalam perbaikan hardware, maintenance preventive, dan memberikan dukungan teknis yang efisien.

Selain keahlian IT Support, saya memiliki minat mendalam dalam Data Science, Machine Learning, dan Artificial Intelligence. Telah menyelesaikan berbagai sertifikasi profesional dari Cisco, MSIB, DBS Foundation, dan Dicoding. Saya berkomitmen untuk terus mengembangkan kemampuan teknis dan berkontribusi dalam transformasi digital melalui solusi teknologi yang inovatif.`,
      },
      { key: 'contact_email',    type: 'text', value: 'muhammadirfanabidin@gmail.com',                  value_id: 'muhammadirfanabidin@gmail.com' },
      { key: 'contact_phone',    type: 'text', value: '+62 896 6939 1458',                              value_id: '+62 896 6939 1458' },
      { key: 'contact_location', type: 'text', value: 'Karanganyar, Central Java, Indonesia',           value_id: 'Karanganyar, Jawa Tengah' },
      { key: 'social_github',    type: 'url',  value: 'https://github.com/MIAbidin',                   value_id: 'https://github.com/MIAbidin' },
      { key: 'social_linkedin',  type: 'url',  value: 'https://linkedin.com/in/muhammad-irfan-abidin', value_id: 'https://linkedin.com/in/muhammad-irfan-abidin' },
      { key: 'social_instagram', type: 'url',  value: 'https://instagram.com/mia.abidin',              value_id: 'https://instagram.com/mia.abidin' },
      { key: 'brand_initials',   type: 'text', value: 'MIA',  value_id: 'MIA' },
      { key: 'brand_suffix',     type: 'text', value: '.Dev', value_id: '.Dev' },
      {
        key: 'site_title', type: 'text',
        value:    'Muhammad Irfan Abidin - IT Support & Software Developer Portfolio',
        value_id: 'Muhammad Irfan Abidin - Portfolio IT Support & Software Developer',
      },
      {
        key: 'site_description', type: 'textarea',
        value:    'Professional portfolio of Muhammad Irfan Abidin — Informatics Engineering graduate with expertise in IT Support, Network Infrastructure, Web Development, Machine Learning, and Data Science.',
        value_id: 'Portfolio profesional Muhammad Irfan Abidin — Lulusan Teknik Informatika dengan keahlian IT Support, Network Infrastructure, Web Development, Machine Learning, dan Data Science.',
      },
      {
        key: 'site_keywords', type: 'text',
        value:    'IT Support, Network Infrastructure, Troubleshooting, Web Developer, Machine Learning, Data Science, Artificial Intelligence, Python, SQL, Laravel, Informatics Engineering',
        value_id: 'IT Support, Network Infrastructure, Troubleshooting, Web Developer, Machine Learning, Data Science, Kecerdasan Buatan, Python, SQL, Laravel, Teknik Informatika',
      },
    ]);
    console.log('✅ Settings seeded\n');

    // ── 3. CATEGORIES ──────────────────────────────────────────────────────────
    console.log('🌱 Seeding Categories...');
    const categories = await Category.insertMany([
      { name: 'Web Development',                 slug: 'web-development',   icon: 'code-bracket' },
      { name: 'Data Science & Machine Learning', slug: 'data-science-ml',   icon: 'chart-bar'    },
      { name: 'IT Infrastructure',               slug: 'it-infrastructure', icon: 'server'       },
      { name: 'Network & Security',              slug: 'network-security',  icon: 'shield-check' },
    ]);
    const [webDevId, aiId, infraId, netSecId] = categories.map(c => c._id);
    console.log(`✅ Created ${categories.length} categories\n`);

    // ── 4. PROJECTS ────────────────────────────────────────────────────────────
    // description / shortDescription      = English (public pages + CV EN)
    // description_id / shortDescription_id = Indonesian (CV ID + CV Preview)
    console.log('🌱 Seeding Projects...');
    await Project.insertMany([
      {
        categoryId: webDevId, title: 'Goods Management Information System',
        slug: 'goods-management-information-system',
        imagePath: 'https://images.unsplash.com/photo-1586528116311-ad8ed7c50a63?w=800&q=80',
        techStack: ['Laravel 10', 'MySQL', 'Bootstrap 5', 'jQuery', 'Chart.js'],
        githubUrl: 'https://github.com/yourusername/inventory-system',
        demoUrl: 'https://demo-inventory.yourdomain.com',
        isFeatured: true, order: 1, completedAt: new Date('2023-11-15'),

        description: 'A web application for managing warehouse inventory with real-time stock tracking, automated reports, and multi-user access control. The system is designed to improve the efficiency of managing incoming and outgoing goods with a user-friendly interface.',
        shortDescription: 'Web app for inventory management with real-time tracking and automated reporting.',

        description_id: 'Aplikasi web untuk mengelola inventori barang di gudang dengan fitur tracking stok real-time, laporan otomatis, dan multi-user access control. Sistem ini dirancang untuk meningkatkan efisiensi pengelolaan barang masuk dan keluar dengan interface yang user-friendly.',
        shortDescription_id: 'Web app untuk manajemen inventori dengan tracking real-time dan reporting otomatis.',
      },
      {
        categoryId: webDevId, title: 'Internship Management Platform',
        slug: 'internship-management-platform',
        imagePath: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
        techStack: ['Laravel 9', 'MySQL', 'Tailwind CSS', 'Alpine.js', 'Livewire'],
        githubUrl: 'https://github.com/yourusername/internship-platform',
        demoUrl: null, isFeatured: true, order: 2, completedAt: new Date('2023-08-20'),

        description: 'A platform for managing student internship programs with features for online registration, activity monitoring, assessment, and reporting. The system facilitates communication between students, university supervisors, and industry supervisors.',
        shortDescription: 'Digital platform for managing student internship programs.',

        description_id: 'Platform untuk mengelola program magang mahasiswa dengan fitur pendaftaran online, monitoring aktivitas, penilaian, dan laporan. Sistem ini memfasilitasi komunikasi antara mahasiswa, pembimbing kampus, dan pembimbing industri.',
        shortDescription_id: 'Platform digital untuk pengelolaan program magang mahasiswa.',
      },
      {
        categoryId: webDevId, title: 'Online Attendance System',
        slug: 'online-attendance-system',
        imagePath: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
        techStack: ['PHP', 'Laravel 10', 'MySQL', 'Google Maps API', 'Vue.js 3'],
        githubUrl: 'https://github.com/yourusername/attendance-system',
        demoUrl: 'https://demo-attendance.yourdomain.com',
        isFeatured: false, order: 3, completedAt: new Date('2023-05-10'),

        description: 'An employee attendance application with geolocation features to ensure attendance from valid locations. Equipped with an analytics dashboard, report export, and real-time notifications for HR.',
        shortDescription: 'Attendance system with geolocation and analytics dashboard.',

        description_id: 'Aplikasi absensi karyawan berbasis web dengan fitur geolocation untuk memastikan kehadiran dari lokasi yang valid. Dilengkapi dengan dashboard analytics, export laporan, dan notifikasi real-time untuk HR.',
        shortDescription_id: 'Sistem absensi dengan geolocation dan analytics dashboard.',
      },
      {
        categoryId: aiId, title: 'Product Image Classification with CNN',
        slug: 'product-image-classification-cnn',
        imagePath: 'https://images.unsplash.com/photo-1627404068305-65fb5a6538b5?w=800&q=80',
        techStack: ['Python', 'TensorFlow', 'Keras', 'OpenCV', 'NumPy', 'Pandas'],
        githubUrl: 'https://github.com/yourusername/image-classification-cnn',
        demoUrl: null, isFeatured: true, order: 4, completedAt: new Date('2022-06-30'),

        description: 'A machine learning model for classifying garment product images into 10 different categories using Convolutional Neural Network. The model achieved 92% accuracy on the validation set with data augmentation and transfer learning using ResNet50.',
        shortDescription: 'CNN model for product image classification with 92% accuracy.',

        description_id: 'Model machine learning untuk mengklasifikasikan gambar produk garmen ke dalam 10 kategori berbeda menggunakan Convolutional Neural Network. Model mencapai akurasi 92% pada validation set dengan data augmentation dan transfer learning menggunakan ResNet50.',
        shortDescription_id: 'CNN model untuk klasifikasi gambar produk dengan akurasi 92%.',
      },
      {
        categoryId: aiId, title: 'IT Support Analytics Dashboard',
        slug: 'it-support-analytics-dashboard',
        imagePath: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
        techStack: ['Python', 'Pandas', 'Matplotlib', 'Seaborn', 'Jupyter Notebook', 'SQL'],
        githubUrl: 'https://github.com/yourusername/it-support-analytics',
        demoUrl: null, isFeatured: false, order: 5, completedAt: new Date('2023-03-15'),

        description: 'An interactive dashboard for visualizing IT support team performance data using historical ticket data. Displays KPI metrics such as resolution time, ticket volume, category breakdown, and trend analysis.',
        shortDescription: 'Dashboard for IT support analytics and data visualization.',

        description_id: 'Dashboard interaktif untuk memvisualisasikan data performa IT support team menggunakan data historis tiket support. Menampilkan metrik KPI seperti resolution time, ticket volume, category breakdown, dan trend analysis.',
        shortDescription_id: 'Dashboard untuk analytics dan visualisasi data IT support.',
      },
      {
        categoryId: infraId, title: 'Network Monitoring System',
        slug: 'network-monitoring-system',
        imagePath: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
        techStack: ['Python', 'Flask', 'SNMP', 'Redis', 'PostgreSQL', 'Chart.js'],
        githubUrl: 'https://github.com/yourusername/network-monitoring',
        demoUrl: null, isFeatured: true, order: 6, completedAt: new Date('2023-09-25'),

        description: 'A network monitoring system to track the status of network devices (routers, switches, access points) in real-time. Equipped with an alerting system and historical data for network performance analysis.',
        shortDescription: 'Real-time network monitoring with alerting system.',

        description_id: 'Sistem monitoring jaringan untuk memantau status perangkat network (router, switch, access point) secara real-time. Dilengkapi dengan alerting system dan historical data untuk analisis network performance.',
        shortDescription_id: 'Real-time network monitoring dengan alerting system.',
      },
      {
        categoryId: infraId, title: 'CCTV Management Dashboard',
        slug: 'cctv-management-dashboard',
        imagePath: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80',
        techStack: ['Laravel', 'MySQL', 'WebRTC', 'FFmpeg', 'Bootstrap'],
        githubUrl: null, demoUrl: null, isFeatured: false, order: 7, completedAt: new Date('2023-07-10'),

        description: 'A web dashboard for managing and monitoring IP Camera CCTV status across multiple locations. Features include live view, recording playback, camera health monitoring, and storage management.',
        shortDescription: 'Dashboard for managing and monitoring IP Camera CCTV.',

        description_id: 'Dashboard web untuk mengelola dan memonitor status CCTV IP Camera di multiple lokasi. Fitur mencakup live view, playback recording, camera health monitoring, dan storage management.',
        shortDescription_id: 'Dashboard untuk manajemen dan monitoring CCTV IP Camera.',
      },
      {
        categoryId: netSecId, title: 'Mikrotik Configuration Scripts',
        slug: 'mikrotik-configuration-scripts',
        imagePath: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80',
        techStack: ['RouterOS Script', 'Bash', 'Python', 'Mikrotik API'],
        githubUrl: 'https://github.com/yourusername/mikrotik-scripts',
        demoUrl: null, isFeatured: false, order: 8, completedAt: new Date('2023-10-05'),

        description: 'A collection of scripts and configuration templates for Mikrotik RouterOS covering various use cases: bandwidth management, hotspot setup, VPN configuration, firewall rules, and network security hardening.',
        shortDescription: 'Script collection for Mikrotik configuration and automation.',

        description_id: 'Koleksi script dan template konfigurasi Mikrotik RouterOS untuk berbagai use case: bandwidth management, hotspot setup, VPN configuration, firewall rules, dan network security hardening.',
        shortDescription_id: 'Script collection untuk konfigurasi dan automation Mikrotik.',
      },
    ]);
    console.log('✅ Projects seeded\n');

    // ── 5. SKILLS ──────────────────────────────────────────────────────────────
    console.log('🌱 Seeding Skills...');
    await Skill.insertMany([
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
    console.log('✅ Skills seeded\n');

    // ── 6. EXPERIENCES ─────────────────────────────────────────────────────────
    // description / achievements       = English (public pages + CV EN)
    // description_id / achievements_id = Indonesian (CV ID + CV Preview)
    console.log('🌱 Seeding Experiences...');
    await Experience.insertMany([
      {
        type: 'work', title: 'IT Operations Intern',
        company: 'PT Pan Brothers Tbk', location: 'Sragen, Central Java',
        startDate: new Date('2025-10-01'), endDate: null,

        description: 'Responsible as First Level Support in a large-scale garment manufacturing environment. Handled troubleshooting and maintenance of IT infrastructure including hardware, software, networking, and communication systems to support efficient company operations.',
        achievements: [
          'Handled an average of 40+ support tickets per week related to hardware, software, networking, and telephone systems with optimal response time',
          'Performed repair and upgrade of PC/laptop devices including replacement of HDD, RAM, keyboard, battery, speaker, printer, and UPS',
          'Installed and configured Windows OS, email server, internal company software, and printer sharing for multiple users',
          'Troubleshot LAN networks, internet connections, internal telephone systems, and installed and configured CCTV for production area monitoring',
          'Managed IT asset inventory and data documentation through internal systems and Microsoft Office for accurate reporting',
        ],

        description_id: 'Bertanggung jawab sebagai First Level Support dalam lingkungan manufaktur garmen dengan skala besar. Menangani troubleshooting dan maintenance infrastruktur IT mencakup hardware, software, jaringan, dan sistem komunikasi untuk mendukung operasional perusahaan yang efisien.',
        achievements_id: [
          'Menangani rata-rata 40+ tiket support per minggu terkait hardware, software, jaringan, dan sistem telepon dengan response time optimal',
          'Melakukan perbaikan dan upgrade perangkat PC/laptop termasuk penggantian HDD, RAM, keyboard, baterai, speaker, printer, dan UPS',
          'Instalasi dan konfigurasi Windows OS, email server, software internal perusahaan, dan printer sharing untuk multiple users',
          'Troubleshooting jaringan LAN, koneksi internet, sistem telepon internal, serta instalasi dan konfigurasi CCTV untuk monitoring area produksi',
          'Mengelola inventarisasi aset IT dan dokumentasi data melalui sistem internal maupun Microsoft Office untuk reporting yang akurat',
        ],
        order: 1,
      },
      {
        type: 'work', title: 'Teaching Assistant',
        company: 'Universitas Muhammadiyah Surakarta', location: 'Sukoharjo, Central Java',
        startDate: new Date('2023-09-11'), endDate: new Date('2025-07-07'),

        description: 'Assisted the learning process in computer laboratories with a focus on practicum and student mentoring. Responsible for delivering course materials, evaluating assignments, and managing laboratory facilities to support optimal academic activities.',
        achievements: [
          'Delivered course materials and practicum sessions related to computer science using interactive teaching methods',
          'Assessed and evaluated student assignments, exams, and projects objectively and constructively',
          'Managed and maintained computer laboratory facilities including hardware and software',
          'Assisted students in using laboratory equipment and resolving technical issues',
          'Provided technical guidance to improve students\' understanding of practicum subjects',
        ],

        description_id: 'Membantu proses pembelajaran di laboratorium komputer dengan fokus pada praktikum dan pembimbingan mahasiswa. Bertanggung jawab dalam penyampaian materi kuliah, evaluasi tugas, serta pengelolaan fasilitas laboratorium untuk mendukung kegiatan akademik yang optimal.',
        achievements_id: [
          'Menyampaikan materi kuliah dan praktikum terkait bidang komputer dengan metode pembelajaran yang interaktif',
          'Menilai dan mengevaluasi tugas, ujian, serta proyek mahasiswa secara objektif dan konstruktif',
          'Mengelola dan merawat fasilitas laboratorium komputer mencakup hardware dan software',
          'Membantu mahasiswa dalam penggunaan peralatan laboratorium dan penyelesaian masalah teknis',
          'Memberikan bimbingan teknis untuk meningkatkan pemahaman mahasiswa terhadap praktikum',
        ],
        order: 2,
      },
      {
        type: 'work', title: 'IT Support',
        company: 'Universitas Muhammadiyah Surakarta', location: 'Sukoharjo, Central Java',
        startDate: new Date('2023-09-11'), endDate: new Date('2025-07-07'),

        description: 'Provided comprehensive technical support for laboratory IT infrastructure, including troubleshooting, maintenance, and system optimization. Ensured all devices and networks operated optimally to support practicum and learning activities.',
        achievements: [
          'Performed troubleshooting and repair on computer devices and networks with efficient response time',
          'Systematically managed computer laboratory equipment inventory in an organized manner',
          'Performed OS updates, system reinstallation, and software installation as required for practicum needs',
          'Provided technical support to students in using laboratory equipment',
          'Conducted preventive maintenance to minimize system downtime',
        ],

        description_id: 'Memberikan dukungan teknis komprehensif untuk infrastruktur IT laboratorium, mencakup troubleshooting, maintenance, dan optimalisasi sistem. Memastikan semua perangkat dan jaringan berfungsi optimal untuk mendukung kegiatan praktikum dan pembelajaran.',
        achievements_id: [
          'Melakukan troubleshooting dan perbaikan pada perangkat komputer serta jaringan dengan response time yang efisien',
          'Mengelola inventaris peralatan laboratorium komputer secara sistematis dan terorganisir',
          'Melakukan update OS, install ulang sistem, serta instalasi software sesuai kebutuhan praktikum',
          'Memberikan dukungan teknis kepada mahasiswa dalam penggunaan peralatan laboratorium',
          'Melakukan preventive maintenance untuk meminimalkan downtime sistem',
        ],
        order: 3,
      },
      {
        type: 'work', title: 'IT Support Intern',
        company: 'DPRD Kota Surakarta', location: 'Surakarta, Central Java',
        startDate: new Date('2024-05-01'), endDate: new Date('2024-06-30'),

        description: 'Provided IT technical support for the operations of the Surakarta City Legislative Council, including developing the e-Notulen application, system troubleshooting, and daily IT operational support. Contributed to the digitalization of government administrative processes.',
        achievements: [
          'Developed the e-Notulen application for digitalizing DPRD meeting minutes',
          'Performed hardware and software troubleshooting to ensure smooth operations',
          'Supported IT operations including data input, live meeting broadcasts, and system monitoring',
          'Monitored CCTV and network infrastructure for building security',
          'Provided technical support to staff in using information systems',
        ],

        description_id: 'Memberikan dukungan teknis IT untuk operasional DPRD Kota Surakarta, termasuk pengembangan aplikasi e-Notulen, troubleshooting sistem, dan dukungan operasional IT harian. Berkontribusi dalam digitalisasi proses administrasi pemerintahan.',
        achievements_id: [
          'Mengembangkan aplikasi e-Notulen untuk digitalisasi pencatatan rapat DPRD',
          'Melakukan troubleshooting hardware dan software untuk memastikan operasional lancar',
          'Mendukung operasional IT mencakup input data, siaran langsung rapat, dan monitoring sistem',
          'Melakukan monitoring CCTV dan infrastruktur jaringan untuk keamanan gedung',
          'Memberikan technical support kepada pegawai dalam penggunaan sistem informasi',
        ],
        order: 4,
      },
      {
        type: 'education', title: 'S1 Informatics Engineering',
        company: 'Universitas Muhammadiyah Surakarta', location: 'Sukoharjo, Central Java',
        startDate: new Date('2021-09-01'), endDate: new Date('2025-07-22'),

        description: 'Informatics Engineering program with a focus on information systems development, computer networking, data science, and artificial intelligence. Completed with outstanding academic achievement.',
        achievements: [
          'Graduated with GPA 3.83/4.00 — Outstanding Academic Achievement',
          'Served as Teaching Assistant and IT Support at computer laboratories',
          'Completed various IT certifications (Networking, Web Development, Machine Learning, Data Science)',
          'Actively participated in academic activities and skill development through MSIB and DBS Foundation programs',
          'Developed deep knowledge in troubleshooting, networking, programming, and data analytics',
        ],

        description_id: 'Program Studi Teknik Informatika dengan fokus pada pengembangan sistem informasi, jaringan komputer, data science, dan artificial intelligence. Menyelesaikan pendidikan dengan prestasi akademik yang sangat baik.',
        achievements_id: [
          'Lulus dengan IPK 3.83/4.00 - Prestasi Akademik Sangat Memuaskan',
          'Berpengalaman sebagai Asisten Dosen dan IT Support di laboratorium komputer',
          'Mengikuti berbagai pelatihan dan sertifikasi di bidang IT (Networking, Web Development, Machine Learning, Data Science)',
          'Aktif dalam kegiatan akademik dan pengembangan skill melalui program MSIB dan DBS Foundation',
          'Memiliki pengetahuan mendalam tentang troubleshooting, jaringan, programming, dan data analytics',
        ],
        order: 5,
      },
    ]);
    console.log('✅ Experiences seeded\n');

    // ── 7. MESSAGES (sample) ───────────────────────────────────────────────────
    console.log('🌱 Seeding Messages...');
    await Message.create({
      senderName: 'John Doe', senderEmail: 'johndoe@example.com',
      subject: 'Collaboration Opportunity',
      message: 'Hi, I was very impressed with your portfolio. Are you open to discussing a web development project opportunity soon?',
      isRead: false,
    });
    console.log('✅ Messages seeded\n');

    // ── VERIFICATION ───────────────────────────────────────────────────────────
    const counts = {
      users:            await User.countDocuments(),
      categories:       await Category.countDocuments(),
      projects:         await Project.countDocuments(),
      featuredProjects: await Project.countDocuments({ isFeatured: true }),
      experiences:      await Experience.countDocuments(),
      skills:           await Skill.countDocuments(),
      settings:         await Setting.countDocuments(),
      messages:         await Message.countDocuments(),
    };
    console.log('📊 Database Summary:');
    console.table(counts);
    console.log('\n🎉 SEEDING COMPLETED SUCCESSFULLY!\n');
    console.log('📝 Notes:');
    console.log('   - All primary fields (description, achievements, value) are in English');
    console.log('   - All _id fields (description_id, achievements_id, value_id) are in Indonesian');
    console.log('   - Public pages use primary fields (English only)');
    console.log('   - CV ID and CV Preview switcher use _id fields\n');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ SEEDING ERROR:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedDatabase();