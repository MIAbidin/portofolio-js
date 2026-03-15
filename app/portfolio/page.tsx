'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

interface Category {
  _id: string;
  name: string;
  slug: string;
  projectsCount: number;
}

export default function PortfolioPage() {
  const { isLight } = useTheme();
  const t = isLight;

  // ── Theme vars ────────────────────────────────────────────
  const cyber      = t ? '#0077aa' : '#00d9ff';
  const bg         = t ? '#f0f4ff' : '#0a0e27';
  const bgCard     = t ? '#ffffff' : '#151b3b';
  const textPri    = t ? '#0f172a' : '#e2e8f0';
  const textSec    = t ? '#334155' : '#94a3b8';
  const textMut    = t ? '#64748b' : '#475569';
  const borderSub  = t ? 'rgba(0,140,180,0.12)' : 'rgba(51,65,85,0.8)';
  const borderHov  = t ? 'rgba(0,140,180,0.4)'  : 'rgba(0,217,255,0.4)';
  const pillActive = t ? 'rgba(0,119,170,0.1)'  : 'rgba(0,217,255,0.08)';
  const searchBg   = t ? 'rgba(228,234,248,0.9)' : 'rgba(17,22,51,0.9)';
  const searchBorder = t ? '#cbd5e1' : '#1e2747';
  const searchBorderFocus = t ? 'rgba(0,119,170,0.4)' : 'rgba(0,217,255,0.4)';
  const emptyIcon  = t ? '#d1d9ee' : '#1e2747';
  const gridLine   = t ? 'rgba(0,140,180,0.04)' : 'rgba(0,217,255,0.04)';

  const [projects,   setProjects]   = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, catRes] = await Promise.all([
          fetch('/api/projects').then(r => r.json()),
          fetch('/api/categories').then(r => r.json()),
        ]);
        if (projRes.data) setProjects(projRes.data);
        if (catRes.data)  setCategories(catRes.data);
      } catch (err) {
        console.error('Failed to fetch portfolio data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return projects.filter(p => {
      const matchCat    = activeFilter === 'all' || p.categoryId?.slug === activeFilter;
      const q           = search.toLowerCase();
      const matchSearch = search === '' || p.title.toLowerCase().includes(q) || p.techStack.some(s => s.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [projects, activeFilter, search]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500&family=Outfit:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          background: ${bg};
          color: ${textPri};
          overflow-x: hidden;
          font-family: 'Outfit', sans-serif;
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
        .section-tag {
          font-family: 'DM Mono', monospace;
          font-size: 0.7rem; letter-spacing: 0.2em;
          text-transform: uppercase; color: ${cyber};
          display: flex; align-items: center; gap: 8px;
        }
        .section-tag::before { content: ''; width: 24px; height: 1px; background: ${cyber}; }

        .pill {
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem; padding: 6px 14px;
          border: 1px solid ${borderSub};
          color: ${textMut};
          background: transparent; cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .pill:hover { border-color: ${borderHov}; color: ${textSec}; }
        .pill.active { border-color: ${cyber}; color: ${cyber}; background: ${pillActive}; }

        .search-wrap { position: relative; }
        .search-input {
          background: ${searchBg};
          border: 1px solid ${searchBorder};
          color: ${textSec};
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem;
          padding: 8px 12px 8px 36px;
          outline: none;
          transition: border-color 0.2s, width 0.3s;
          width: clamp(140px, 25vw, 180px);
        }
        .search-input:focus { border-color: ${searchBorderFocus}; width: clamp(180px, 35vw, 240px); }
        .search-input::placeholder { color: ${textMut}; opacity: 1; }

        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .skeleton {
          background: ${t
            ? 'linear-gradient(90deg,#e8eef8 25%,#f0f4ff 50%,#e8eef8 75%)'
            : 'linear-gradient(90deg,#111633 25%,#1a2347 50%,#111633 75%)'};
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        /* ── Responsive ── */
        .portfolio-wrap {
          max-width: 1280px;
          margin: 0 auto;
          padding: clamp(96px,14vh,128px) clamp(16px,5vw,48px) clamp(48px,10vh,96px);
        }
        .filter-bar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 24px;
        }
        .filter-pills { display: flex; flex-wrap: wrap; gap: 8px; }
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(clamp(260px,30vw,320px), 1fr));
          gap: clamp(12px, 2.5vw, 20px);
        }
        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(clamp(260px,30vw,320px), 1fr));
          gap: clamp(12px, 2.5vw, 20px);
        }

        @media (max-width: 640px) {
          .filter-bar { flex-direction: column; align-items: stretch; }
          .search-wrap { width: 100%; }
          .search-input { width: 100% !important; }
        }
      `}</style>

      <div style={{ position: 'relative', minHeight: '100vh', zIndex: 1 }}>
        <div className="portfolio-wrap">

          {/* ── Page Header ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{ marginBottom: 'clamp(28px,6vh,48px)' }}
          >
            <div className="section-tag" style={{ marginBottom: 12 }}>Works</div>
            <h1 style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 800,
              fontSize: 'clamp(2rem,7vw,4rem)',
              color: t ? '#0f172a' : '#fff',
              marginBottom: 16, lineHeight: 1, letterSpacing: '-0.02em',
            }}>
              Project <span style={{ color: cyber }}>Gallery</span>
            </h1>
            <p style={{ color: textSec, maxWidth: 480, lineHeight: 1.7, fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(13px,2.5vw,15px)' }}>
              Koleksi proyek yang dibangun dengan passion, presisi, dan teknologi terpilih.
            </p>
          </motion.div>

          {/* ── Filter Bar ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="filter-bar"
          >
            <div className="filter-pills">
              <button className={`pill${activeFilter === 'all' ? ' active' : ''}`} onClick={() => setActiveFilter('all')}>
                All <span style={{ opacity: 0.5, marginLeft: 4 }}>{projects.length}</span>
              </button>
              {categories.map(cat => (
                <button key={cat._id} className={`pill${activeFilter === cat.slug ? ' active' : ''}`} onClick={() => setActiveFilter(cat.slug)}>
                  {cat.name}<span style={{ opacity: 0.5, marginLeft: 4 }}>{cat.projectsCount}</span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="search-wrap">
              <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: textMut, pointerEvents: 'none' }}
                width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input className="search-input" type="text" placeholder="Search projects..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </motion.div>

          {/* ── Results Count ────────────────────────────────── */}
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: textMut, marginBottom: 24 }}>
            <span style={{ color: cyber }}>{filtered.length}</span> projects found
          </div>

          {/* ── Grid ─────────────────────────────────────────── */}
          {isLoading ? (
            <div className="skeleton-grid">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ height: 340 }} className="skeleton" />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filtered.length > 0 ? (
                <motion.div layout className="projects-grid">
                  {filtered.map((project, i) => (
                    <ProjectCard key={project._id} project={project} index={i} />
                  ))}
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ textAlign: 'center', padding: 'clamp(48px,10vh,96px) 0' }}>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 'clamp(2rem,8vw,3rem)', color: emptyIcon, marginBottom: 16 }}>{'{ }'}</div>
                  <p style={{ fontFamily: 'DM Mono, monospace', color: textMut, fontSize: 14 }}>No projects match your filter.</p>
                  <button onClick={() => { setActiveFilter('all'); setSearch(''); }}
                    style={{ marginTop: 16, fontFamily: 'DM Mono, monospace', fontSize: 12, color: cyber, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                    Clear filters →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          )}

        </div>
      </div>
    </>
  );
}