'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
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
  categoryId?: {
    _id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  projectsCount: number;
}

export default function PortfolioPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  // ── Fetch Data ────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, catRes] = await Promise.all([
          fetch('/api/projects').then(r => r.json()),
          fetch('/api/categories').then(r => r.json()),
        ]);
        if (projRes.data) setProjects(projRes.data);
        if (catRes.data) setCategories(catRes.data);
      } catch (err) {
        console.error('Failed to fetch portfolio data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Filtered Projects ─────────────────────────────────────
  const filtered = useMemo(() => {
    return projects.filter(p => {
      const matchCat =
        activeFilter === 'all' || p.categoryId?.slug === activeFilter;
      const q = search.toLowerCase();
      const matchSearch =
        search === '' ||
        p.title.toLowerCase().includes(q) ||
        p.techStack.some(s => s.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [projects, activeFilter, search]);

  // ── Theme vars (mirror home page dark theme) ───────────────
  const cyber = '#00d9ff';
  const purple = '#7c3aed';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500&family=Outfit:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          background: #0a0e27;
          color: #e2e8f0;
          overflow-x: hidden;
          font-family: 'Outfit', sans-serif;
        }
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,217,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,217,255,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
          z-index: 0;
        }
        .section-tag {
          font-family: 'DM Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: ${cyber};
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .section-tag::before { content: ''; width: 24px; height: 1px; background: ${cyber}; }
        .pill {
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem;
          padding: 6px 14px;
          border: 1px solid rgba(51,65,85,0.8);
          color: #475569;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s;
        }
        .pill:hover { border-color: rgba(0,217,255,0.4); color: #94a3b8; }
        .pill.active { border-color: ${cyber}; color: ${cyber}; background: rgba(0,217,255,0.08); }
        .search-input {
          background: rgba(17,22,51,0.9);
          border: 1px solid #1e2747;
          color: #94a3b8;
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem;
          padding: 8px 12px 8px 36px;
          outline: none;
          transition: border-color 0.2s, width 0.3s;
          width: 180px;
        }
        .search-input:focus { border-color: rgba(0,217,255,0.4); width: 240px; }
        .search-input::placeholder { color: #334155; }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .skeleton {
          background: linear-gradient(90deg, #111633 25%, #1a2347 50%, #111633 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes fadein { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
      `}</style>

      <div style={{ position: 'relative', minHeight: '100vh', zIndex: 1 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '128px 48px 96px' }}>

          {/* ── Page Header ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: 48 }}
          >
            <div className="section-tag" style={{ marginBottom: 12 }}>Works</div>
            <h1 style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              color: '#fff',
              marginBottom: 16,
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}>
              Project <span style={{ color: cyber }}>Gallery</span>
            </h1>
            <p style={{ color: '#94a3b8', maxWidth: 480, lineHeight: 1.7, fontFamily: 'Outfit, sans-serif' }}>
              Koleksi proyek yang dibangun dengan passion, presisi, dan teknologi terpilih.
            </p>
          </motion.div>

          {/* ── Filter Bar ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              marginBottom: 24,
            }}
          >
            {/* Category Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button
                className={`pill${activeFilter === 'all' ? ' active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All <span style={{ opacity: 0.5, marginLeft: 4 }}>{projects.length}</span>
              </button>
              {categories.map(cat => (
                <button
                  key={cat._id}
                  className={`pill${activeFilter === cat.slug ? ' active' : ''}`}
                  onClick={() => setActiveFilter(cat.slug)}
                >
                  {cat.name}
                  <span style={{ opacity: 0.5, marginLeft: 4 }}>{cat.projectsCount}</span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div style={{ position: 'relative' }}>
              <svg
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#334155', pointerEvents: 'none' }}
                width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                className="search-input"
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </motion.div>

          {/* ── Results Count ────────────────────────────────── */}
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: '#334155', marginBottom: 24 }}>
            <span style={{ color: cyber }}>{filtered.length}</span> projects found
          </div>

          {/* ── Grid ─────────────────────────────────────────── */}
          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{ height: 340, borderRadius: 0 }} className="skeleton" />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filtered.length > 0 ? (
                <motion.div
                  layout
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}
                >
                  {filtered.map((project, i) => (
                    <ProjectCard key={project._id} project={project} index={i} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ textAlign: 'center', padding: '96px 0' }}
                >
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '3rem', color: '#1e2747', marginBottom: 16 }}>
                    {'{ }'}
                  </div>
                  <p style={{ fontFamily: 'DM Mono, monospace', color: '#334155', fontSize: 14 }}>
                    No projects match your filter.
                  </p>
                  <button
                    onClick={() => { setActiveFilter('all'); setSearch(''); }}
                    style={{
                      marginTop: 16,
                      fontFamily: 'DM Mono, monospace',
                      fontSize: 12,
                      color: cyber,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
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