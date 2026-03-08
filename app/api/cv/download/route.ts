// app/api/cv/download/route.ts
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import Skill from '@/models/Skill';
import Experience from '@/models/Experience';
import Setting from '@/models/Setting';
import Category from '@/models/Category';

const execAsync = promisify(exec);

export async function GET() {
  try {
    await dbConnect();

    // Fetch settings
    const settings = await Setting.find({});
    const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);

    const ownerName = settingsMap.hero_title || 'Muhammad Irfan Abidin';
    const ownerRole = 'IT Support & Full Stack Developer';
    const aboutText = settingsMap.about_text || '';
    const ownerEmail = settingsMap.contact_email || '';
    const ownerPhone = settingsMap.contact_phone || '';
    const ownerLocation = settingsMap.contact_location || '';
    const ownerGithub = settingsMap.social_github || '';
    const ownerLinkedin = settingsMap.social_linkedin || '';
    const ownerGpa = '3.83';

    // Fetch projects
    const projects = await Project.find({})
      .populate('categoryId')
      .sort({ isFeatured: -1, order: 1 });

    const projectsData = projects.map(p => ({
      id: p._id.toString(),
      title: p.title,
      description: p.description?.replace(/<[^>]*>/g, '') || '',
      category: (p.categoryId as any)?.name || '',
      tech_stack: p.techStack || [],
      github_url: p.githubUrl,
      demo_url: p.demoUrl,
      is_featured: p.isFeatured,
    }));

    // Fetch skills
    const skills = await Skill.find({}).sort({ category: 1, order: 1 });
    const skillsData = skills.map(s => ({
      name: s.name,
      category: s.category,
      level: s.proficiency || null,
    }));

    // Fetch work experiences
    const workExperiences = await Experience.find({ type: 'work' })
      .sort({ startDate: -1 });

    const experiencesData = workExperiences.map(e => {
      const isCurrentRaw = !e.endDate;
      return {
        title: e.title,
        company: e.company,
        location: e.location || '',
        start_date: e.startDate?.toISOString().split('T')[0] || '',
        end_date: e.endDate?.toISOString().split('T')[0] || '',
        is_current: isCurrentRaw,
        description: e.description?.replace(/<[^>]*>/g, '') || '',
        achievements: [],
      };
    });

    // Fetch educations
    const educations = await Experience.find({ type: 'education' })
      .sort({ startDate: -1 });

    const educationsData = educations.map(e => ({
      title: e.title,
      company: e.company,
      location: e.location || '',
      start_date: e.startDate?.toISOString().split('T')[0] || '',
      end_date: e.endDate?.toISOString().split('T')[0] || '',
      description: e.description?.replace(/<[^>]*>/g, '') || '',
      achievements: [],
    }));

    // Certifications
    const certifications = [
      { name: 'Introduction to Cybersecurity', issuer: 'Cisco Networking Academy', year: '2024' },
      { name: 'Networking Basics', issuer: 'Cisco Networking Academy', year: '2024' },
      { name: 'Learn Machine Learning Development', issuer: 'Dicoding Indonesia', year: '2024' },
      { name: 'Bootcamp Digital Talent Scholarship', issuer: 'Kominfo & DBS Foundation', year: '2023' },
    ];

    // Build payload
    const payload = {
      generated_at: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      owner: {
        name: ownerName,
        role: ownerRole,
        about: aboutText,
        email: ownerEmail,
        phone: ownerPhone,
        location: ownerLocation,
        github: ownerGithub,
        linkedin: ownerLinkedin,
        gpa: ownerGpa,
      },
      projects: projectsData,
      skills: skillsData,
      experiences: experiencesData,
      educations: educationsData,
      certifications,
    };

    // File paths
    const timestamp = Date.now();
    const tempDir = path.join(process.cwd(), 'temp');
    const scriptPath = path.join(process.cwd(), 'scripts', 'generate-cv-ats.cjs');
    const outputPath = path.join(tempDir, `cv-${timestamp}.pdf`);
    const payloadPath = path.join(tempDir, `cv-payload-${timestamp}.json`);

    // Ensure temp directory exists
    await fs.mkdir(tempDir, { recursive: true });

    // Write payload
    await fs.writeFile(payloadPath, JSON.stringify(payload, null, 2));

    // Check if script exists
    try {
      await fs.access(scriptPath);
    } catch {
      await fs.unlink(payloadPath);
      return NextResponse.json(
        { error: 'CV generation script not found. Please ensure generate-cv-ats.cjs exists in /scripts folder.' },
        { status: 500 }
      );
    }

    // Run Node.js script
    const command = `node "${scriptPath}" "${payloadPath}" "${outputPath}"`;
    
    try {
      const { stdout, stderr } = await execAsync(command);
      console.log('CV Generation Output:', stdout);
      if (stderr) console.error('CV Generation Errors:', stderr);
    } catch (error) {
      console.error('CV generation failed:', error);
      await fs.unlink(payloadPath).catch(() => {});
      return NextResponse.json(
        { error: 'Failed to generate CV PDF.' },
        { status: 500 }
      );
    }

    // Clean up payload file
    await fs.unlink(payloadPath);

    // Check if output file exists
    try {
      await fs.access(outputPath);
    } catch {
      return NextResponse.json(
        { error: 'CV PDF was not created.' },
        { status: 500 }
      );
    }

    // Read file
    const fileBuffer = await fs.readFile(outputPath);

    // Delete file after reading
    await fs.unlink(outputPath);

    // Return file
    const filename = `CV_${ownerName.replace(/ /g, '_')}_${new Date().getFullYear()}.pdf`;

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('CV download error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}