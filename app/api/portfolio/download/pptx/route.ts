// app/api/portfolio/download/pptx/route.ts
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

const execAsync = promisify(exec);

export async function GET() {
  try {
    await dbConnect();

    // ── Fetch settings ──────────────────────────────────────────
    const settings = await Setting.find({});
    const s = settings.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {} as Record<string, string>);

    const owner = {
      name:     s.hero_title    || 'Muhammad Irfan Abidin',
      role:     'IT Support & Full Stack Developer',
      about:    s.about_text    || '',
      email:    s.contact_email || '',
      phone:    s.contact_phone || '',
      location: s.contact_location || '',
      github:   s.social_github    || '',
      linkedin: s.social_linkedin  || '',
      gpa:      '3.83',
    };

    // ── Fetch projects ──────────────────────────────────────────
    const projects = await Project.find({})
      .populate('categoryId')
      .sort({ isFeatured: -1, order: 1 });

    const projectsData = projects.map(p => ({
      id:          p._id.toString(),
      title:       p.title,
      description: (p.description || '').replace(/<[^>]*>/g, ''),
      category:    (p.categoryId as any)?.name || '',
      tech_stack:  p.techStack || [],
      github_url:  p.githubUrl,
      demo_url:    p.demoUrl,
      is_featured: p.isFeatured,
    }));

    // ── Fetch skills ────────────────────────────────────────────
    const skills = await Skill.find({}).sort({ category: 1, order: 1 });
    const skillsData = skills.map(sk => ({
      name:     sk.name,
      category: sk.category,
      level:    sk.proficiency || null,
    }));

    // ── Fetch experiences ───────────────────────────────────────
    const workExps = await Experience.find({ type: 'work' }).sort({ startDate: -1 });
    const experiencesData = workExps.map(e => ({
      title:       e.title,
      company:     e.company,
      location:    e.location || '',
      start_date:  e.startDate?.toISOString().split('T')[0] || '',
      end_date:    e.endDate?.toISOString().split('T')[0]   || '',
      is_current:  !e.endDate,
      description: (e.description || '').replace(/<[^>]*>/g, ''),
    }));

    // ── Fetch educations ────────────────────────────────────────
    const eduRecords = await Experience.find({ type: 'education' }).sort({ startDate: -1 });
    const educationsData = eduRecords.map(e => ({
      title:      e.title,
      company:    e.company,
      location:   e.location || '',
      start_date: e.startDate?.toISOString().split('T')[0] || '',
      end_date:   e.endDate?.toISOString().split('T')[0]   || '',
      description:(e.description || '').replace(/<[^>]*>/g, ''),
    }));

    // ── Certifications ──────────────────────────────────────────
    const certifications = [
      { name: 'Introduction to Cybersecurity',    issuer: 'Cisco Networking Academy',  year: '2024' },
      { name: 'Networking Basics',                issuer: 'Cisco Networking Academy',  year: '2024' },
      { name: 'Learn Machine Learning Development', issuer: 'Dicoding Indonesia',      year: '2024' },
      { name: 'Bootcamp Digital Talent Scholarship', issuer: 'Kominfo & DBS Foundation', year: '2023' },
    ];

    // ── Build payload ───────────────────────────────────────────
    const payload = {
      generated_at: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      owner,
      projects:       projectsData,
      skills:         skillsData,
      experiences:    experiencesData,
      educations:     educationsData,
      certifications,
    };

    // ── File paths ──────────────────────────────────────────────
    const timestamp   = Date.now();
    const tempDir     = path.join(process.cwd(), 'temp');
    const scriptPath  = path.join(process.cwd(), 'scripts', 'generate-projects-pptx.cjs');
    const outputPath  = path.join(tempDir, `portfolio-${timestamp}.pptx`);
    const payloadPath = path.join(tempDir, `pptx-payload-${timestamp}.json`);

    await fs.mkdir(tempDir, { recursive: true });
    await fs.writeFile(payloadPath, JSON.stringify(payload, null, 2));

    // ── Check script exists ─────────────────────────────────────
    try {
      await fs.access(scriptPath);
    } catch {
      await fs.unlink(payloadPath).catch(() => {});
      return NextResponse.json(
        { error: 'PPTX generation script not found. Please ensure generate-projects-pptx.cjs exists in /scripts folder.' },
        { status: 500 }
      );
    }

    // ── Run script ──────────────────────────────────────────────
    try {
      const { stdout, stderr } = await execAsync(`node "${scriptPath}" "${payloadPath}" "${outputPath}"`);
      if (stdout) console.log('PPTX Output:', stdout);
      if (stderr)  console.error('PPTX Errors:', stderr);
    } catch (err) {
      console.error('PPTX generation failed:', err);
      await fs.unlink(payloadPath).catch(() => {});
      return NextResponse.json({ error: 'Failed to generate Portfolio PPTX.' }, { status: 500 });
    }

    await fs.unlink(payloadPath).catch(() => {});

    // ── Verify output exists ────────────────────────────────────
    try {
      await fs.access(outputPath);
    } catch {
      return NextResponse.json({ error: 'Portfolio PPTX was not created.' }, { status: 500 });
    }

    // ── Stream file ─────────────────────────────────────────────
    const fileBuffer = await fs.readFile(outputPath);
    await fs.unlink(outputPath).catch(() => {});

    const safeName = owner.name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${safeName}_Portfolio_${new Date().getFullYear()}.pptx`;

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Portfolio PPTX download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}