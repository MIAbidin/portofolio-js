'use client';

import { useState, useEffect, useRef } from 'react';

interface NavbarProps {
  isLight: boolean;
  toggleTheme: () => void;
  gameUnlocked: boolean;
}

export default function Navbar({ isLight, toggleTheme, gameUnlocked }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const logoClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = isLight;
  const cyber     = t ? '#0077aa' : '#00d9ff';
  const textSec   = t ? '#334155' : '#94a3b8';
  const borderSub = t ? 'rgba(0,140,180,0.12)' : 'rgba(0,217,255,0.1)';
  const borderMed = t ? 'rgba(0,140,180,0.25)' : 'rgba(0,217,255,0.2)';
  const bgSec     = t ? '#e4eaf8' : '#111633';
  const mobileBg  = t ? 'rgba(240,244,255,0.98)' : 'rgba(10,14,39,0.98)';

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close mobile nav on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const [brandInitials, setBrandInitials] = useState('MIA');
  const [brandSuffix, setBrandSuffix]     = useState('.Dev');

  useEffect(() => {
    setBrandInitials(localStorage.getItem('brand_initials') || 'MIA');
    setBrandSuffix(localStorage.getItem('brand_suffix')   || '.Dev');
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    const next = logoClicks + 1;
    setLogoClicks(next);
    if (logoClickTimerRef.current) clearTimeout(logoClickTimerRef.current);
    logoClickTimerRef.current = setTimeout(() => setLogoClicks(0), 600);
    if (next >= 5) {
      e.preventDefault();
      setLogoClicks(0);
      window.dispatchEvent(new CustomEvent('easter-egg', {
        detail: { msg: '🥚 Easter Egg: You clicked the logo 5 times!', color: '#7c3aed' }
      }));
    }
  };

  const navLinks: [string, string][] = [
    ['/', 'Home'],
    ['/#skills', 'Skills'],
    ['/#experience', 'Experience'],
    ['/portfolio', 'Portfolio'],
    ['/contact', 'Contact'],
  ];

  return (
    <>
      <style>{`
        .nav-link {
          position: relative;
          color: ${textSec};
          transition: color 0.3s;
          font-family: 'DM Mono', monospace;
          font-size: 0.8rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          text-decoration: none;
          white-space: nowrap;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px; left: 0; right: 0;
          height: 1px;
          background: ${cyber};
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s;
        }
        .nav-link:hover, .nav-link.active { color: ${cyber}; }
        .nav-link:hover::after, .nav-link.active::after { transform: scaleX(1); }

        /* Mobile nav-link bigger tap target */
        .mobile-nav-link {
          font-family: 'DM Mono', monospace;
          font-size: 0.85rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          text-decoration: none;
          color: ${textSec};
          padding: 10px 0;
          display: block;
          border-bottom: 1px solid ${borderSub};
          transition: color 0.2s;
        }
        .mobile-nav-link:last-child { border-bottom: none; }
        .mobile-nav-link:hover { color: ${cyber}; }

        .btn-cv {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 14px;
          background: linear-gradient(135deg, rgba(0,217,255,0.13), rgba(124,58,237,0.13));
          border: 1px solid ${cyber};
          color: ${cyber};
          font-family: 'DM Mono', monospace;
          font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase;
          transition: all 0.3s; cursor: pointer; text-decoration: none;
          white-space: nowrap;
        }
        .btn-cv:hover { background: ${cyber}; color: #0a0e27; box-shadow: 0 0 24px ${cyber}40; }

        @keyframes gameNavGlow {
          from { text-shadow: 0 0 6px ${cyber}; }
          to   { text-shadow: 0 0 20px #7c3aed, 0 0 40px ${cyber}; }
        }
        .game-glow { animation: gameNavGlow 2s ease-in-out infinite alternate; color: ${cyber} !important; }

        /* Mobile drawer slide */
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:none} }
        .mobile-drawer { animation: slideDown 0.2s ease-out; }
      `}</style>

      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}>
        <nav style={{
          transition: 'all 0.4s',
          background: scrolled ? (t ? 'rgba(240,244,255,0.95)' : 'rgba(10,14,39,0.95)') : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? `1px solid ${borderSub}` : 'none',
          padding: '0 clamp(16px, 4vw, 48px)',
          position: 'relative',
        }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, gap: 12 }}>

            {/* ── Logo ── */}
            <a href="/" onClick={handleLogoClick} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
              <div style={{ width: 30, height: 30, border: `1px solid ${cyber}`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: 14, height: 14, background: cyber }} />
                <div style={{ position: 'absolute', top: -1, left: -1,   width: 7, height: 7, borderTop:    `1px solid ${cyber}`, borderLeft:  `1px solid ${cyber}` }} />
                <div style={{ position: 'absolute', bottom: -1, right: -1, width: 7, height: 7, borderBottom: `1px solid ${cyber}`, borderRight: `1px solid ${cyber}` }} />
              </div>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: t ? '#0f172a' : '#fff', fontSize: 'clamp(15px, 3vw, 18px)', letterSpacing: '-0.02em' }}>
                {brandInitials}<span style={{ color: cyber }}>{brandSuffix}</span>
              </span>
            </a>

            {/* ── Desktop Nav (hidden < 1024px) ── */}
            <div style={{ display: 'none', alignItems: 'center', gap: 28 }} className="desk-nav">
              {navLinks.map(([href, label]) => (
                <a key={href} href={href} className="nav-link">{label}</a>
              ))}
              {gameUnlocked && (
                <a href="/game" className="nav-link game-glow" title="🏆 Unlocked!">🎮 Game</a>
              )}
            </div>

            {/* ── Right controls ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

              {/* Theme toggle */}
              <button onClick={toggleTheme} title={t ? 'Dark Mode' : 'Light Mode'}
                style={{ position: 'relative', width: 44, height: 24, borderRadius: 12, border: `1px solid ${borderMed}`, background: bgSec, cursor: 'pointer', flexShrink: 0 }}>
                <div style={{
                  position: 'absolute', top: 3, left: t ? 23 : 3,
                  width: 16, height: 16, borderRadius: '50%',
                  background: t ? '#f59e0b' : cyber,
                  transition: 'left 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 8 }}>{t ? '☀️' : '🌙'}</span>
                </div>
              </button>

              {/* CV button (hidden on very small screens, shown ≥ 480px) */}
              <a href="/cv/preview" className="btn-cv" style={{ display: 'none' }} id="cv-btn">
                <svg width={13} height={13} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                CV
              </a>

              {/* Hamburger (shown < 1024px) */}
              <button onClick={() => setMobileOpen(o => !o)}
                id="hamburger"
                aria-label="Toggle menu"
                style={{ color: textSec, background: 'none', border: `1px solid ${borderSub}`, cursor: 'pointer', fontSize: 18, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'border-color 0.2s' }}>
                {mobileOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>

          {/* ── Mobile Drawer ── */}
          {mobileOpen && (
            <div className="mobile-drawer" style={{
              position: 'absolute', top: 64, left: 0, right: 0,
              background: mobileBg,
              borderBottom: `1px solid ${borderSub}`,
              backdropFilter: 'blur(12px)',
              padding: '8px clamp(16px,5vw,32px) 16px',
            }}>
              {navLinks.map(([href, label]) => (
                <a key={href} href={href} className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                  <span style={{ color: `rgba(0,217,255,0.5)`, marginRight: 8 }}>›</span>{label}
                </a>
              ))}
              {gameUnlocked && (
                <a href="/game" className="mobile-nav-link game-glow" onClick={() => setMobileOpen(false)}>
                  🎮 Game
                </a>
              )}
              {/* CV link inside drawer for very small screens */}
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${borderSub}` }}>
                <a href="/cv/preview" className="btn-cv" style={{ width: '100%', justifyContent: 'center' }}>
                  <svg width={13} height={13} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View CV
                </a>
              </div>
            </div>
          )}
        </nav>

        {/* Inline responsive overrides (avoids SSR mismatch with matchMedia) */}
        <style>{`
          @media (min-width: 480px)  { #cv-btn    { display: inline-flex !important; } }
          @media (min-width: 1024px) { .desk-nav  { display: flex !important; } #hamburger { display: none !important; } }
        `}</style>
      </header>
    </>
  );
}