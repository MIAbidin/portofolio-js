import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// IMPORT MODEL SESUAI STRUKTUR PROJECT KAMU
import User from '../models/User';
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
    // 1. UPDATE PASSWORD ADMIN
    // =========================================================
    const hashedPassword = await bcrypt.hash('adminNuz', 10);

    const admin = await User.findOneAndUpdate(
      {
        $or: [
          { email: 'admin@portfolio.com' },
          { name: 'Admin' },
        ],
      },
      {
        $set: {
          password: hashedPassword,
        },
      },
      { new: true }
    );

    if (admin) {
      console.log('✅ Admin password updated');
    } else {
      console.log('⚠️ Admin user tidak ditemukan (cek name/email admin di database)');
    }

    // =========================================================
    // 2. AMBIL CATEGORY ID
    // =========================================================
    const webDev = await Category.findOne({ slug: 'web-development' });
    const dataScienceML = await Category.findOne({ slug: 'data-science-ml' });

    if (!webDev) {
      console.log('⚠️ Category web-development tidak ditemukan');
    }
    if (!dataScienceML) {
      console.log('⚠️ Category data-science-ml tidak ditemukan');
    }

    // =========================================================
    // 3. UPSERT PROJECTS (TANPA HAPUS DATA LAMA)
    // =========================================================
    const projects = [
      {
        categoryId: webDev?._id,
        title: 'NextStep - Internship Search Platform',
        slug: 'nextstep-website',
        imagePath: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
        techStack: ['Next.js', 'Tailwind CSS', 'Laravel (API)', 'MySQL'],
        githubUrl: 'https://github.com/MIAbidin/nextstep-website',
        demoUrl: null,
        isFeatured: true,
        order: 1,
        completedAt: new Date('2024-06-15'),

        description:
          'NextStep is a comprehensive platform designed to bridge the gap between students and companies. It features a streamlined application process, internship tracking, and a user-friendly dashboard. Built with Next.js for the frontend and Laravel as the robust backend API.',
        shortDescription:
          'A specialized platform for students to find and manage internship opportunities easily.',

        description_id:
          'NextStep adalah platform khusus bagi mahasiswa untuk mencari dan mengelola peluang magang dengan mudah. Dilengkapi dengan proses pendaftaran yang terintegrasi dan dashboard intuitif. Dibangun menggunakan Next.js di sisi frontend dan Laravel sebagai backend API.',
        shortDescription_id:
          'Platform khusus bagi mahasiswa untuk mencari dan mengelola peluang magang dengan mudah.',
      },
      {
        categoryId: dataScienceML?._id,
        title: 'Timnas Indonesia Sentiment Analysis',
        slug: 'sentimen-timnas-app',
        imagePath: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80',
        techStack: ['Python', 'Scikit-Learn', 'Streamlit', 'NLP'],
        githubUrl: 'https://github.com/MIAbidin/sentimen-timnas-app',
        demoUrl: null,
        isFeatured: true,
        order: 2,
        completedAt: new Date('2024-12-10'),

        description:
          'This application crawls and analyzes social media data to determine whether the public sentiment towards the Indonesia National Team is positive, neutral, or negative. It uses NLP techniques to process Indonesian slang and formal text.',
        shortDescription:
          'Analyze public sentiment on social media regarding the Indonesian National Football Team.',

        description_id:
          'Aplikasi ini menganalisis data media sosial untuk menentukan apakah sentimen publik terhadap Timnas Indonesia bersifat positif, netral, atau negatif. Menggunakan teknik NLP untuk memproses bahasa gaul maupun formal.',
        shortDescription_id:
          'Menganalisis sentimen publik di media sosial terkait Timnas Indonesia.',
      },
      {
        categoryId: webDev?._id,
        title: 'Laboratory Inventory Management',
        slug: 'lab-inventory-system',
        imagePath: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=800&q=80',
        techStack: ['Laravel', 'Bootstrap', 'MySQL'],
        githubUrl: 'https://github.com/MIAbidin/lab-inventory-system',
        demoUrl: null,
        isFeatured: true,
        order: 3,
        completedAt: new Date('2024-03-20'),

        description:
          'An inventory management system designed for labs to track equipment usage, manage chemical stock levels, and generate periodic reports. It includes role-based access for admins and lab assistants.',
        shortDescription:
          'A web-based system to manage laboratory equipment and chemical stocks efficiently.',

        description_id:
          'Sistem manajemen inventaris yang dirancang untuk laboratorium guna melacak penggunaan alat, mengelola stok bahan kimia, dan menghasilkan laporan berkala. Dilengkapi hak akses untuk admin dan asisten lab.',
        shortDescription_id:
          'Sistem berbasis web untuk mengelola peralatan laboratorium dan stok bahan kimia secara efisien.',
      },
      {
        categoryId: dataScienceML?._id,
        title: 'Bike Sharing Data Analytics',
        slug: 'bike-rent-analytics',
        imagePath: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800&q=80',
        techStack: ['Python', 'Pandas', 'Matplotlib', 'Seaborn', 'Streamlit'],
        githubUrl: 'https://github.com/MIAbidin/bike-rent-analytics',
        demoUrl: null,
        isFeatured: false,
        order: 4,
        completedAt: new Date('2024-09-05'),

        description:
          'A data analysis project focusing on bike-sharing usage patterns based on weather, time, and seasonal trends. The project includes an interactive dashboard to visualize key performance indicators (KPIs).',
        shortDescription:
          'Interactive dashboard to analyze trends and patterns in bike rental services.',

        description_id:
          'Proyek analisis data yang berfokus pada pola penggunaan berbagi sepeda berdasarkan cuaca, waktu, dan tren musiman. Dilengkapi dengan dashboard interaktif untuk memvisualisasikan indikator performa utama.',
        shortDescription_id:
          'Dashboard interaktif untuk menganalisis tren dan pola layanan penyewaan sepeda.',
      },
      {
        categoryId: dataScienceML?._id,
        title: 'Employee Attrition Prediction',
        slug: 'employee-attrition-analysis',
        imagePath: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
        techStack: ['Python', 'Scikit-Learn', 'Pandas', 'Random Forest'],
        githubUrl: 'https://github.com/MIAbidin/employee-attrition-analysis',
        demoUrl: null,
        isFeatured: false,
        order: 5,
        completedAt: new Date('2024-10-18'),

        description:
          'This project uses historical HR data to identify the main reasons why employees leave a company. It utilizes classification algorithms to predict which employees are at high risk of attrition.',
        shortDescription:
          'Machine learning model to predict and analyze factors behind employee turnover.',

        description_id:
          'Proyek ini menggunakan data historis HR untuk mengidentifikasi alasan utama karyawan meninggalkan perusahaan. Menggunakan algoritma klasifikasi untuk memprediksi karyawan mana yang berisiko tinggi untuk resign.',
        shortDescription_id:
          'Model machine learning untuk memprediksi dan menganalisis faktor turnover karyawan.',
      },
      {
        categoryId: dataScienceML?._id,
        title: 'Simpsons Characters Image Classification',
        slug: 'simpsons-characters-classification',
        imagePath: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80',
        techStack: ['Python', 'TensorFlow/Keras', 'CNN', 'OpenCV'],
        githubUrl: 'https://github.com/MIAbidin/simpsons-characters-classification',
        demoUrl: null,
        isFeatured: true,
        order: 6,
        completedAt: new Date('2024-11-12'),

        description:
          'A Computer Vision project using Convolutional Neural Networks (CNN) to identify various characters from the iconic show "The Simpsons" with high accuracy from image inputs.',
        shortDescription:
          'Deep learning model to recognize and classify various characters from The Simpsons.',

        description_id:
          'Proyek Computer Vision menggunakan Convolutional Neural Networks (CNN) untuk mengidentifikasi berbagai karakter dari serial "The Simpsons" dengan akurasi tinggi melalui input gambar.',
        shortDescription_id:
          'Model deep learning untuk mengenali dan mengklasifikasikan karakter The Simpsons.',
      },
      {
        categoryId: dataScienceML?._id,
        title: 'TheoTown Game Review Sentiment Analysis',
        slug: 'theotown-sentiment-analysis',
        imagePath: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80',
        techStack: ['Python', 'NLP', 'NLTK', 'Scikit-Learn'],
        githubUrl: 'https://github.com/MIAbidin/theotown-sentiment-analysis',
        demoUrl: null,
        isFeatured: false,
        order: 7,
        completedAt: new Date('2024-08-28'),

        description:
          'This project analyzes user reviews from the Google Play Store for the game TheoTown. By identifying common complaints and praises, it provides actionable insights for game developers.',
        shortDescription:
          'Analyzing user reviews of TheoTown game to improve player experience.',

        description_id:
          'Proyek ini menganalisis ulasan pengguna dari Google Play Store untuk game TheoTown. Dengan mengidentifikasi keluhan dan pujian umum, proyek ini memberikan wawasan bagi pengembang game.',
        shortDescription_id:
          'Analisis ulasan pengguna game TheoTown untuk meningkatkan pengalaman pemain.',
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