'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import ProjectCard from '@/components/ProjectCard';

// ── Types ─────────────────────────────────────────────────
interface Project {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  techStack: string[];
  githubUrl?: string;
  demoUrl?: string;
  isFeatured: boolean;
  imagePath: string;
  categoryId?: { _id: string; name: string; slug: string; };
  createdAt: string;
}

export default function PortfolioDetailPage() {
  const params = useParams();
  const slug   = params?.slug as string;
  const { isLight } = useTheme();
  const t = isLight;

  // ── Theme vars ────────────────────────────────────────────
  const cyber       = t ? '#0077aa' : '#00d9ff';
  const purple      = '#7c3aed';
  const green       = '#10b981';
  const bg          = t ? '#f0f4ff' : '#0a0e27';
  const bgCard      = t ? '#ffffff' : '#111633';
  const bgPage      = t ? '#f0f4ff' : '#0a0e27';
  const textPri     = t ? '#0f172a' : '#fff';
  const textSec     = t ? '#334155' : '#64748b';
  const textMut     = t ? '#64748b' : '#334155';
  const textMutHov  = t ? '#0f172a' : '#94a3b8';
  const borderSub   = t ? 'rgba(0,140,180,0.08)' : 'rgba(0,217,255,0.08)';
  const borderMed   = t ? 'rgba(0,140,180,0.2)'  : 'rgba(0,217,255,0.15)';
  const techBg      = t ? 'rgba(228,234,248,0.8)' : 'rgba(17,22,51,0.8)';
  const techBorder  = t ? 'rgba(0,119,170,0.18)'  : 'rgba(0,217,255,0.15)';
  const techColor   = t ? '#334155' : '#94a3b8';
  const techHovBorder = t ? 'rgba(0,119,170,0.5)' : 'rgba(0,217,255,0.5)';
  const techHovColor  = t ? '#0f172a' : '#fff';
  const breadColor  = t ? '#64748b' : '#334155';
  const breadHov    = t ? '#0077aa' : '#00d9ff';
  const divider     = t ? 'rgba(0,140,180,0.1)'  : 'rgba(0,217,255,0.08)';
  const gridLine    = t ? 'rgba(0,140,180,0.04)' : 'rgba(0,217,255,0.04)';
  const skeletonA   = t ? '#e8eef8' : '#111633';
  const skeletonB   = t ? '#f0f4ff' : '#1a2347';
  const emptyIcon   = t ? '#d1d9ee' : '#1e2747';

  const [project,   setProject]   = useState<Project | null>(null);
  const [related,   setRelated]   = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound,  setNotFound]  = useState(false);

  useEffect(() => {
    if (!slug) return;
    const fetchProject = async () => {
      try {
        const res  = await fetch(`/api/projects?slug=${slug}`).then(r => r.json());
        const proj: Project | null = Array.isArray(res.data)
          ? res.data.find((p: Project) => p.slug === slug) ?? null
          : res.data ?? null;
        if (!proj) { setNotFound(true); return; }
        setProject(proj);
        if (proj.categoryId) {
          const relRes = await fetch(`/api/projects?categoryId=${proj.categoryId._id}`).then(r => r.json());
          setRelated((relRes.data ?? []).filter((p: Project) => p._id !== proj._id).slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to fetch project:', err);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProject();
  }, [slug]);

  const sharedStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500&family=Outfit:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: ${bgPage};
      color: ${textPri};
      font-family: 'Outfit', sans-serif;
      overflow-x: hidden;
      transition: background 0.4s, color 0.4s;
    }
    body::before {
      content: ''; position: fixed; inset: 0;
      background-image:
        linear-gradient(${gridLine} 1px, transparent 1px),
        linear-gradient(90deg, ${gridLine} 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events: none; z-index: 0;
    }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
    @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
    .skeleton {
      background: linear-gradient(90deg, ${skeletonA} 25%, ${skeletonB} 50%, ${skeletonA} 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: clamp(24px, 5vw, 48px);
    }
    @media (min-width: 768px)  { .detail-grid { grid-template-columns: 1fr 280px; } }
    @media (min-width: 1024px) { .detail-grid { grid-template-columns: 1fr 320px; } }
    @media (max-width: 767px) {
      .detail-grid > div:last-child {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .detail-grid > div:last-child > a { grid-column: 1 / -1; }
    }
    @media (max-width: 479px) {
      .detail-grid > div:last-child { grid-template-columns: 1fr; }
    }
    .related-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: clamp(12px, 3vw, 20px);
    }
    @media (min-width: 640px)  { .related-grid { grid-template-columns: repeat(2,1fr); } }
    @media (min-width: 1024px) { .related-grid { grid-template-columns: repeat(3,1fr); } }
    .action-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px clamp(14px,3vw,24px);
      font-family: 'DM Mono', monospace;
      font-size: clamp(11px, 2.5vw, 12px);
      letter-spacing: 0.1em; text-transform: uppercase;
      text-decoration: none; transition: all 0.3s;
      white-space: nowrap;
    }
    .action-btn-primary {
      background: linear-gradient(135deg, ${t ? 'rgba(0,119,170,0.1)' : 'rgba(0,217,255,0.12)'}, ${t ? 'rgba(124,58,237,0.1)' : 'rgba(124,58,237,0.12)'});
      border: 1px solid ${cyber};
      color: ${cyber};
    }
    .action-btn-primary:hover { background: ${cyber} !important; color: ${t ? '#ffffff' : '#0a0e27'} !important; box-shadow: 0 0 30px ${cyber}40; }
    .action-btn-secondary {
      border: 1px solid ${purple};
      color: ${purple};
      background: rgba(124,58,237,0.05);
    }
    .action-btn-secondary:hover { background: ${purple} !important; color: #fff !important; }
  `;

  // ── Loading ──────────────────────────────────────────────
  if (isLoading) return (
    <>
      <style>{sharedStyles}</style>
      <div style={{ background: bgPage, minHeight: '100vh', paddingTop: 64 }}>
        <div style={{ height: 'clamp(200px,40vw,384px)' }} className="skeleton" />
        <div style={{ maxWidth: 1024, margin: '0 auto', padding: '0 clamp(16px,5vw,48px)' }}>
          <div style={{ height: 28, width: 180, marginTop: 32, marginBottom: 14 }} className="skeleton" />
          <div style={{ height: 48, width: '60%', marginBottom: 20 }} className="skeleton" />
          <div style={{ height: 160, marginBottom: 20 }} className="skeleton" />
        </div>
      </div>
    </>
  );

  // ── 404 ──────────────────────────────────────────────────
  if (notFound || !project) return (
    <>
      <style>{sharedStyles}</style>
      <div style={{ background: bgPage, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, fontFamily: 'DM Mono, monospace', padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 'clamp(2.5rem,10vw,4rem)', color: emptyIcon }}>{'{ }'}</div>
        <p style={{ color: textMut, fontSize: 14 }}>Project not found.</p>
        <a href="/portfolio" style={{ color: cyber, fontSize: 12, textDecoration: 'none' }}>← Back to Portfolio</a>
      </div>
    </>
  );

  const publishedDate = new Date(project.createdAt).toLocaleDateString('en', { month: 'long', year: 'numeric' });
  const isLive        = Boolean(project.demoUrl);

  return (
    <>
      <style>{sharedStyles}</style>
      <div style={{ position: 'relative', background: bgPage, minHeight: '100vh', zIndex: 1 }}>

        {/* ── Hero Image ── */}
        {project.imagePath ? (
          <div style={{ position: 'relative', height: 'clamp(200px,40vw,384px)', overflow: 'hidden', marginTop: 64 }}>
            <motion.img
              src={project.imagePath} alt={project.title}
              initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 0.8 }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: t
                ? 'linear-gradient(to top, rgba(240,244,255,0.92) 0%, rgba(240,244,255,0.5) 50%, transparent 100%)'
                : 'linear-gradient(to top, #0a0e27 0%, rgba(10,14,39,0.6) 50%, transparent 100%)',
            }} />
          </div>
        ) : (
          <div style={{ height: 80, borderBottom: `1px solid ${borderSub}`, marginTop: 64 }} />
        )}

        <div style={{
          maxWidth: 1024,
          margin: '0 auto',
          padding: `0 clamp(16px,5vw,48px)`,
          marginTop: project.imagePath ? 'clamp(-40px,-8vw,-80px)' : 0,
          position: 'relative',
          zIndex: 10,
          paddingBottom: 'clamp(48px,10vh,96px)',
        }}>

          {/* ── Breadcrumb ── */}
          <motion.nav initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'DM Mono, monospace', fontSize: 'clamp(10px,2.5vw,12px)', color: breadColor, marginBottom: 20, flexWrap: 'wrap' }}>
            <a href="/" style={{ color: breadColor, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = breadHov}
              onMouseLeave={e => e.currentTarget.style.color = breadColor}>Home</a>
            <span>/</span>
            <a href="/portfolio" style={{ color: breadColor, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = breadHov}
              onMouseLeave={e => e.currentTarget.style.color = breadColor}>Portfolio</a>
            <span>/</span>
            <span style={{ color: textMut }}>{project.title.length > 30 ? project.title.slice(0, 30) + '…' : project.title}</span>
          </motion.nav>

          {/* ── Main Grid ── */}
          <div className="detail-grid">

            {/* ── Left: Main Content ── */}
            <div>
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                style={{ marginBottom: 'clamp(20px,5vw,32px)' }}>
                {project.categoryId && (
                  <span style={{ display: 'inline-block', fontFamily: 'DM Mono, monospace', fontSize: 11, border: `1px solid ${borderMed}`, color: cyber, background: t ? 'rgba(0,119,170,0.06)' : 'rgba(0,217,255,0.05)', padding: '3px 10px', marginBottom: 12, letterSpacing: '0.05em' }}>
                    {project.categoryId.name}
                  </span>
                )}
                <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.75rem,6vw,3.5rem)', color: textPri, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 14 }}>
                  {project.title}
                </h1>
                {project.isFeatured && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'DM Mono, monospace', fontSize: 11, background: cyber, color: t ? '#fff' : '#0a0e27', padding: '4px 12px', fontWeight: 700, letterSpacing: '0.1em' }}>
                    ★ FEATURED PROJECT
                  </span>
                )}
              </motion.div>

              {/* Description Card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                style={{ background: bgCard, border: `1px solid ${borderSub}`, marginBottom: 'clamp(20px,5vw,32px)' }}>
                <div style={{ height: 2, background: `linear-gradient(90deg,transparent,${cyber},transparent)` }} />
                <div style={{ padding: 'clamp(16px,4vw,28px)' }}>
                  <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(15px,3vw,18px)', fontWeight: 700, color: textPri, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 3, height: 20, background: cyber, display: 'inline-block', flexShrink: 0 }} />
                    About This Project
                  </h2>
                  <div style={{ color: textSec, lineHeight: 1.75, fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(13px,2.5vw,15px)', whiteSpace: 'pre-line' }}>
                    {project.description}
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noreferrer" className="action-btn action-btn-primary"
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = cyber; el.style.color = t ? '#ffffff' : '#0a0e27'; el.style.boxShadow = `0 0 30px ${cyber}40`; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = ''; el.style.color = cyber; el.style.boxShadow = 'none'; }}>
                    <GitHubIcon /> View on GitHub
                  </a>
                )}
                {project.demoUrl && (
                  <a href={project.demoUrl} target="_blank" rel="noreferrer" className="action-btn action-btn-secondary"
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = purple; el.style.color = '#fff'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(124,58,237,0.05)'; el.style.color = purple; }}>
                    <ExternalLinkIcon /> Live Demo
                  </a>
                )}
              </motion.div>
            </div>

            {/* ── Sidebar ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px,3vw,20px)' }}>

              {/* Tech Stack */}
              {project.techStack.length > 0 && (
                <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
                  style={{ background: bgCard, border: `1px solid ${borderSub}`, padding: 'clamp(16px,4vw,24px)' }}>
                  <h3 style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', color: cyber, marginBottom: 14 }}>Tech Stack</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {project.techStack.map(tech => (
                      <span key={tech}
                        style={{ fontFamily: 'DM Mono, monospace', fontSize: 'clamp(10px,2vw,12px)', background: techBg, border: `1px solid ${techBorder}`, color: techColor, padding: '5px 10px', transition: 'all 0.2s', cursor: 'default' }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = techHovBorder; el.style.color = techHovColor; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = techBorder; el.style.color = techColor; }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Project Info */}
              <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.22 }}
                style={{ background: bgCard, border: `1px solid ${borderSub}`, padding: 'clamp(16px,4vw,24px)' }}>
                <h3 style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', color: cyber, marginBottom: 14 }}>Project Info</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {project.categoryId && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: textMut, flexShrink: 0 }}>Category</span>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: textSec, textAlign: 'right' }}>{project.categoryId.name}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: textMut }}>Status</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'DM Mono, monospace', fontSize: 12, color: isLive ? green : '#60a5fa' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: isLive ? green : '#60a5fa', animation: 'blink 2s step-end infinite' }} />
                      {isLive ? 'Live' : 'Completed'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: textMut, flexShrink: 0 }}>Published</span>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: textSec, textAlign: 'right' }}>{publishedDate}</span>
                  </div>
                </div>
              </motion.div>

              {/* Back link */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <a href="/portfolio"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'DM Mono, monospace', fontSize: 12, color: textMut, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = cyber}
                  onMouseLeave={e => e.currentTarget.style.color = textMut}>
                  ← Back to Portfolio
                </a>
              </motion.div>
            </div>
          </div>

          {/* ── Related Projects ── */}
          {related.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              style={{ marginTop: 'clamp(48px,10vh,80px)', paddingTop: 'clamp(28px,5vh,48px)', borderTop: `1px solid ${divider}` }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.25rem,4vw,1.75rem)', fontWeight: 700, color: textPri, marginBottom: 'clamp(20px,4vh,32px)' }}>
                Related <span style={{ color: cyber }}>Projects</span>
              </h2>
              <div className="related-grid">
                {related.map((rel, i) => <ProjectCard key={rel._id} project={rel} index={i} />)}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}

function GitHubIcon() {
  return (
    <svg width={15} height={15} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width={15} height={15} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}