/**
 * app/api/portfolio/download/pptx/route.ts
 * Portfolio PPTX download — inline generation, works on Vercel serverless.
 */

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import Skill from '@/models/Skill';
import Experience from '@/models/Experience';
import Setting from '@/models/Setting';
import { generatePptxBuffer, type PptxPayload } from '@/lib/pptx-generator';

export async function GET() {
  try {
    await dbConnect();

    // ── Fetch all data ────────────────────────────────────────────────────────
    const [settings, projects, skills, workExps, eduRecords] = await Promise.all([
      Setting.find({}),
      Project.find({}).populate('categoryId').sort({ isFeatured: -1, order: 1 }),
      Skill.find({}).sort({ category: 1, order: 1 }),
      Experience.find({ type: 'work' }).sort({ startDate: -1 }),
      Experience.find({ type: 'education' }).sort({ startDate: -1 }),
    ]);

    const s = settings.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {} as Record<string, string>);

    // ── Build payload ─────────────────────────────────────────────────────────
    const payload: PptxPayload = {
      generated_at: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      owner: {
        name:     s.hero_title     || 'Muhammad Irfan Abidin',
        role:     'IT Support & Full Stack Developer',
        about:    s.about_text     || '',
        email:    s.contact_email  || '',
        phone:    s.contact_phone  || '',
        location: s.contact_location || '',
        github:   s.social_github  || '',
        linkedin: s.social_linkedin || '',
        instagram:s.social_instagram || '',
        gpa:      '3.83',
      },
      projects: projects.map(p => ({
        id:          p._id.toString(),
        title:       p.title,
        description: (p.description || '').replace(/<[^>]*>/g, ''),
        category:    (p.categoryId as any)?.name || '',
        tech_stack:  p.techStack || [],
        github_url:  p.githubUrl,
        demo_url:    p.demoUrl,
        is_featured: p.isFeatured,
      })),
      skills: skills.map(sk => ({
        name:     sk.name,
        category: sk.category,
        level:    sk.proficiency || null,
      })),
      experiences: workExps.map(e => ({
        title:       e.title,
        company:     e.company,
        location:    e.location || '',
        start_date:  e.startDate?.toISOString().split('T')[0] || '',
        end_date:    e.endDate?.toISOString().split('T')[0]   || '',
        is_current:  !e.endDate,
        description: (e.description || '').replace(/<[^>]*>/g, ''),
      })),
      educations: eduRecords.map(e => ({
        title:       e.title,
        company:     e.company,
        location:    e.location || '',
        start_date:  e.startDate?.toISOString().split('T')[0] || '',
        end_date:    e.endDate?.toISOString().split('T')[0]   || '',
        description: (e.description || '').replace(/<[^>]*>/g, ''),
      })),
      certifications: [
        { name: 'Introduction to Cybersecurity',       issuer: 'Cisco Networking Academy',  year: '2024' },
        { name: 'Networking Basics',                   issuer: 'Cisco Networking Academy',  year: '2024' },
        { name: 'Learn Machine Learning Development',  issuer: 'Dicoding Indonesia',        year: '2024' },
        { name: 'Bootcamp Digital Talent Scholarship', issuer: 'Kominfo & DBS Foundation',  year: '2023' },
      ],
    };

    // ── Generate PPTX inline (no exec, no filesystem) ─────────────────────────
    const fileBuffer = await generatePptxBuffer(payload);

    const safeName = payload.owner.name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${safeName}_Portfolio_${new Date().getFullYear()}.pptx`;

    return new NextResponse(new Uint8Array(fileBuffer), {
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