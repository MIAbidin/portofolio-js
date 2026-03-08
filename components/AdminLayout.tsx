'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

/* ─── Nav items ─── */
const NAV_ITEMS = [
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z',
    matchPrefix: '/admin/dashboard',
  },
  {
    href: '/admin/projects',
    label: 'Projects',
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    matchPrefix: '/admin/projects',
  },
  {
    href: '/admin/experiences',
    label: 'Experiences',
    icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    matchPrefix: '/admin/experiences',
  },
  {
    href: '/admin/skills',
    label: 'Skills',
    icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
    matchPrefix: '/admin/skills',
  },
  {
    href: '/admin/messages',
    label: 'Messages',
    icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
    matchPrefix: '/admin/messages',
  },
  {
    href: '/admin/settings',
    label: 'Settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    matchPrefix: '/admin/settings',
  },
];

interface AdminLayoutProps {
  children: ReactNode;
  /** Brand from settings – defaults to MIA.Dev */
  brandInitials?: string;
  brandSuffix?: string;
  /** Unread messages count */
  unreadMessages?: number;
  /** Flash messages */
  flashSuccess?: string;
  flashError?: string;
}

export default function AdminLayout({
  children,
  brandInitials = 'MIA',
  brandSuffix = '.Dev',
  unreadMessages = 0,
  flashSuccess,
  flashError,
}: AdminLayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [successVisible, setSuccessVisible] = useState(true);
  const [errorVisible, setErrorVisible] = useState(true);

  const isActive = (prefix: string) => pathname.startsWith(prefix);

  return (
    <>
      <style>{`
        * { font-family: 'Outfit', sans-serif; box-sizing: border-box; }

        body {
          background-color: #0a0e27;
          color: #e2e8f0;
          overflow-x: hidden;
          margin: 0;
        }

        .admin-layout {
          background-color: #0a0e27;
          background-image:
            linear-gradient(rgba(0,217,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,217,255,0.025) 1px, transparent 1px);
          background-size: 32px 32px;
          min-height: 100vh;
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #06091a; }
        ::-webkit-scrollbar-thumb { background: #00d9ff44; border-radius: 2px; }

        /* ── SIDEBAR ── */
        .sidebar {
          position: fixed;
          top: 0; left: 0; height: 100%;
          background: #06091a;
          border-right: 1px solid rgba(0,217,255,0.08);
          display: flex;
          flex-direction: column;
          z-index: 40;
          overflow: hidden;
          transition: width 0.3s ease;
          flex-shrink: 0;
        }
        .sidebar.open { width: 224px; }
        .sidebar.collapsed { width: 56px; }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 16px;
          border-bottom: 1px solid rgba(0,217,255,0.08);
          flex-shrink: 0;
        }

        .sidebar-toggle {
          position: absolute;
          top: 20px;
          right: -12px;
          width: 24px; height: 24px;
          background: #111633;
          border: 1px solid rgba(0,217,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          transition: color 0.2s;
          z-index: 50;
        }
        .sidebar-toggle:hover { color: #00d9ff; }

        /* ── NAV ITEMS ── */
        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 14px;
          font-family: 'DM Mono', monospace;
          font-size: 0.72rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #64748b;
          transition: all 0.2s;
          border-left: 2px solid transparent;
          cursor: pointer;
          white-space: nowrap;
          overflow: hidden;
          text-decoration: none;
        }
        .nav-item:hover {
          color: #e2e8f0;
          background: rgba(0,217,255,0.04);
          border-left-color: rgba(0,217,255,0.3);
        }
        .nav-item.active {
          color: #00d9ff;
          background: rgba(0,217,255,0.08);
          border-left-color: #00d9ff;
        }

        .nav-label { overflow: hidden; transition: opacity 0.2s; }
        .sidebar.collapsed .nav-label { opacity: 0; width: 0; }
        .sidebar.open .nav-label { opacity: 1; }

        .sidebar-section {
          padding: 0 16px;
          margin-bottom: 8px;
        }
        .sidebar.collapsed .sidebar-section { opacity: 0; }

        /* ── BADGE ── */
        .unread-badge {
          margin-left: auto;
          background: #ef4444;
          color: #fff;
          font-family: 'DM Mono', monospace;
          font-size: 0.7rem;
          border-radius: 50%;
          width: 16px; height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .sidebar.collapsed .unread-badge { display: none; }

        /* ── USER SECTION ── */
        .sidebar-user {
          border-top: 1px solid rgba(0,217,255,0.08);
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .user-avatar {
          width: 28px; height: 28px;
          background: rgba(0,217,255,0.1);
          border: 1px solid rgba(0,217,255,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .user-info { overflow: hidden; flex: 1; min-width: 0; }
        .sidebar.collapsed .user-info { opacity: 0; width: 0; overflow: hidden; }
        .sidebar.open .user-info { opacity: 1; transition: opacity 0.2s 0.1s; }

        /* ── MAIN AREA ── */
        .main-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          transition: margin-left 0.3s ease;
        }
        .main-area.sidebar-open { margin-left: 224px; }
        .main-area.sidebar-collapsed { margin-left: 56px; }

        /* ── MOBILE HEADER ── */
        .mobile-header {
          display: none;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #06091a;
          border-bottom: 1px solid rgba(0,217,255,0.08);
          position: sticky;
          top: 0;
          z-index: 30;
        }

        /* ── FORMS ── */
        .form-input {
          width: 100%;
          background: #111633;
          border: 1px solid #1e2749;
          color: #e2e8f0;
          font-family: 'Outfit', sans-serif;
          font-size: 0.875rem;
          padding: 10px 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input:focus { border-color: rgba(0,217,255,0.5); }
        .form-input.error { border-color: rgba(239,68,68,0.6); }

        .form-label {
          display: block;
          font-family: 'DM Mono', monospace;
          font-size: 0.68rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 7px;
        }

        /* ── STAT CARDS ── */
        .stat-card {
          background: #151b3b;
          border: 1px solid rgba(0,217,255,0.08);
          padding: 20px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.3s, transform 0.3s;
        }
        .stat-card:hover { border-color: rgba(0,217,255,0.25); transform: translateY(-2px); }
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,217,255,0.25), transparent);
        }

        /* ── DATA TABLE ── */
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th {
          font-family: 'DM Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #475569;
          padding: 10px 16px;
          border-bottom: 1px solid rgba(0,217,255,0.08);
          background: #06091a;
          white-space: nowrap;
          text-align: left;
        }
        .data-table td {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          font-size: 0.85rem;
          vertical-align: middle;
        }
        .data-table tr:hover td { background: rgba(0,217,255,0.025); }

        /* ── BADGES ── */
        .badge { display: inline-block; font-family: 'DM Mono', monospace; font-size: 0.65rem; padding: 2px 8px; }
        .badge-cyan   { border: 1px solid rgba(0,217,255,0.3);   color: #00d9ff; background: rgba(0,217,255,0.05); }
        .badge-purple { border: 1px solid rgba(124,58,237,0.3);  color: #7c3aed; background: rgba(124,58,237,0.05); }
        .badge-green  { border: 1px solid rgba(16,185,129,0.3);  color: #10b981; background: rgba(16,185,129,0.05); }
        .badge-red    { border: 1px solid rgba(239,68,68,0.3);   color: #ef4444; background: rgba(239,68,68,0.05); }
        .badge-gray   { border: 1px solid rgba(100,116,139,0.3); color: #64748b; background: rgba(100,116,139,0.05); }

        /* ── BUTTONS ── */
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 18px;
          font-family: 'DM Mono', monospace;
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          transition: all 0.2s;
          cursor: pointer;
          border: none;
          text-decoration: none;
        }
        .btn-primary {
          background: linear-gradient(135deg, rgba(0,217,255,0.15), rgba(124,58,237,0.1));
          border: 1px solid #00d9ff;
          color: #00d9ff;
        }
        .btn-primary:hover {
          background: #00d9ff;
          color: #0a0e27;
          box-shadow: 0 0 20px rgba(0,217,255,0.35);
        }
        .btn-danger { border: 1px solid rgba(239,68,68,0.4); color: #ef4444; background: transparent; }
        .btn-danger:hover { background: rgba(239,68,68,0.1); }
        .btn-ghost { border: 1px solid rgba(100,116,139,0.3); color: #64748b; background: transparent; }
        .btn-ghost:hover { border-color: #94a3b8; color: #e2e8f0; }

        /* ── ALERTS ── */
        .alert { padding: 12px 16px; border-left: 3px solid; font-size: 0.85rem; display: flex; align-items: center; gap: 12px; }
        .alert-success { border-color: #10b981; background: rgba(16,185,129,0.06); color: #34d399; }
        .alert-error   { border-color: #ef4444; background: rgba(239,68,68,0.06); color: #f87171; }

        /* ── PANEL ── */
        .panel { background: #151b3b; border: 1px solid rgba(0,217,255,0.08); }

        /* ── PAGE HEADER ── */
        .page-header { margin-bottom: 28px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .page-title  { font-family: 'Syne', sans-serif; font-size: 1.5rem; font-weight: 700; color: #f1f5f9; }
        .page-sub    { font-family: 'DM Mono', monospace; font-size: 0.7rem; color: #475569; margin-top: 2px; letter-spacing: 0.05em; }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          .sidebar { display: none; }
          .mobile-header { display: flex; }
          .main-area.sidebar-open,
          .main-area.sidebar-collapsed { margin-left: 0; }
        }

        /* ── MOBILE DRAWER ── */
        .mobile-drawer-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          z-index: 50;
        }
        .mobile-drawer {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 224px;
          background: #06091a;
          border-right: 1px solid rgba(0,217,255,0.1);
          padding: 16px 0;
        }
      `}</style>

      <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh' }}>

        {/* ── SIDEBAR (desktop) ── */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>

          {/* Logo */}
          <div className="sidebar-logo">
            <div style={{ width: 28, height: 28, border: '1px solid #00d9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ width: 12, height: 12, background: '#00d9ff' }} />
            </div>
            {sidebarOpen && (
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#fff', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  {brandInitials}<span style={{ color: '#00d9ff' }}>{brandSuffix}</span>
                </div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', color: '#475569' }}>Admin Panel</div>
              </div>
            )}
          </div>

          {/* Toggle button */}
          <button onClick={() => setSidebarOpen(v => !v)} className="sidebar-toggle" aria-label="Toggle sidebar">
            <svg style={{ width: 12, height: 12, transform: sidebarOpen ? 'none' : 'rotate(180deg)', transition: 'transform 0.3s' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto', overflowX: 'hidden' }}>
            <div className="sidebar-section">
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                Main
              </span>
            </div>

            {NAV_ITEMS.map(item => {
              const active = isActive(item.matchPrefix);
              return (
                <Link key={item.href} href={item.href} className={`nav-item${active ? ' active' : ''}`} title={!sidebarOpen ? item.label : ''}>
                  <svg style={{ width: 16, height: 16, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                  <span className="nav-label">{item.label}</span>
                  {item.label === 'Messages' && unreadMessages > 0 && sidebarOpen && (
                    <span className="unread-badge">{unreadMessages > 9 ? '9+' : unreadMessages}</span>
                  )}
                </Link>
              );
            })}

            <div style={{ margin: '16px', borderTop: '1px solid rgba(0,217,255,0.08)' }} />

            <Link href="/" target="_blank" className="nav-item" title={!sidebarOpen ? 'View Site' : ''}>
              <svg style={{ width: 16, height: 16, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="nav-label">View Site</span>
            </Link>
          </nav>

          {/* User info */}
          <div className="sidebar-user">
            <div className="user-avatar">
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: '#00d9ff' }}>
                {(session?.user?.name ?? 'A').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="user-info">
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.875rem', color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {session?.user?.name ?? 'Admin'}
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', color: '#475569', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}
                onMouseOver={e => (e.currentTarget.style.color = '#f87171')}
                onMouseOut={e => (e.currentTarget.style.color = '#475569')}
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* ── MAIN AREA ── */}
        <div className={`main-area ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>

          {/* Mobile header */}
          <header className="mobile-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 24, height: 24, border: '1px solid #00d9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 12, height: 12, background: '#00d9ff' }} />
              </div>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#fff', fontSize: '0.875rem' }}>
                {brandInitials}<span style={{ color: '#00d9ff' }}>{brandSuffix}</span>
              </span>
            </div>
            <button onClick={() => setMobileOpen(v => !v)} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
              <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </header>

          {/* Mobile nav drawer */}
          {mobileOpen && (
            <div className="mobile-drawer-backdrop" onClick={() => setMobileOpen(false)}>
              <div className="mobile-drawer" onClick={e => e.stopPropagation()}>
                <div style={{ padding: '0 16px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, border: '1px solid #00d9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 12, height: 12, background: '#00d9ff' }} />
                  </div>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#fff', fontSize: '0.875rem' }}>
                    {brandInitials}<span style={{ color: '#00d9ff' }}>{brandSuffix}</span>
                  </span>
                  <button onClick={() => setMobileOpen(false)} style={{ marginLeft: 'auto', color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {NAV_ITEMS.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item${isActive(item.matchPrefix) ? ' active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                    </svg>
                    {item.label}
                    {item.label === 'Messages' && unreadMessages > 0 && (
                      <span className="unread-badge" style={{ display: 'flex' }}>{unreadMessages > 9 ? '9+' : unreadMessages}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Page content */}
          <main style={{ flex: 1, padding: '20px', maxWidth: 1280, width: '100%', margin: '0 auto' }}>

            {/* Flash success */}
            {flashSuccess && successVisible && (
              <div className="alert alert-success" style={{ marginBottom: 20 }}>
                <svg style={{ width: 16, height: 16, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {flashSuccess}
                <button onClick={() => setSuccessVisible(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.5, fontSize: '1.1rem' }}>×</button>
              </div>
            )}

            {/* Flash error */}
            {flashError && errorVisible && (
              <div className="alert alert-error" style={{ marginBottom: 20 }}>
                <svg style={{ width: 16, height: 16, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {flashError}
                <button onClick={() => setErrorVisible(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.5, fontSize: '1.1rem' }}>×</button>
              </div>
            )}

            {children}
          </main>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   Re-export helper components so pages can import them from here
───────────────────────────────────────────────────────────── */

/** Page header helper */
export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {sub && <p className="page-sub">{sub}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
    </div>
  );
}

/** Panel wrapper */
export function Panel({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return <div className="panel" style={style}>{children}</div>;
}

/** Stat card */
export function StatCard({ label, value, sub, accent = '#00d9ff' }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="stat-card">
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#475569', marginBottom: 12 }}>{label}</div>
      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.75rem', fontWeight: 700, color: accent }}>{value}</div>
      {sub && <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', color: '#475569', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

/** Badge */
export function Badge({ children, variant = 'cyan' }: { children: ReactNode; variant?: 'cyan' | 'purple' | 'green' | 'red' | 'gray' }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

/** Button */
export function Btn({ children, variant = 'primary', onClick, href, type = 'button', disabled }: {
  children: ReactNode;
  variant?: 'primary' | 'danger' | 'ghost';
  onClick?: () => void;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}) {
  const cls = `btn btn-${variant}`;
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button type={type} className={cls} onClick={onClick} disabled={disabled}>{children}</button>;
}