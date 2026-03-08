'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Owner {
  name: string;
  role: string;
  about: string;
  email: string;
  phone: string;
  location: string;
  github: string;
  linkedin: string;
  gpa: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  demoUrl?: string;
  isFeatured: boolean;
}

interface Skill {
  _id: string;
  name: string;
  category: 'hard' | 'soft';
}

interface Experience {
  _id: string;
  type: 'work' | 'education';
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string | null;
  description: string;
  achievements: string[]; // ✅ array, bukan string
}

interface Certification {
  name: string;
  issuer: string;
  year: string;
}

export default function CVPreviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Experience[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [settingsRes, projectsRes, skillsRes, experiencesRes] = await Promise.all([
          fetch('/api/settings').then(r => r.json()),
          fetch('/api/projects?featured=true').then(r => r.json()),
          fetch('/api/skills').then(r => r.json()),
          fetch('/api/experiences').then(r => r.json()),
        ]);

        const settingsMap = settingsRes.data?.reduce(
          (acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }),
          {}
        ) || {};

        setOwner({
          name:     settingsMap.hero_title    || 'Muhammad Irfan Abidin',
          role:     'IT Support & Full Stack Developer',
          about:    settingsMap.about_text    || '',
          email:    settingsMap.contact_email || '',
          phone:    settingsMap.contact_phone || '',
          location: settingsMap.contact_location || '',
          github:   settingsMap.social_github    || '',
          linkedin: settingsMap.social_linkedin  || '',
          gpa:      '3.83',
        });

        setProjects(projectsRes.data || []);
        setSkills(skillsRes.data || []);

        const allExperiences: Experience[] = experiencesRes.data || [];
        setExperiences(allExperiences.filter(e => e.type === 'work'));
        setEducations(allExperiences.filter(e => e.type === 'education'));

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch CV data:', error);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const certifications: Certification[] = [
    { name: 'Introduction to Cybersecurity',      issuer: 'Cisco Networking Academy',  year: '2024' },
    { name: 'Networking Basics',                  issuer: 'Cisco Networking Academy',  year: '2024' },
    { name: 'Learn Machine Learning Development', issuer: 'Dicoding Indonesia',        year: '2024' },
    { name: 'Bootcamp Digital Talent Scholarship',issuer: 'Kominfo & DBS Foundation',  year: '2023' },
  ];

  const hardSkills = skills.filter(s => s.category === 'hard').map(s => s.name);
  const softSkills = skills.filter(s => s.category === 'soft').map(s => s.name);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Normalise: DB returns string[] but guard against legacy string just in case
  const getAchievements = (achievements: string[] | string | undefined): string[] => {
    if (!achievements) return [];
    if (Array.isArray(achievements)) return achievements.filter(Boolean);
    // legacy: single string — treat as one bullet
    return [achievements as string];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#111633] to-[#0a0e27] flex items-center justify-center">
        <div className="text-[#00d9ff] font-mono">Loading CV...</div>
      </div>
    );
  }

  const contactItems = [
    owner?.email,
    owner?.phone,
    owner?.location,
    owner?.linkedin?.replace(/https?:\/\/(www\.)?/, ''),
    'MIA.dev',
  ].filter(Boolean);

  return (
    <>
      <style jsx global>{`
        /* ─── Paper ──────────────────────────────────────────────────────────── */
        #cv-paper {
          background: #fff;
          padding: 2.8rem 3rem;
          max-width: 210mm;
          margin: 0 auto;
          box-shadow: 0 25px 60px rgba(0,0,0,0.45);
          font-family: 'Times New Roman', Times, Georgia, serif;
          color: #000;
        }
        #cv-paper * { color: #000 !important; }

        /* ─── Header ─────────────────────────────────────────────────────────── */
        .cv-header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 1.1rem;
          margin-bottom: 1.2rem;
        }
        .cv-owner-name {
          font-size: 1.9rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          margin: 0 0 0.2rem;
          line-height: 1.15;
        }
        .cv-owner-role {
          font-size: 0.95rem;
          font-style: italic;
          margin: 0 0 0.55rem;
        }
        .cv-contact {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          font-family: 'Courier New', Courier, monospace;
          font-size: 0.8rem;
          line-height: 1.6;
        }
        .cv-sep        { margin: 0 0.5rem; color: #777 !important; }
        .cv-sep-inline { margin: 0 0.3rem; color: #888 !important; }

        /* ─── Section ────────────────────────────────────────────────────────── */
        .cv-section { margin-bottom: 1.3rem; }

        .cv-section-title {
          font-family: 'Courier New', Courier, monospace;
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          border-bottom: 1.5px solid #000;
          padding-bottom: 0.22rem;
          margin: 0 0 0.7rem;
        }

        /* ─── Entry ──────────────────────────────────────────────────────────── */
        .cv-entry { margin-bottom: 1.1rem; }
        .cv-entry:last-child { margin-bottom: 0; }

        .cv-entry-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 0.2rem;
        }
        .cv-entry-left {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          flex: 1;
          min-width: 0;
        }
        .cv-entry-title {
          font-size: 0.95rem;
          font-weight: 700;
          line-height: 1.3;
          display: block;
        }
        .cv-entry-meta {
          font-family: 'Courier New', Courier, monospace;
          font-size: 0.78rem;
          color: #444 !important;
          display: block;
          line-height: 1.4;
        }
        .cv-entry-date {
          font-family: 'Courier New', Courier, monospace;
          font-size: 0.78rem;
          color: #444 !important;
          white-space: nowrap;
          flex-shrink: 0;
          padding-top: 0.05rem;
        }

        /* ─── GPA ────────────────────────────────────────────────────────────── */
        .cv-gpa {
          font-size: 0.82rem;
          font-weight: 700;
          margin: 0.2rem 0 0.25rem;
        }

        /* ─── Bullets ────────────────────────────────────────────────────────── */
        .cv-bullets {
          list-style: none;
          padding: 0;
          margin: 0.3rem 0 0;
        }
        .cv-bullets li {
          display: flex;
          gap: 0.55rem;
          font-size: 0.85rem;
          line-height: 1.65;
          margin-bottom: 3px;
        }
        .cv-bullet-dot {
          flex-shrink: 0;
          margin-top: 1px;
        }
        .cv-bullets li span:last-child {
          flex: 1;
          text-align: justify;
        }

        /* ─── Body paragraph ─────────────────────────────────────────────────── */
        .cv-body {
          font-size: 0.85rem;
          line-height: 1.65;
          text-align: justify;
          margin: 0 0 0.35rem;
        }

        /* ─── Project links ──────────────────────────────────────────────────── */
        .cv-project-links {
          font-family: 'Courier New', Courier, monospace;
          font-size: 0.78rem;
          color: #444 !important;
          margin: 0.15rem 0 0;
        }

        /* ─── Print ──────────────────────────────────────────────────────────── */
        @media print {
          body { background: white !important; }
          .toolbar-container { display: none !important; }
          .min-h-screen, .bg-gradient-to-br { background: white !important; padding: 0 !important; }
          .max-w-4xl { max-width: 100% !important; padding: 0 !important; }
          #cv-paper { padding: 1.2cm 1.5cm; box-shadow: none !important; max-width: 100%; }
          .cv-section       { page-break-inside: avoid; }
          .cv-entry         { page-break-inside: avoid; }
          .cv-section-title { page-break-after: avoid; }
          .cv-entry-title   { page-break-after: avoid; }
          .cv-bullets li    { page-break-inside: avoid; }
        }
        @page { size: A4; margin: 1.2cm 1.5cm; }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#111633] to-[#0a0e27] pb-20">

        {/* Sticky Toolbar */}
        <div
          className="toolbar-container sticky top-0 z-40 border-b border-[#1e2a4a]"
          style={{ background: 'rgba(10,14,39,0.97)', backdropFilter: 'blur(8px)' }}
        >
          <div style={{ maxWidth: '210mm', margin: '0 auto', padding: '0 2rem', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={() => router.back()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontFamily: 'Courier New, monospace', fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', padding: 0 }}
              onMouseEnter={e => (e.currentTarget.style.color = '#00d9ff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
              Back
            </button>

            <button
              onClick={() => { window.location.href = '/api/cv/download'; }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '8px 18px', background: '#00d9ff', border: 'none', cursor: 'pointer', color: '#0a0e27', fontFamily: 'Courier New, monospace', fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#00c4e8'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#00d9ff'; }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Download PDF
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 pt-8">

          {/* CV Paper */}
          <div id="cv-paper">

            {/* HEADER */}
            <div className="cv-header">
              <h1 className="cv-owner-name">{owner?.name}</h1>
              <p className="cv-owner-role">{owner?.role}</p>
              {contactItems.length > 0 && (
                <div className="cv-contact">
                  {contactItems.map((item, i) => (
                    <span key={i}>
                      {item}
                      {i < contactItems.length - 1 && <span className="cv-sep">|</span>}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* PROFESSIONAL SUMMARY */}
            {owner?.about && (
              <section className="cv-section">
                <h2 className="cv-section-title">PROFESSIONAL SUMMARY</h2>
                {owner.about.split('\n\n').map((paragraph, i) => {
                  const cleaned = paragraph.trim().replace(/\s+/g, ' ');
                  return cleaned ? <p key={i} className="cv-body">{cleaned}</p> : null;
                })}
              </section>
            )}

            {/* EDUCATION */}
            {educations.length > 0 && (
              <section className="cv-section">
                <h2 className="cv-section-title">EDUCATION</h2>
                {educations.map((edu) => {
                  const achievements = getAchievements(edu.achievements);
                  return (
                    <div key={edu._id} className="cv-entry">
                      <div className="cv-entry-header">
                        <div className="cv-entry-left">
                          <span className="cv-entry-title">{edu.title}</span>
                          <span className="cv-entry-meta">
                            {edu.company}
                            {edu.location && <><span className="cv-sep-inline">|</span>{edu.location}</>}
                          </span>
                        </div>
                        <span className="cv-entry-date">
                          {formatDate(edu.startDate)}
                          {(edu.startDate || edu.endDate) && ' – '}
                          {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                        </span>
                      </div>

                      {owner?.gpa && <p className="cv-gpa">GPA: {owner.gpa}/4.00</p>}

                      {/* ✅ achievements sebagai bullet list */}
                      {achievements.length > 0 && (
                        <ul className="cv-bullets">
                          {achievements.map((item, i) => (
                            <li key={i}>
                              <span className="cv-bullet-dot">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </section>
            )}

            {/* WORK EXPERIENCE */}
            {experiences.length > 0 && (
              <section className="cv-section">
                <h2 className="cv-section-title">WORK EXPERIENCE</h2>
                {experiences.map((exp) => {
                  const isCurrent   = !exp.endDate;
                  const achievements = getAchievements(exp.achievements);
                  return (
                    <div key={exp._id} className="cv-entry">
                      <div className="cv-entry-header">
                        <div className="cv-entry-left">
                          <span className="cv-entry-title">{exp.title}</span>
                          <span className="cv-entry-meta">
                            {exp.company}
                            {exp.location && <><span className="cv-sep-inline">|</span>{exp.location}</>}
                          </span>
                        </div>
                        <span className="cv-entry-date">
                          {formatDate(exp.startDate)} – {isCurrent ? 'Present' : formatDate(exp.endDate || '')}
                        </span>
                      </div>

                      {/* ✅ Loop semua achievements sebagai bullet terpisah */}
                      {achievements.length > 0 ? (
                        <ul className="cv-bullets">
                          {achievements.map((item, i) => (
                            <li key={i}>
                              <span className="cv-bullet-dot">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : exp.description ? (
                        // fallback: tampilkan description jika achievements kosong
                        <ul className="cv-bullets">
                          <li>
                            <span className="cv-bullet-dot">•</span>
                            <span>{exp.description.replace(/<[^>]*>/g, '')}</span>
                          </li>
                        </ul>
                      ) : null}
                    </div>
                  );
                })}
              </section>
            )}

            {/* CERTIFICATIONS */}
            {certifications.length > 0 && (
              <section className="cv-section">
                <h2 className="cv-section-title">CERTIFICATIONS</h2>
                {certifications.map((cert, i) => (
                  <div key={i} className="cv-entry-header" style={{ marginBottom: '0.45rem' }}>
                    <div className="cv-entry-left">
                      <span className="cv-entry-title">{cert.name}</span>
                      <span className="cv-entry-meta">{cert.issuer}</span>
                    </div>
                    <span className="cv-entry-date">{cert.year}</span>
                  </div>
                ))}
              </section>
            )}

            {/* SELECTED PROJECTS */}
            {projects.length > 0 && (
              <section className="cv-section">
                <h2 className="cv-section-title">SELECTED PROJECTS</h2>
                {projects.slice(0, 5).map((project) => (
                  <div key={project._id} className="cv-entry">
                    <p className="cv-entry-title" style={{ marginBottom: '0.3rem' }}>
                      {project.title}
                    </p>
                    {project.description && (
                      <p className="cv-body" style={{ marginBottom: '0.3rem' }}>
                        {project.description.replace(/<[^>]*>/g, '')}
                      </p>
                    )}
                    {project.techStack?.length > 0 && (
                      <p className="cv-body" style={{ marginBottom: '0.25rem' }}>
                        <strong>Tech Stack:</strong> {project.techStack.join(', ')}
                      </p>
                    )}
                    {(project.githubUrl || project.demoUrl) && (
                      <p className="cv-project-links">
                        {project.githubUrl && `GitHub: ${project.githubUrl}`}
                        {project.githubUrl && project.demoUrl && <span className="cv-sep-inline">|</span>}
                        {project.demoUrl && `Demo: ${project.demoUrl}`}
                      </p>
                    )}
                  </div>
                ))}
              </section>
            )}

            {/* KEY SKILLS */}
            {skills.length > 0 && (
              <section className="cv-section">
                <h2 className="cv-section-title">KEY SKILLS</h2>
                {hardSkills.length > 0 && (
                  <p className="cv-body">
                    <strong>Technical Skills:</strong> {hardSkills.join(' • ')}
                  </p>
                )}
                {softSkills.length > 0 && (
                  <p className="cv-body">
                    <strong>Soft Skills:</strong> {softSkills.join(' • ')}
                  </p>
                )}
              </section>
            )}

          </div>
        </div>
      </div>
    </>
  );
}