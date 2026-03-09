'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, Panel, Btn } from '@/components/AdminLayout';

interface Experience {
  _id:            string;
  type:           'work' | 'education';
  title:          string;
  company:        string;
  location?:      string;
  startDate:      string;
  endDate?:       string | null;
  description_en: string;
  achievements_en: string[];
  order:          number;
}

function fmtDate(d?: string | null): { text: string; isPresent: boolean } {
  if (!d) return { text: 'Present', isPresent: true };
  const date = new Date(d);
  return {
    text: date.toLocaleDateString('en', { month: 'short', year: 'numeric' }),
    isPresent: false,
  };
}

const SECTIONS = [
  { type: 'work',      label: 'Work Experience', color: '#00d9ff',  bg: 'rgba(0,217,255,0.15)' },
  { type: 'education', label: 'Education',        color: '#a78bfa',  bg: 'rgba(167,139,250,0.15)' },
] as const;

export default function ExperiencesPage() {
  const router = useRouter();
  const [items,    setItems]    = useState<Experience[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const res  = await fetch('/api/experiences');
      const data = await res.json();
      setItems(data.data || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this entry?')) return;
    setDeleting(id);
    await fetch(`/api/experiences/${id}`, { method: 'DELETE' });
    setItems(prev => prev.filter(i => i._id !== id));
    setDeleting(null);
  }

  const total = items.length;

  return (
    <>
      <style>{`
        .exp-section-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .exp-section-label {
          font-family: 'DM Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .exp-divider-line {
          flex: 1;
          height: 1px;
        }
        .exp-table { width: 100%; border-collapse: collapse; }
        .exp-table th {
          font-family: 'DM Mono', monospace;
          font-size: 0.62rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #475569;
          padding: 10px 16px;
          border-bottom: 1px solid rgba(0,217,255,0.08);
          background: #06091a;
          white-space: nowrap;
          text-align: left;
        }
        .exp-table th.right { text-align: right; }
        .exp-table td {
          padding: 13px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          vertical-align: middle;
        }
        .exp-table tbody tr { transition: background 0.15s; }
        .exp-table tbody tr:hover td { background: rgba(0,217,255,0.025); }
        .exp-table tbody tr:last-child td { border-bottom: none; }

        .en-dot {
          display: inline-block;
          width: 6px; height: 6px;
          border-radius: 50%;
          margin-left: 6px;
          vertical-align: middle;
          flex-shrink: 0;
        }

        .act-btn {
          display: inline-flex;
          align-items: center;
          padding: 5px 12px;
          font-family: 'DM Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          border: 1px solid;
        }
        .act-btn-ghost {
          border-color: rgba(100,116,139,0.3);
          color: #64748b;
          background: transparent;
        }
        .act-btn-ghost:hover {
          border-color: #94a3b8;
          color: #e2e8f0;
        }
        .act-btn-danger {
          border-color: rgba(239,68,68,0.35);
          color: #ef4444;
          background: transparent;
        }
        .act-btn-danger:hover { background: rgba(239,68,68,0.08); }
        .act-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .empty-row td {
          text-align: center;
          padding: 32px 16px;
          font-family: 'DM Mono', monospace;
          font-size: 0.7rem;
          color: #374151;
          letter-spacing: 0.08em;
        }
      `}</style>

      <PageHeader
        title="Experiences"
        sub={`${total} total entr${total === 1 ? 'y' : 'ies'}`}
        actions={
          <Btn href="/admin/experiences/new" variant="primary">
            <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Experience
          </Btn>
        }
      />

      {loading ? (
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: '#475569', padding: '40px 0' }}>
          Loading...
        </div>
      ) : (
        SECTIONS.map(({ type, label, color, bg }) => {
          const rows = items.filter(i => i.type === type).sort((a, b) => a.order - b.order);
          return (
            <div key={type} style={{ marginBottom: 36 }}>
              {/* Section divider */}
              <div className="exp-section-divider">
                <span className="exp-section-label" style={{ color }}>
                  {label}
                </span>
                <div className="exp-divider-line" style={{ background: `${color}22` }} />
                <span style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '0.65rem',
                  color: '#374151', letterSpacing: '0.08em',
                }}>
                  {rows.length} entr{rows.length === 1 ? 'y' : 'ies'}
                </span>
              </div>

              {/* Table */}
              <Panel style={{ overflow: 'hidden' }}>
                <table className="exp-table">
                  <thead>
                    <tr>
                      <th style={{ width: 36 }}>#</th>
                      <th>Title</th>
                      <th>Company / Institution</th>
                      <th>Period</th>
                      <th>Location</th>
                      <th className="right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr className="empty-row">
                        <td colSpan={6}>
                          No {label.toLowerCase()} entries yet.{' '}
                          <span
                            onClick={() => router.push('/admin/experiences/new')}
                            style={{ color, cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            Add one
                          </span>
                        </td>
                      </tr>
                    ) : rows.map(exp => {
                      const end = fmtDate(exp.endDate);
                      const hasEN = !!(exp.description_en || (exp.achievements_en?.length > 0 && exp.achievements_en[0]));
                      return (
                        <tr key={exp._id}>
                          {/* Order */}
                          <td>
                            <span style={{
                              fontFamily: 'DM Mono, monospace',
                              fontSize: '0.7rem',
                              color: '#374151',
                            }}>
                              {exp.order}
                            </span>
                          </td>

                          {/* Title + EN indicator */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{
                                fontFamily: 'Outfit, sans-serif',
                                fontSize: '0.875rem',
                                color: '#e2e8f0',
                                fontWeight: 500,
                              }}>
                                {exp.title}
                              </span>
                              <span
                                className="en-dot"
                                title={hasEN ? 'EN content filled' : 'EN content missing'}
                                style={{ background: hasEN ? '#10b981' : '#374151' }}
                              />
                            </div>
                          </td>

                          {/* Company */}
                          <td style={{
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: '0.85rem',
                            color: '#64748b',
                          }}>
                            {exp.company}
                          </td>

                          {/* Period */}
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <span style={{
                              fontFamily: 'DM Mono, monospace',
                              fontSize: '0.72rem',
                              color: '#475569',
                            }}>
                              {fmtDate(exp.startDate).text}
                              {' — '}
                            </span>
                            {end.isPresent ? (
                              <span style={{
                                fontFamily: 'DM Mono, monospace',
                                fontSize: '0.72rem',
                                color: '#10b981',
                              }}>
                                Present
                              </span>
                            ) : (
                              <span style={{
                                fontFamily: 'DM Mono, monospace',
                                fontSize: '0.72rem',
                                color: '#475569',
                              }}>
                                {end.text}
                              </span>
                            )}
                          </td>

                          {/* Location */}
                          <td style={{
                            fontFamily: 'DM Mono, monospace',
                            fontSize: '0.7rem',
                            color: '#374151',
                          }}>
                            {exp.location || '—'}
                          </td>

                          {/* Actions */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                              <button
                                className="act-btn act-btn-ghost"
                                onClick={() => router.push(`/admin/experiences/${exp._id}`)}
                              >
                                Edit
                              </button>
                              <button
                                className="act-btn act-btn-danger"
                                onClick={() => handleDelete(exp._id)}
                                disabled={deleting === exp._id}
                              >
                                {deleting === exp._id ? '...' : 'Del'}
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