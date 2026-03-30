'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Lang = 'en' | 'id';

interface Project {
  _id: string;
  title: string;
  description: string;
  description_id: string;
  shortDescription: string;
  shortDescription_id: string;
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

interface ExperienceRaw {
  _id: string;
  type: 'work' | 'education';
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string | null;
  description: string;
  achievements: string[];
  description_id: string;
  achievements_id: string[];
}

interface ExperienceView {
  _id: string;
  type: 'work' | 'education';
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string | null;
  description: string;
  achievements: string[];
}

interface Certification {
  name: string;
  issuer: string;
  year: string;
}

const UI: Record<Lang, {
  loading: string; back: string; downloadPdf: string;
  sections: { summary: string; education: string; experience: string; certifications: string; projects: string; skills: string; techSkills: string; softSkills: string; techStack: string; };
  present: string; gpa: string; github: string; demo: string; role: string;
  aboutText: string; achievementsKey: string;
}> = {
  en: {
    loading: 'Loading CV...', back: 'Back', downloadPdf: 'Download PDF',
    sections: { summary: 'PROFESSIONAL SUMMARY', education: 'EDUCATION', experience: 'WORK EXPERIENCE', certifications: 'CERTIFICATIONS', projects: 'SELECTED PROJECTS', skills: 'KEY SKILLS', techSkills: 'Technical Skills', softSkills: 'Soft Skills', techStack: 'Tech Stack' },
    present: 'Present', gpa: 'GPA', github: 'GitHub', demo: 'Demo',
    role: 'IT Support & Full Stack Developer',
    aboutText: 'about_text', achievementsKey: 'achievements',
  },
  id: {
    loading: 'Memuat CV...', back: 'Kembali', downloadPdf: 'Unduh PDF',
    sections: { summary: 'RINGKASAN PROFESIONAL', education: 'PENDIDIKAN', experience: 'PENGALAMAN KERJA', certifications: 'SERTIFIKASI', projects: 'PROYEK PILIHAN', skills: 'KEAHLIAN UTAMA', techSkills: 'Keahlian Teknis', softSkills: 'Keahlian Non-Teknis', techStack: 'Teknologi' },
    present: 'Sekarang', gpa: 'IPK', github: 'GitHub', demo: 'Demo',
    role: 'IT Support & Full Stack Developer',
    aboutText: 'about_text', achievementsKey: 'achievements_id',
  },
};

function pickText(primary: string, translated: string, isID: boolean) {
  return isID && translated ? translated : primary;
}
function pickArr(primary: string[], translated: string[], isID: boolean) {
  return isID && translated?.length > 0 ? translated : primary;
}

// ── Inner component that uses useSearchParams ─────────────────────────────────
function CVPreviewInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lang, setLang] = useState<Lang>((searchParams.get('lang') as Lang) || 'en');
  const [animating, setAnimating] = useState(false);

  const [loading, setLoading]         = useState(true);
  const [rawExps, setRawExps]         = useState<ExperienceRaw[]>([]);
  const [projects, setProjects]       = useState<Project[]>([]);
  const [skills, setSkills]           = useState<Skill[]>([]);
  const [settingsMap, setSettingsMap] = useState<Record<string, any>>({});

  const L    = UI[lang];
  const isID = lang === 'id';

  useEffect(() => {
    async function fetchData() {
      try {
        const [settingsRes, projectsRes, skillsRes, experiencesRes] = await Promise.all([
          fetch('/api/settings').then(r => r.json()),
          fetch('/api/projects?featured=true').then(r => r.json()),
          fetch('/api/skills').then(r => r.json()),
          fetch('/api/experiences').then(r => r.json()),
        ]);
        const sm = settingsRes.data?.reduce(
          (acc: any, curr: any) => ({ ...acc, [curr.key]: curr }), {}
        ) || {};
        setSettingsMap(sm);
        setProjects(projectsRes.data || []);
        setSkills(skillsRes.data || []);
        setRawExps(experiencesRes.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch CV data:', error);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const aboutText = pickText(
    settingsMap['about_text']?.value    || '',
    settingsMap['about_text']?.value_id || '',
    isID
  );

  const ownerLocation = pickText(
    settingsMap['contact_location']?.value    || '',
    settingsMap['contact_location']?.value_id || '',
    isID
  );

  const experiences: ExperienceView[] = rawExps
    .filter(e => e.type === 'work')
    .map(e => ({
      _id: e._id, type: e.type, title: e.title, company: e.company,
      location: e.location, startDate: e.startDate, endDate: e.endDate,
      description: pickText(e.description || '', e.description_id || '', isID),
      achievements: pickArr(
        Array.isArray(e.achievements)    ? e.achievements    : [],
        Array.isArray(e.achievements_id) ? e.achievements_id : [],
        isID
      ),
    }));

  const educations: ExperienceView[] = rawExps
    .filter(e => e.type === 'education')
    .map(e => ({
      _id: e._id, type: e.type, title: e.title, company: e.company,
      location: e.location, startDate: e.startDate, endDate: e.endDate,
      description: pickText(e.description || '', e.description_id || '', isID),
      achievements: pickArr(
        Array.isArray(e.achievements)    ? e.achievements    : [],
        Array.isArray(e.achievements_id) ? e.achievements_id : [],
        isID
      ),
    }));

  const certifications: Certification[] = [
      { name: 'Networking & Cybersecurity Basic', issuer: 'Cisco Academy', year: '2024' },
      { name: 'Front End & Back End Web', issuer: 'MSIB Batch 6', year: '2024' },
      { name: 'Machine Learning Engineer', issuer: 'DBS Foundation Coding Camp', year: '2024' },
      { name: 'Data Science', issuer: 'Dicoding Indonesia', year: '2025' },
  ];

  const hardSkills = skills.filter(s => s.category === 'hard').map(s => s.name);
  const softSkills = skills.filter(s => s.category === 'soft').map(s => s.name);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(
      lang === 'en' ? 'en-US' : 'id-ID',
      { month: 'short', year: 'numeric' }
    );
  };

  const getAchievements = (achievements: string[] | undefined): string[] =>
    Array.isArray(achievements) ? achievements.filter(Boolean) : [];

  const handleLangSwitch = (newLang: Lang) => {
    setAnimating(true);
    setTimeout(() => { setLang(newLang); setAnimating(false); }, 200);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0e27', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'DM Mono, monospace', color: '#00d9ff', fontSize: 13, letterSpacing: '0.2em' }}>
          {L.loading}
        </div>
      </div>
    );
  }

  const ownerName     = settingsMap['hero_title']?.value    || 'Muhammad Irfan Abidin';
  const ownerEmail    = settingsMap['contact_email']?.value  || '';
  const ownerPhone    = settingsMap['contact_phone']?.value  || '';
  const ownerLinkedin = settingsMap['social_linkedin']?.value || '';
  const contactItems  = [ownerEmail, ownerPhone, ownerLocation, ownerLinkedin?.replace(/https?:\/\/(www\.)?/, ''), 'miabidin.dev'].filter(Boolean);

  return (
    <>
      <style jsx global>{`
        #cv-paper { background:#fff; padding:2.8rem 3rem; max-width:210mm; margin:0 auto; box-shadow:0 25px 60px rgba(0,0,0,0.45); font-family:'Times New Roman',Times,Georgia,serif; color:#000; transition:opacity 0.2s ease; }
        #cv-paper.fade { opacity:0; }
        #cv-paper * { color:#000 !important; }
        .cv-header { text-align:center; border-bottom:2px solid #000; padding-bottom:1.1rem; margin-bottom:1.2rem; }
        .cv-owner-name { font-size:1.9rem; font-weight:700; letter-spacing:0.03em; margin:0 0 0.2rem; line-height:1.15; }
        .cv-owner-role { font-size:0.95rem; font-style:italic; margin:0 0 0.55rem; }
        .cv-contact { display:flex; flex-wrap:wrap; justify-content:center; font-family:'Courier New',Courier,monospace; font-size:0.8rem; line-height:1.6; }
        .cv-sep { margin:0 0.5rem; color:#777 !important; }
        .cv-sep-inline { margin:0 0.3rem; color:#888 !important; }
        .cv-section { margin-bottom:1.3rem; }
        .cv-section-title { font-family:'Courier New',Courier,monospace; font-size:1.25rem; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; border-bottom:1.5px solid #000; padding-bottom:0.22rem; margin:0 0 0.7rem; }
        .cv-entry { margin-bottom:1.1rem; }
        .cv-entry:last-child { margin-bottom:0; }
        .cv-entry-header { display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; margin-bottom:0.2rem; }
        .cv-entry-left { display:flex; flex-direction:column; gap:0.1rem; flex:1; min-width:0; }
        .cv-entry-title { font-size:0.95rem; font-weight:700; line-height:1.3; display:block; }
        .cv-entry-meta { font-family:'Courier New',Courier,monospace; font-size:0.78rem; color:#444 !important; display:block; line-height:1.4; }
        .cv-entry-date { font-family:'Courier New',Courier,monospace; font-size:0.78rem; color:#444 !important; white-space:nowrap; flex-shrink:0; padding-top:0.05rem; }
        .cv-gpa { font-size:0.82rem; font-weight:700; margin:0.2rem 0 0.25rem; }
        .cv-bullets { list-style:none; padding:0; margin:0.3rem 0 0; }
        .cv-bullets li { display:flex; gap:0.55rem; font-size:0.85rem; line-height:1.65; margin-bottom:3px; }
        .cv-bullet-dot { flex-shrink:0; margin-top:1px; }
        .cv-bullets li span:last-child { flex:1; text-align:justify; }
        .cv-body { font-size:0.85rem; line-height:1.65; text-align:justify; margin:0 0 0.35rem; }
        .cv-project-links { font-family:'Courier New',Courier,monospace; font-size:0.78rem; color:#444 !important; margin:0.15rem 0 0; }
        .lang-switcher { display:flex; align-items:center; gap:2px; background:rgba(0,0,0,0.35); border:1px solid rgba(255,255,255,0.08); padding:3px; border-radius:6px; }
        .lang-btn { display:flex; align-items:center; gap:6px; padding:6px 14px; border:none; cursor:pointer; font-family:'DM Mono',monospace; font-size:11px; letter-spacing:0.12em; text-transform:uppercase; border-radius:4px; transition:all 0.2s; font-weight:600; }
        .lang-btn.active-en { background:rgba(0,217,255,0.15); color:#00d9ff; box-shadow:0 0 12px rgba(0,217,255,0.2),inset 0 1px 0 rgba(0,217,255,0.2); }
        .lang-btn.active-id { background:rgba(167,139,250,0.15); color:#a78bfa; box-shadow:0 0 12px rgba(167,139,250,0.2),inset 0 1px 0 rgba(167,139,250,0.2); }
        .lang-btn.inactive { background:transparent; color:#475569; }
        .lang-btn.inactive:hover { background:rgba(255,255,255,0.05); color:#94a3b8; }
        @media print {
          body { background:white !important; }
          .toolbar-container { display:none !important; }
          #cv-paper { padding:1.2cm 1.5cm; box-shadow:none !important; max-width:100%; }
          .cv-section { page-break-inside:avoid; }
          .cv-entry { page-break-inside:avoid; }
        }
        @page { size:A4; margin:1.2cm 1.5cm; }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e27 0%, #111633 50%, #0a0e27 100%)', paddingBottom: 80 }}>
        {/* Toolbar */}
        <div className="toolbar-container" style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(9,13,35,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '210mm', margin: '0 auto', padding: '0 2rem', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', padding: 0, transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')} onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
              {L.back}
            </button>
            <div className="lang-switcher">
              {(['en', 'id'] as const).map(l => (
                <button key={l} className={`lang-btn ${lang === l ? `active-${l}` : 'inactive'}`} onClick={() => handleLangSwitch(l)}>
                  <span style={{ fontSize: 15 }}>{l === 'en' ? '🇬🇧' : '🇮🇩'}</span>
                  {l.toUpperCase()}
                  {lang === l && <span style={{ width: 5, height: 5, borderRadius: '50%', background: l === 'en' ? '#00d9ff' : '#a78bfa', display: 'inline-block', boxShadow: `0 0 6px ${l === 'en' ? '#00d9ff' : '#a78bfa'}` }} />}
                </button>
              ))}
            </div>
            <button onClick={() => { window.location.href = `/api/cv/download?lang=${lang}`; }} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', background: lang === 'en' ? '#00d9ff' : '#a78bfa', border: 'none', cursor: 'pointer', color: '#0a0e27', fontFamily: 'DM Mono, monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', borderRadius: 4, transition: 'all 0.2s' }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              {L.downloadPdf}
            </button>
          </div>
        </div>

        <div style={{ maxWidth: '210mm', margin: '10px auto 0', padding: '0 2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#334155' }}>
            <span style={{ width: 6, height: 6, background: lang === 'en' ? '#00d9ff' : '#a78bfa', borderRadius: '50%', boxShadow: `0 0 8px ${lang === 'en' ? '#00d9ff' : '#a78bfa'}` }} />
            <span style={{ color: '#475569' }}>Viewing in:</span>
            <span style={{ color: lang === 'en' ? '#00d9ff' : '#a78bfa', fontWeight: 700 }}>{lang === 'en' ? '🇬🇧 English' : '🇮🇩 Indonesia'}</span>
          </div>
        </div>

        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '16px 24px 0' }}>
          <div id="cv-paper" className={animating ? 'fade' : ''}>
            {/* HEADER */}
            <div className="cv-header">
              <h1 className="cv-owner-name">{ownerName}</h1>
              <p className="cv-owner-role">{L.role}</p>
              {contactItems.length > 0 && (
                <div className="cv-contact">
                  {contactItems.map((item, i) => (
                    <span key={i}>{item}{i < contactItems.length - 1 && <span className="cv-sep">|</span>}</span>
                  ))}
                </div>
              )}
            </div>

            {/* SUMMARY */}
            {aboutText && (
              <section className="cv-section">
                <h2 className="cv-section-title">{L.sections.summary}</h2>
                {aboutText.split('\n\n').map((p, i) => { const c = p.trim().replace(/\s+/g, ' '); return c ? <p key={i} className="cv-body">{c}</p> : null; })}
              </section>
            )}

            {/* EDUCATION */}
            {educations.length > 0 && (
              <section className="cv-section">
                <h2 className="cv-section-title">{L.sections.education}</h2>
                {educations.map(edu => (
                  <div key={edu._id} className="cv-entry">
                    <div className="cv-entry-header">
                      <div className="cv-entry-left">
                        <span className="cv-entry-title">{edu.title}</span>
                        <span className="cv-entry-meta">{edu.company}{edu.location && <><span className="cv-sep-inline">|</span>{edu.location}</>}</span>
                      </div>
                      <span className="cv-entry-date">{formatDate(edu.startDate)}{(edu.startDate || edu.endDate) && ' – '}{edu.endDate ? formatDate(edu.endDate) : L.present}</span>
                    </div>
                    <p className="cv-gpa">{L.gpa}: 3.83/4.00</p>
                    {getAchievements(edu.achievements).length > 0 && (
                      <ul className="cv-bullets">{getAchievements(edu.achievements).map((item, i) => <li key={i}><span className="cv-bullet-dot">•</span><span>{item}</span></li>)}</ul>
                    )}
                  </div>
                ))}
              </section>
            )}

            {/* WORK EXPERIENCE */}
            {experiences.length > 0 && (
              <section className="cv-section">
                <h2 className="cv-section-title">{L.sections.experience}</h2>
                {experiences.map(exp => {
                  const achievements = getAchievements(exp.achievements);
                  return (
                    <div key={exp._id} className="cv-entry">
                      <div className="cv-entry-header">
                        <div className="cv-entry-left">
                          <span className="cv-entry-title">{exp.title}</span>
                          <span className="cv-entry-meta">{exp.company}{exp.location && <><span className="cv-sep-inline">|</span>{exp.location}</>}</span>
                        </div>
                        <span className="cv-entry-date">{formatDate(exp.startDate)} – {!exp.endDate ? L.present : formatDate(exp.endDate || '')}</span>
                      </div>
                      {achievements.length > 0 ? (
                        <ul className="cv-bullets">{achievements.map((item, i) => <li key={i}><span className="cv-bullet-dot">•</span><span>{item}</span></li>)}</ul>
                      ) : exp.description ? (
                        <ul className="cv-bullets"><li><span className="cv-bullet-dot">•</span><span>{exp.description}</span></li></ul>
                      ) : null}
                    </div>
                  );
                })}
              </section>
            )}

            {/* CERTIFICATIONS */}
            {certifications.length > 0 && (
              <section className="cv-section">
                <h2 className="cv-section-title">{L.sections.certifications}</h2>
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

            {/* PROJECTS */}
            {projects.length > 0 && (
              <section className="cv-section">
                <h2 className="cv-section-title">{L.sections.projects}</h2>
                {projects.slice(0, 5).map(project => {
                  const desc = pickText(
                      project.shortDescription || project.description || '',
                      project.shortDescription_id || project.description_id || '',
                      isID
                    );
                  return (
                    <div key={project._id} className="cv-entry">
                      <p className="cv-entry-title" style={{ marginBottom: '0.3rem' }}>{project.title}</p>
                      {desc && <p className="cv-body" style={{ marginBottom: '0.3rem' }}>{desc.replace(/<[^>]*>/g, '')}</p>}
                      {project.techStack?.length > 0 && <p className="cv-body" style={{ marginBottom: '0.25rem' }}><strong>{L.sections.techStack}:</strong> {project.techStack.join(', ')}</p>}
                      {(project.githubUrl || project.demoUrl) && (
                        <p className="cv-project-links">
                          {project.githubUrl && `${L.github}: ${project.githubUrl}`}
                          {project.githubUrl && project.demoUrl && <span className="cv-sep-inline">|</span>}
                          {project.demoUrl && `${L.demo}: ${project.demoUrl}`}
                        </p>
                      )}
                    </div>
                  );
                })}
              </section>
            )}

            {/* SKILLS */}
            {skills.length > 0 && (
              <section className="cv-section">
                <h2 className="cv-section-title">{L.sections.skills}</h2>
                {hardSkills.length > 0 && <p className="cv-body"><strong>{L.sections.techSkills}:</strong> {hardSkills.join(' • ')}</p>}
                {softSkills.length > 0 && <p className="cv-body"><strong>{L.sections.softSkills}:</strong> {softSkills.join(' • ')}</p>}
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Default export wrapped in Suspense ────────────────────────────────────────
export default function CVPreviewPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0a0e27', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'DM Mono, monospace', color: '#00d9ff', fontSize: 13, letterSpacing: '0.2em' }}>
          Loading CV...
        </div>
      </div>
    }>
      <CVPreviewInner />
    </Suspense>
  );
}