/**
 * app/api/cv/download/route.ts
 * CV PDF download — inline generation, works on Vercel serverless.
 */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ProjectModel from '@/models/Project';
import SkillModel from '@/models/Skill';
import ExperienceModel from '@/models/Experience';
import SettingModel from '@/models/Setting';
import { generateCvBuffer, type CvPayload } from '@/lib/cv-generator';

// ── Bilingual section labels ──────────────────────────────────────────────────
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
      ExperienceModel.find({ type: 'work' }).sort({ startDate: -1 }),
      ExperienceModel.find({ type: 'education' }).sort({ startDate: -1 }),
    ]);

    const sm = settings.reduce((acc, s) => ({ ...acc, [s.key]: s }), {} as Record<string, any>);

    const pickText = (primary: string, translated: string) =>
      isID && translated ? translated : primary;
    const pickArr = (primary: string[], translated: string[]) =>
      isID && translated?.length > 0 ? translated : primary;

    // ── Owner ─────────────────────────────────────────────────────────────────
    const ownerName     = sm['hero_title']?.value       || 'Muhammad Irfan Abidin';
    const aboutSetting  = sm['about_text']    || {};
    const aboutText     = pickText(aboutSetting.value || '', aboutSetting.value_id || '');
    const ownerEmail    = sm['contact_email']?.value    || '';
    const ownerPhone    = sm['contact_phone']?.value    || '';
    const ownerLocation = pickText(
      sm['contact_location']?.value    || '',
      sm['contact_location']?.value_id || ''
    );
    const ownerLinkedin = sm['social_linkedin']?.value  || '';

    // ── Build experiences ─────────────────────────────────────────────────────
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

    // ── Build educations ──────────────────────────────────────────────────────
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

    // ── Build projects ────────────────────────────────────────────────────────
    const projectsData = projects.map(p => ({
      id:               p._id.toString(),
      title:            p.title,
      shortDescription: pickText(p.shortDescription || p.description?.replace(/<[^>]*>/g, '') || '', p.shortDescription_id || p.description_id || ''),
      category:         (p.categoryId as any)?.name || '',
      tech_stack:       p.techStack || [],
      github_url:       p.githubUrl,
      demo_url:         p.demoUrl,
      is_featured:      p.isFeatured,
    }));

    // ── Build skills ──────────────────────────────────────────────────────────
    const skillsData = skills.map(s => ({
      name:     s.name,
      category: s.category as 'hard' | 'soft',
      level:    s.proficiency || null,
    }));

    // ── Certifications ────────────────────────────────────────────────────────
    const certifications = [
      { name: 'Networking & Cybersecurity Basic', issuer: 'Cisco Academy', year: '2024' },
      { name: 'Front End & Back End Web', issuer: 'MSIB Batch 6', year: '2024' },
      { name: 'Machine Learning Engineer', issuer: 'DBS Foundation Coding Camp', year: '2024' },
      { name: 'Data Science', issuer: 'Dicoding Indonesia', year: '2025' },
    ];

    // ── Assemble payload ──────────────────────────────────────────────────────
    const payload: CvPayload = {
      lang,
      labels,
      generated_at: new Date().toLocaleDateString(
        lang === 'id' ? 'id-ID' : 'en-US',
        { day: '2-digit', month: 'short', year: 'numeric' }
      ),
      owner: {
        name:     ownerName,
        role:     'IT Support & Full Stack Developer',
        about:    aboutText,
        email:    ownerEmail,
        phone:    ownerPhone,
        location: ownerLocation,
        linkedin: ownerLinkedin,
        gpa:      '3.83',
      },
      projects:       projectsData,
      skills:         skillsData,
      experiences:    experiencesData,
      educations:     educationsData,
      certifications,
    };

    // ── Generate PDF inline (no exec, no filesystem) ──────────────────────────
    const fileBuffer = await generateCvBuffer(payload);

    const langSuffix = lang === 'id' ? '_ID' : '_EN';
    const filename   = `CV_${ownerName.replace(/ /g, '_')}_${new Date().getFullYear()}${langSuffix}.pdf`;

    return new NextResponse(new Uint8Array(fileBuffer), {
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