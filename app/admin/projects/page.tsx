'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, Panel, Btn } from '@/components/AdminLayout';

interface Category {
  _id:  string;
  name: string;
  slug: string;
}

interface Project {
  _id:                 string;
  title:               string;
  slug:                string;
  categoryId:          Category | string | null;
  techStack:           string[];
  isFeatured:          boolean;
  order:               number;
  shortDescription:    string;
  description_id:      string;
  shortDescription_id: string;
  githubUrl?:          string;
  demoUrl?:            string;
  completedAt?:        string;
  createdAt:           string;
}

const SECTIONS = [
  { key: 'featured', label: 'Featured Projects', color: '#00d9ff', bg: 'rgba(0,217,255,0.15)'   },
  { key: 'normal',   label: 'Other Projects',    color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
] as const;

function getCategoryName(cat: Category | string | null): string {
  if (!cat) return '—';
  if (typeof cat === 'object') return cat.name;
  return cat;
}

export default function ProjectsAdminPage() {
  const router = useRouter();
  const [items,    setItems]    = useState<Project[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const res  = await fetch('/api/projects');
      const data = await res.json();
      setItems(data.data || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    setItems(prev => prev.filter(i => i._id !== id));
    setDeleting(null);
  }

  const total    = items.length;
  const featured = items.filter(p => p.isFeatured);
  const normal   = items.filter(p => !p.isFeatured);
  const sectionRows = { featured, normal };

  return (
    <>
      <style>{`
        .proj-section-divider {
          display: flex; align-items: center; gap: 12px; margin-bottom: 16px;
        }
        .proj-section-label {
          font-family: 'DM Mono', monospace; font-size: 0.7rem;
          letter-spacing: 0.16em; text-transform: uppercase; white-space: nowrap;
        }
        .proj-divider-line { flex: 1; height: 1px; }

        .proj-table { width: 100%; border-collapse: collapse; }
        .proj-table th {
          font-family: 'DM Mono', monospace; font-size: 0.62rem;
          letter-spacing: 0.14em; text-transform: uppercase; color: #475569;
          padding: 10px 16px; border-bottom: 1px solid rgba(0,217,255,0.08);
          background: #06091a; white-space: nowrap; text-align: left;
        }
        .proj-table th.right { text-align: right; }
        .proj-table td {
          padding: 13px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          vertical-align: middle;
        }
        .proj-table tbody tr { transition: background 0.15s; }
        .proj-table tbody tr:hover td { background: rgba(0,217,255,0.025); }
        .proj-table tbody tr:last-child td { border-bottom: none; }

        .id-dot {
          display: inline-block; width: 6px; height: 6px;
          border-radius: 50%; margin-left: 6px; vertical-align: middle; flex-shrink: 0;
        }
        .tech-tag {
          display: inline-block; font-family: 'DM Mono', monospace; font-size: 0.62rem;
          padding: 2px 7px; background: rgba(0,217,255,0.05);
          border: 1px solid rgba(0,217,255,0.15); color: #64748b;
        }

        .act-btn {
          display: inline-flex; align-items: center; padding: 5px 12px;
          font-family: 'DM Mono', monospace; font-size: 0.65rem;
          letter-spacing: 0.08em; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s; border: 1px solid; background: transparent;
        }
        .act-btn-ghost { border-color: rgba(100,116,139,0.3); color: #64748b; }
        .act-btn-ghost:hover { border-color: #94a3b8; color: #e2e8f0; }
        .act-btn-danger { border-color: rgba(239,68,68,0.35); color: #ef4444; }
        .act-btn-danger:hover { background: rgba(239,68,68,0.08); }
        .act-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .empty-row td {
          text-align: center; padding: 32px 16px;
          font-family: 'DM Mono', monospace; font-size: 0.7rem;
          color: #374151; letter-spacing: 0.08em;
        }
      `}</style>

      <PageHeader
        title="Projects"
        sub={`${total} total · ${featured.length} featured`}
        actions={
          <Btn href="/admin/projects/new" variant="primary">
            <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Project
          </Btn>
        }
      />

      {loading ? (
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: '#475569', padding: '40px 0' }}>
          Loading...
        </div>
      ) : (
        SECTIONS.map(({ key, label, color }) => {
          const rows = (sectionRows[key] as Project[]).sort((a, b) => a.order - b.order);
          return (
            <div key={key} style={{ marginBottom: 36 }}>

              {/* Section divider */}
              <div className="proj-section-divider">
                <span className="proj-section-label" style={{ color }}>
                  {key === 'featured' ? '⭐ ' : '📁 '}{label}
                </span>
                <div className="proj-divider-line" style={{ background: `${color}22` }} />
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: '#374151', letterSpacing: '0.08em' }}>
                  {rows.length} project{rows.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Table */}
              <Panel style={{ overflow: 'hidden' }}>
                <table className="proj-table">
                  <thead>
                    <tr>
                      <th style={{ width: 36 }}>#</th>
                      <th>Project</th>
                      <th>Category</th>
                      <th>Tech Stack</th>
                      <th>Links</th>
                      <th className="right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr className="empty-row">
                        <td colSpan={6}>
                          No {label.toLowerCase()} yet.{' '}
                          <span
                            onClick={() => router.push('/admin/projects/new')}
                            style={{ color, cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            Add one
                          </span>
                        </td>
                      </tr>
                    ) : rows.map(proj => {
                      const hasID = !!(proj.description_id || proj.shortDescription_id);
                      return (
                        <tr key={proj._id}>

                          {/* Order */}
                          <td>
                            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', color: '#374151' }}>
                              {proj.order}
                            </span>
                          </td>

                          {/* Title + slug + ID dot */}
                          <td style={{ maxWidth: 260 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                              <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.875rem', color: '#e2e8f0', fontWeight: 500 }}>
                                {proj.title}
                              </span>
                              <span
                                className="id-dot"
                                title={hasID ? 'Indonesian translation filled' : 'Indonesian translation missing'}
                                style={{ background: hasID ? '#10b981' : '#374151' }}
                              />
                            </div>
                            {proj.shortDescription && (
                              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.66rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>
                                {proj.shortDescription}
                              </div>
                            )}
                            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.62rem', color: '#374151', marginTop: 2 }}>
                              /{proj.slug}
                            </div>
                          </td>

                          {/* Category */}
                          <td>
                            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', padding: '2px 8px', border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa', background: 'rgba(167,139,250,0.06)', display: 'inline-block' }}>
                              {getCategoryName(proj.categoryId)}
                            </span>
                          </td>

                          {/* Tech Stack */}
                          <td style={{ maxWidth: 200 }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                              {(proj.techStack || []).slice(0, 3).map(t => (
                                <span key={t} className="tech-tag">{t}</span>
                              ))}
                              {(proj.techStack || []).length > 3 && (
                                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.62rem', color: '#374151' }}>
                                  +{proj.techStack.length - 3}
                                </span>
                              )}
                              {(proj.techStack || []).length === 0 && (
                                <span style={{ color: '#374151', fontSize: '0.75rem' }}>—</span>
                              )}
                            </div>
                          </td>

                          {/* Links */}
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              {proj.githubUrl && (
                                <a href={proj.githubUrl} target="_blank" rel="noreferrer"
                                  style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: '#475569', textDecoration: 'none' }}
                                  onMouseOver={e => (e.currentTarget.style.color = '#00d9ff')}
                                  onMouseOut={e  => (e.currentTarget.style.color = '#475569')}
                                >
                                  GitHub ↗
                                </a>
                              )}
                              {proj.demoUrl && (
                                <a href={proj.demoUrl} target="_blank" rel="noreferrer"
                                  style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: '#475569', textDecoration: 'none' }}
                                  onMouseOver={e => (e.currentTarget.style.color = '#a78bfa')}
                                  onMouseOut={e  => (e.currentTarget.style.color = '#475569')}
                                >
                                  Demo ↗
                                </a>
                              )}
                              {!proj.githubUrl && !proj.demoUrl && (
                                <span style={{ color: '#374151', fontSize: '0.75rem' }}>—</span>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                              <button
                                className="act-btn act-btn-ghost"
                                onClick={() => router.push(`/admin/projects/${proj._id}`)}
                              >
                                Edit
                              </button>
                              <button
                                className="act-btn act-btn-danger"
                                onClick={() => handleDelete(proj._id, proj.title)}
                                disabled={deleting === proj._id}
                              >
                                {deleting === proj._id ? '...' : 'Del'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Panel>
            </div>
          );
        })
      )}
    </>
  );
}