import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import dbConnect from '@/lib/mongodb';
import ProjectModel from '@/models/Project';
import SkillModel from '@/models/Skill';
import ExperienceModel from '@/models/Experience';
import SettingModel from '@/models/Setting';

const execAsync = promisify(exec);

// ── Bilingual UI labels (section headings only — not DB content) ───────────
const SECTION_LABELS = {
  en: {
    summary: 'PROFESSIONAL SUMMARY', education: 'EDUCATION',
    experience: 'WORK EXPERIENCE', certifications: 'CERTIFICATIONS',
    projects: 'SELECTED PROJECTS', skills: 'KEY SKILLS',
    techSkills: 'Technical Skills', softSkills: 'Soft Skills',
    techStack: 'Tech Stack', present: 'Present',
    gpa: 'GPA', github: 'GitHub', demo: 'Demo',
  },
  id: {
    summary: 'RINGKASAN PROFESIONAL', education: 'PENDIDIKAN',
    experience: 'PENGALAMAN KERJA', certifications: 'SERTIFIKASI',
    projects: 'PROYEK PILIHAN', skills: 'KEAHLIAN UTAMA',
    techSkills: 'Keahlian Teknis', softSkills: 'Keahlian Non-Teknis',
    techStack: 'Teknologi', present: 'Sekarang',
    gpa: 'IPK', github: 'GitHub', demo: 'Demo',
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang   = (searchParams.get('lang') === 'id' ? 'id' : 'en') as 'en' | 'id';
    const labels = SECTION_LABELS[lang];
    const isID   = lang === 'id';

    await dbConnect();

    const [settings, projects, skills, workExps, educations] = await Promise.all([
      SettingModel.find({}),
      ProjectModel.find({}).populate('categoryId').sort({ isFeatured: -1, order: 1 }),
      SkillModel.find({}).sort({ category: 1, order: 1 }),
      ExperienceModel.find({ type: 'work'      }).sort({ startDate: -1 }),
      ExperienceModel.find({ type: 'education' }).sort({ startDate: -1 }),
    ]);
    // Setelah fetch experiences, tambah ini:
    console.log('Sample experience _id fields:', workExps[0]?.description_id, workExps[0]?.achievements_id?.length);

    const sm = settings.reduce((acc, s) => ({ ...acc, [s.key]: s }), {} as Record<string, any>);

    // ── Helper: pick language field ────────────────────────────────────────
    // For ID: use _id field if filled, otherwise fall back to primary (EN)
    const pickText = (primary: string, translated: string) =>
      isID && translated ? translated : primary;

    const pickArr = (primary: string[], translated: string[]) =>
      isID && translated?.length > 0 ? translated : primary;

    // ── Owner ──────────────────────────────────────────────────────────────
    const aboutSetting    = sm['about_text']    || {};
    const subtitleSetting = sm['hero_subtitle'] || {};

    const ownerName     = sm['hero_title']?.value       || 'Muhammad Irfan Abidin';
    const ownerRole     = isID
      ? 'IT Support & Full Stack Developer'
      : 'IT Support & Full Stack Developer';
    const aboutText     = pickText(aboutSetting.value || '', aboutSetting.value_id || '');
    const ownerEmail    = sm['contact_email']?.value    || '';
    const ownerPhone    = sm['contact_phone']?.value    || '';
    const ownerLocation = pickText(
      sm['contact_location']?.value    || '',
      sm['contact_location']?.value_id || ''
    );
    const ownerLinkedin = sm['social_linkedin']?.value  || '';
    const ownerGpa      = '3.83';

    // ── Experiences ────────────────────────────────────────────────────────
    const experiencesData = workExps.map(e => ({
      title:       e.title,
      company:     e.company,
      location:    e.location || '',
      start_date:  e.startDate?.toISOString().split('T')[0] || '',
      end_date:    e.endDate?.toISOString().split('T')[0]   || '',
      is_current:  !e.endDate,
      description: pickText(e.description || '', e.description_id || ''),
      achievements: pickArr(
        Array.isArray(e.achievements)    ? e.achievements    : [],
        Array.isArray(e.achievements_id) ? e.achievements_id : []
      ),
    }));

    // ── Educations ─────────────────────────────────────────────────────────
    const educationsData = educations.map(e => ({
      title:       e.title,
      company:     e.company,
      location:    e.location || '',
      start_date:  e.startDate?.toISOString().split('T')[0] || '',
      end_date:    e.endDate?.toISOString().split('T')[0]   || '',
      description: pickText(e.description || '', e.description_id || ''),
      achievements: pickArr(
        Array.isArray(e.achievements)    ? e.achievements    : [],
        Array.isArray(e.achievements_id) ? e.achievements_id : []
      ),
    }));

    // ── Projects ───────────────────────────────────────────────────────────
    const projectsData = projects.map(p => ({
      id:          p._id.toString(),
      title:       p.title,
      description: pickText(
        p.description?.replace(/<[^>]*>/g, '') || '',
        p.description_id || ''
      ),
      shortDescription: pickText(p.shortDescription || '', p.shortDescription_id || ''),
      category:    (p.categoryId as any)?.name || '',
      tech_stack:  p.techStack || [],
      github_url:  p.githubUrl,
      demo_url:    p.demoUrl,
      is_featured: p.isFeatured,
    }));

    // ── Skills ─────────────────────────────────────────────────────────────
    const skillsData = skills.map(s => ({
      name:     s.name,
      category: s.category,
      level:    s.proficiency || null,
    }));

    // ── Certifications (language-neutral titles) ───────────────────────────
    const certifications = [
      { name: 'Introduction to Cybersecurity',       issuer: 'Cisco Networking Academy', year: '2024' },
      { name: 'Networking Basics',                   issuer: 'Cisco Networking Academy', year: '2024' },
      { name: 'Learn Machine Learning Development',  issuer: 'Dicoding Indonesia',       year: '2024' },
      { name: 'Bootcamp Digital Talent Scholarship', issuer: 'Kominfo & DBS Foundation', year: '2023' },
    ];

    // ── Assemble payload ───────────────────────────────────────────────────
    const payload = {
      lang,
      labels,
      generated_at: new Date().toLocaleDateString(
        lang === 'id' ? 'id-ID' : 'en-US',
        { day: '2-digit', month: 'short', year: 'numeric' }
      ),
      owner: {
        name: ownerName, role: ownerRole, about: aboutText,
        email: ownerEmail, phone: ownerPhone,
        location: ownerLocation, linkedin: ownerLinkedin, gpa: ownerGpa,
      },
      projects:       projectsData,
      skills:         skillsData,
      experiences:    experiencesData,
      educations:     educationsData,
      certifications,
    };

    // ── Write payload & run PDF script ────────────────────────────────────
    const timestamp   = Date.now();
    const tempDir     = path.join(process.cwd(), 'temp');
    const scriptPath  = path.join(process.cwd(), 'scripts', 'generate-cv-ats.cjs');
    const outputPath  = path.join(tempDir, `cv-${lang}-${timestamp}.pdf`);
    const payloadPath = path.join(tempDir, `cv-payload-${timestamp}.json`);

    await fs.mkdir(tempDir, { recursive: true });
    await fs.writeFile(payloadPath, JSON.stringify(payload, null, 2));

    try { await fs.access(scriptPath); } catch {
      await fs.unlink(payloadPath);
      return NextResponse.json({ error: 'CV generation script not found.' }, { status: 500 });
    }

    try {
      const { stdout, stderr } = await execAsync(`node "${scriptPath}" "${payloadPath}" "${outputPath}"`);
      if (stdout) console.log('CV gen:', stdout);
      if (stderr) console.error('CV gen stderr:', stderr);
    } catch (err) {
      await fs.unlink(payloadPath).catch(() => {});
      return NextResponse.json({ error: 'Failed to generate CV PDF.' }, { status: 500 });
    }

    await fs.unlink(payloadPath);

    try { await fs.access(outputPath); } catch {
      return NextResponse.json({ error: 'CV PDF was not created.' }, { status: 500 });
    }

    const fileBuffer = await fs.readFile(outputPath);
    await fs.unlink(outputPath);

    const langSuffix = lang === 'id' ? '_ID' : '_EN';
    const filename   = `CV_${ownerName.replace(/ /g, '_')}_${new Date().getFullYear()}${langSuffix}.pdf`;

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('CV download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}