'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/* ─── Types ─── */
interface Stats {
  total_projects: number; featured_projects: number;
  total_messages: number; unread_messages: number;
  total_skills: number;   total_experiences: number;
}
interface RecentMessage {
  _id: string; senderName: string; subject?: string;
  message: string; isRead: boolean; createdAt: string;
}
interface RecentProject {
  _id: string; title: string; slug: string;
  imagePath?: string; isFeatured: boolean;
  categoryId?: { name: string };
}

const EMPTY_STATS: Stats = {
  total_projects:0, featured_projects:0,
  total_messages:0, unread_messages:0,
  total_skills:0,   total_experiences:0,
};

/* ─── Safe fetch — tidak crash kalau API belum ada ─── */
async function safeFetch(url: string) {
  try {
    const res = await fetch(url);
    const contentType = res.headers.get('content-type') ?? '';
    // Kalau server balik HTML (404/500 page), jangan parse JSON
    if (!contentType.includes('application/json')) {
      console.warn(`[dashboard] ${url} returned non-JSON (${res.status})`);
      return null;
    }
    return await res.json();
  } catch (e) {
    console.warn(`[dashboard] fetch ${url} failed:`, e);
    return null;
  }
}

function getStatCards(s: Stats) {
  return [
    { label:'Total Projects',  value:s.total_projects,    sub:`${s.featured_projects} featured`, color:'#00d9ff', href:'/admin/projects',   icon:'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { label:'Messages',        value:s.total_messages,    sub:`${s.unread_messages} unread`,     color:s.unread_messages>0?'#f59e0b':'#10b981', href:'/admin/messages', icon:'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    { label:'Skills',          value:s.total_skills,      sub:'Configured skills',               color:'#7c3aed', href:'/admin/skills',     icon:'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z' },
    { label:'Experiences',     value:s.total_experiences, sub:'Career entries',                  color:'#10b981', href:'/admin/experiences', icon:'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  ];
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });
}
function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h` : `${Math.floor(h/24)}d`;
}

export default function DashboardPage() {
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [msgs,    setMsgs]    = useState<RecentMessage[]>([]);
  const [projs,   setProjs]   = useState<RecentProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Fetch semua secara paralel, masing-masing aman bila gagal
      const [sJ, mJ, pJ] = await Promise.all([
        safeFetch('/api/admin/stats'),
        safeFetch('/api/messages?limit=5'),
        safeFetch('/api/projects?limit=5'),
      ]);

      // Tiap API return { success: true, data: ... }
      setStats(sJ?.data ?? EMPTY_STATS);
      setMsgs(mJ?.data  ?? []);
      setProjs(pJ?.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <>
      <style>{`
        .db-hdr{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:28px}
        .db-title{font-family:'Syne',sans-serif;font-size:1.5rem;font-weight:700;color:#f1f5f9;margin:0}
        .db-sub{font-family:'DM Mono',monospace;font-size:.7rem;color:#475569;margin-top:4px;letter-spacing:.04em}
        .db-online{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(16,185,129,.3);background:rgba(16,185,129,.06);padding:5px 10px;font-family:'DM Mono',monospace;font-size:.65rem;letter-spacing:.12em;color:#10b981;margin-top:4px;white-space:nowrap}
        .db-pulse{width:6px;height:6px;background:#10b981;border-radius:50%;flex-shrink:0;animation:dbP 2s ease-in-out infinite}
        @keyframes dbP{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.85)}}

        .db-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-bottom:28px}
        @media(min-width:900px){.db-grid{grid-template-columns:repeat(4,1fr)}}

        .db-sc{background:#151b3b;border:1px solid rgba(0,217,255,.08);padding:18px;position:relative;overflow:hidden;text-decoration:none;display:block;transition:border-color .25s,transform .25s}
        .db-sc::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--c,#00d9ff),transparent);opacity:.35}
        .db-sc:hover{border-color:rgba(0,217,255,.25);transform:translateY(-2px)}
        .db-sc-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px}
        .db-sc-ico{width:34px;height:34px;display:flex;align-items:center;justify-content:center}
        .db-sc-arr{color:#1e2749;transition:color .2s}.db-sc:hover .db-sc-arr{color:#64748b}
        .db-sc-val{font-family:'Syne',sans-serif;font-size:2rem;font-weight:700;line-height:1;margin-bottom:4px}
        .db-sc-lbl{font-family:'DM Mono',monospace;font-size:.65rem;text-transform:uppercase;letter-spacing:.12em;color:#64748b}
        .db-sc-sub{font-family:'DM Mono',monospace;font-size:.65rem;color:#334155;margin-top:4px}

        .db-sk{background:linear-gradient(90deg,#151b3b 25%,#1a2040 50%,#151b3b 75%);background-size:200% 100%;animation:dbSk 1.4s ease infinite;border-radius:2px;display:block}
        @keyframes dbSk{0%{background-position:200% 0}100%{background-position:-200% 0}}

        .db-panel{background:#151b3b;border:1px solid rgba(0,217,255,.08)}
        .db-qa{padding:18px;margin-bottom:28px}
        .db-qa-t{font-family:'DM Mono',monospace;font-size:.68rem;text-transform:uppercase;letter-spacing:.15em;color:#475569;margin-bottom:14px}
        .db-qa-b{display:flex;flex-wrap:wrap;gap:10px}

        .db-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 16px;font-family:'DM Mono',monospace;font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;text-decoration:none;transition:all .2s;cursor:pointer;white-space:nowrap}
        .db-bp{background:linear-gradient(135deg,rgba(0,217,255,.12),rgba(124,58,237,.08));border:1px solid #00d9ff;color:#00d9ff}
        .db-bp:hover{background:#00d9ff;color:#0a0e27;box-shadow:0 0 18px rgba(0,217,255,.3)}
        .db-bg{border:1px solid rgba(100,116,139,.3);color:#64748b;background:transparent}
        .db-bg:hover{border-color:#94a3b8;color:#e2e8f0}
        .db-ib{background:#ef4444;color:#fff;font-family:'DM Mono',monospace;font-size:.62rem;border-radius:50%;width:15px;height:15px;display:inline-flex;align-items:center;justify-content:center;margin-left:2px}

        .db-bot{display:grid;grid-template-columns:1fr;gap:20px}
        @media(min-width:900px){.db-bot{grid-template-columns:1fr 1fr}}

        .db-ph{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid rgba(0,217,255,.07)}
        .db-ph-t{font-family:'DM Mono',monospace;font-size:.68rem;text-transform:uppercase;letter-spacing:.15em;color:#64748b}
        .db-ph-l{font-family:'DM Mono',monospace;font-size:.68rem;color:#00d9ff;text-decoration:none;transition:opacity .2s}
        .db-ph-l:hover{opacity:.7}

        .db-mr{display:flex;align-items:flex-start;gap:12px;padding:12px 18px;text-decoration:none;transition:background .15s;border-bottom:1px solid rgba(255,255,255,.025)}
        .db-mr:last-child{border-bottom:none}.db-mr:hover{background:rgba(0,217,255,.025)}
        .db-mav{width:28px;height:28px;border:1px solid #1e2749;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px}
        .db-mav-u{border-color:rgba(0,217,255,.3)}
        .db-mc{flex:1;min-width:0}
        .db-mnr{display:flex;align-items:center;gap:7px;margin-bottom:2px}
        .db-mn{font-family:'Outfit',sans-serif;font-size:.85rem;color:#cbd5e1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .db-mn-u{color:#f1f5f9;font-weight:500}
        .db-mdot{width:6px;height:6px;background:#00d9ff;border-radius:50%;flex-shrink:0}
        .db-ms{font-family:'Outfit',sans-serif;font-size:.75rem;color:#475569;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:0}
        .db-mt{font-family:'DM Mono',monospace;font-size:.65rem;color:#2d3748;flex-shrink:0;margin-top:2px}

        .db-pr{display:flex;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid rgba(255,255,255,.025)}
        .db-pr:last-child{border-bottom:none}
        .db-pt{width:38px;height:38px;background:#1e2749;border:1px solid rgba(0,217,255,.08);overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center}
        .db-pi{flex:1;min-width:0}
        .db-ptit{font-family:'Outfit',sans-serif;font-size:.85rem;color:#e2e8f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .db-pm{display:flex;align-items:center;gap:8px;margin-top:3px}
        .db-pc{font-family:'DM Mono',monospace;font-size:.65rem;color:#475569}
        .db-pf{font-family:'DM Mono',monospace;font-size:.6rem;border:1px solid rgba(0,217,255,.3);color:#00d9ff;background:rgba(0,217,255,.05);padding:1px 5px}
        .db-pa{display:flex;gap:8px;align-items:center;flex-shrink:0}
        .db-pact{color:#2d3748;transition:color .2s;display:flex;text-decoration:none}
        .db-pact:hover{color:#00d9ff}

        .db-empty{padding:28px 18px;text-align:center;font-family:'DM Mono',monospace;font-size:.72rem;color:#2d3748}

        /* API error notice */
        .db-api-warn{font-family:'DM Mono',monospace;font-size:.65rem;color:#f59e0b;background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.2);padding:8px 12px;margin-bottom:20px;display:flex;align-items:center;gap:8px}
      `}</style>

      {/* HEADER */}
      <div className="db-hdr">
        <div>
          <h1 className="db-title">Dashboard</h1>
          <p className="db-sub">{formatDate()} · System operational</p>
        </div>
        <span className="db-online"><span className="db-pulse" />All systems online</span>
      </div>

      {/* Stats warning kalau API belum dibuat */}
      {!loading && stats && Object.values(stats).every(v => v === 0) && (
        <div className="db-api-warn">
          ⚠ Stats menampilkan 0 — pastikan <code>/api/admin/stats</code>, <code>/api/messages</code>, dan <code>/api/projects</code> sudah ada.
        </div>
      )}

      {/* STAT CARDS */}
      <div className="db-grid">
        {loading || !stats
          ? Array.from({length:4}).map((_,i) => (
              <div key={i} className="db-sc" style={{pointerEvents:'none'}}>
                <span className="db-sk" style={{width:34,height:34,marginBottom:14}}/>
                <span className="db-sk" style={{width:56,height:30,marginBottom:6}}/>
                <span className="db-sk" style={{width:90,height:9,marginBottom:5}}/>
                <span className="db-sk" style={{width:70,height:9}}/>
              </div>
            ))
          : getStatCards(stats).map(c => (
              <Link key={c.label} href={c.href} className="db-sc" style={{'--c':c.color} as React.CSSProperties}>
                <div className="db-sc-top">
                  <div className="db-sc-ico" style={{border:`1px solid ${c.color}25`,background:`${c.color}08`}}>
                    <svg style={{width:15,height:15,color:c.color}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={c.icon}/>
                    </svg>
                  </div>
                  <svg className="db-sc-arr" style={{width:12,height:12,marginTop:2}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
                <div className="db-sc-val" style={{color:c.color}}>{c.value}</div>
                <div className="db-sc-lbl">{c.label}</div>
                <div className="db-sc-sub">{c.sub}</div>
              </Link>
            ))
        }
      </div>

      {/* QUICK ACTIONS */}
      <div className="db-panel db-qa">
        <div className="db-qa-t">Quick Actions</div>
        <div className="db-qa-b">
          {[
            {href:'/admin/projects/new',    label:'New Project',    cls:'db-bp'},
            {href:'/admin/experiences/new', label:'New Experience', cls:'db-bg'},
            {href:'/admin/skills/new',      label:'New Skill',      cls:'db-bg'},
          ].map(b => (
            <Link key={b.href} href={b.href} className={`db-btn ${b.cls}`}>
              <svg style={{width:12,height:12}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              {b.label}
            </Link>
          ))}
          <Link href="/admin/messages" className="db-btn db-bg">
            <svg style={{width:12,height:12}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
            </svg>
            View Inbox
            {stats && stats.unread_messages > 0 && (
              <span className="db-ib">{stats.unread_messages}</span>
            )}
          </Link>
          <Link href="/" target="_blank" className="db-btn db-bg">
            <svg style={{width:12,height:12}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
            View Site
          </Link>
        </div>
      </div>

      {/* BOTTOM GRID */}
      <div className="db-bot">

        {/* Recent Messages */}
        <div className="db-panel">
          <div className="db-ph">
            <span className="db-ph-t">Recent Messages</span>
            <Link href="/admin/messages" className="db-ph-l">View all →</Link>
          </div>
          {loading
            ? Array.from({length:4}).map((_,i) => (
                <div key={i} className="db-mr" style={{gap:12}}>
                  <span className="db-sk" style={{width:28,height:28,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <span className="db-sk" style={{width:'55%',height:11,marginBottom:7}}/>
                    <span className="db-sk" style={{width:'80%',height:9}}/>
                  </div>
                </div>
              ))
            : msgs.length === 0
              ? <div className="db-empty">No messages yet.</div>
              : msgs.map(m => (
                  <Link key={m._id} href={`/admin/messages/${m._id}`} className="db-mr">
                    <div className={`db-mav${!m.isRead?' db-mav-u':''}`}>
                      <span style={{fontFamily:'DM Mono,monospace',fontSize:'.72rem',color:m.isRead?'#475569':'#00d9ff'}}>
                        {m.senderName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="db-mc">
                      <div className="db-mnr">
                        <span className={`db-mn${!m.isRead?' db-mn-u':''}`}>{m.senderName}</span>
                        {!m.isRead && <span className="db-mdot"/>}
                      </div>
                      <p className="db-ms">{m.subject || m.message.slice(0,50)}</p>
                    </div>
                    <span className="db-mt">{timeAgo(m.createdAt)}</span>
                  </Link>
                ))
          }
        </div>

        {/* Recent Projects */}
        <div className="db-panel">
          <div className="db-ph">
            <span className="db-ph-t">Recent Projects</span>
            <Link href="/admin/projects" className="db-ph-l">View all →</Link>
          </div>
          {loading
            ? Array.from({length:4}).map((_,i) => (
                <div key={i} className="db-pr">
                  <span className="db-sk" style={{width:38,height:38,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <span className="db-sk" style={{width:'65%',height:11,marginBottom:7}}/>
                    <span className="db-sk" style={{width:'40%',height:9}}/>
                  </div>
                </div>
              ))
            : projs.length === 0
              ? <div className="db-empty">No projects yet.</div>
              : projs.map(p => (
                  <div key={p._id} className="db-pr">
                    <div className="db-pt">
                      {p.imagePath
                        ? <img src={p.imagePath} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                        : <span style={{fontFamily:'DM Mono,monospace',fontSize:'.6rem',color:'#2d3748'}}>{'{ }'}</span>
                      }
                    </div>
                    <div className="db-pi">
                      <div className="db-ptit">{p.title}</div>
                      <div className="db-pm">
                        {p.categoryId && (
                          <span className="db-pc">{(p.categoryId as {name:string}).name}</span>
                        )}
                        {p.isFeatured && <span className="db-pf">★ featured</span>}
                      </div>
                    </div>
                    <div className="db-pa">
                      <Link href={`/admin/projects/${p._id}/edit`} className="db-pact">
                        <svg style={{width:13,height:13}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </Link>
                      <Link href={`/projects/${p.slug}`} target="_blank" className="db-pact"
                        style={{color:'#2d3748'}}
                        onMouseOver={e=>(e.currentTarget.style.color='#94a3b8')}
                        onMouseOut={e=>(e.currentTarget.style.color='#2d3748')}>
                        <svg style={{width:13,height:13}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))
          }
        </div>

      </div>
    </>
  );
}