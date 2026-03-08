'use client';

interface FooterProps {
  isLight: boolean;
  settings?: {
    brand_initials?: string;
    brand_suffix?: string;
    hero_subtitle?: string;
  };
}

export default function Footer({ isLight, settings }: FooterProps) {
  const t       = isLight;
  const cyber   = t ? '#0077aa' : '#00d9ff';
  const green   = '#10b981';
  const purple  = '#7c3aed';
  const textSec = t ? '#334155' : '#94a3b8';
  const textMut = t ? '#64748b' : '#475569';
  const borderSub = t ? 'rgba(0,140,180,0.12)' : 'rgba(0,217,255,0.1)';

  const brandInitials = settings?.brand_initials || 'MIA';
  const brandSuffix   = settings?.brand_suffix   || '.Dev';
  const brandFull     = `${brandInitials}${brandSuffix}`;
  const subtitle      = settings?.hero_subtitle  || 'Full Stack Developer & AI Engineer Enthusiast';

  const navLinks: [string, string][] = [
    ['/', 'Home'],
    ['/portfolio', 'Portfolio'],
    ['/contact', 'Contact'],
  ];

  const statusItems = [
    { c: green,  l: 'Available for projects' },
    { c: cyber,  l: 'Open to collaboration' },
    { c: purple, l: 'Remote / On-site' },
  ];

  return (
    <>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

        .footer-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(24px, 5vw, 32px);
          margin-bottom: clamp(24px, 5vw, 32px);
        }
        @media (min-width: 640px)  { .footer-grid { grid-template-columns: 1fr 1fr; } }
        @media (min-width: 1024px) { .footer-grid { grid-template-columns: repeat(3, 1fr); } }

        .footer-bottom {
          border-top: 1px solid ${borderSub};
          padding-top: clamp(16px, 3vw, 24px);
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-start;
        }
        @media (min-width: 640px) {
          .footer-bottom {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        .footer-nav-link {
          color: ${textSec};
          font-size: clamp(12px, 2.5vw, 14px);
          font-family: 'DM Mono', monospace;
          text-decoration: none;
          transition: color 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .footer-nav-link:hover { color: ${cyber}; }
      `}</style>

      <footer style={{
        position: 'relative',
        zIndex: 10,
        borderTop: `1px solid ${borderSub}`,
        background: t ? '#dde5f5' : '#060918',
        marginTop: 80,
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(32px,6vw,48px) clamp(16px,5vw,48px)' }}>

          <div className="footer-grid">

            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 26, height: 26, border: `1px solid ${cyber}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: 11, height: 11, background: cyber }} />
                </div>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: t ? '#0f172a' : '#fff', fontSize: 'clamp(15px,3vw,18px)' }}>
                  {brandInitials}<span style={{ color: cyber }}>{brandSuffix}</span>
                </span>
              </div>
              <p style={{ color: textSec, fontSize: 'clamp(12px,2.5vw,14px)', fontFamily: 'Outfit, sans-serif', lineHeight: 1.7 }}>
                {subtitle}
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4 style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', color: cyber, marginBottom: 14 }}>
                Navigation
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {navLinks.map(([href, label]) => (
                  <li key={href}>
                    <a href={href} className="footer-nav-link">
                      <span style={{ color: 'rgba(0,217,255,0.5)' }}>›</span> {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Status */}
            <div>
              <h4 style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', color: cyber, marginBottom: 14 }}>
                System Status
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {statusItems.map(st => (
                  <div key={st.l} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'DM Mono, monospace', fontSize: 'clamp(11px,2.5vw,12px)', color: textSec }}>
                    <span style={{ width: 8, height: 8, background: st.c, borderRadius: '50%', animation: 'blink 2s step-end infinite', flexShrink: 0 }} />
                    {st.l}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="footer-bottom">
            <p style={{ color: textMut, fontSize: 'clamp(11px,2.5vw,12px)', fontFamily: 'DM Mono, monospace' }}>
              © {new Date().getFullYear()} {brandFull}
            </p>
            <p style={{ color: textMut, fontSize: 'clamp(11px,2.5vw,12px)', fontFamily: 'DM Mono, monospace' }}>
              <span style={{ color: cyber }}>SYS:</span> All systems operational
            </p>
          </div>

        </div>
      </footer>
    </>
  );
}