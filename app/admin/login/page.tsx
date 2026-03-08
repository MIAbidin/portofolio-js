'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; password?: string; general?: string }>({});
  const [status, setStatus] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', password: '', remember: false });

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      setIsLight(true);
      document.documentElement.classList.add('light-mode');
    }
    // Reset body/html styles yang mungkin di-set AdminLayout
    document.body.style.cssText = '';
    document.documentElement.style.cssText = '';
  }, []);

  const toggleTheme = () => {
    const next = !isLight;
    setIsLight(next);
    if (next) {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const newErrors: typeof errors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required.';
    if (!form.password) newErrors.password = 'Password is required.';
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    const res = await signIn('credentials', {
      redirect: false,
      name: form.name,
      password: form.password,
    });

    if (res?.error) {
      setErrors({ general: 'These credentials do not match our records.' });
    } else {
      setStatus('Authentication successful. Redirecting…');
      router.push('/admin/dashboard');
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        /* Reset semua body styles dari AdminLayout */
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          height: 100% !important;
          overflow-x: hidden !important;
        }

        :root {
          --bg-primary:    #0a0e27;
          --bg-secondary:  #111633;
          --bg-card:       #151b3b;
          --border-subtle: rgba(0,217,255,0.1);
          --border-medium: rgba(0,217,255,0.2);
          --text-primary:  #e2e8f0;
          --text-muted:    #475569;
          --grid-line:     rgba(0,217,255,0.04);
        }
        .lp-light {
          --bg-primary:    #f0f4ff;
          --bg-secondary:  #e4eaf8;
          --bg-card:       #ffffff;
          --border-subtle: rgba(0,140,180,0.12);
          --border-medium: rgba(0,140,180,0.25);
          --text-primary:  #0f172a;
          --text-muted:    #64748b;
          --grid-line:     rgba(0,140,180,0.06);
        }

        .lp-root {
          background-color: var(--bg-primary);
          background-image:
            linear-gradient(var(--grid-line) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
          background-size: 40px 40px;
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          box-sizing: border-box;
          color: var(--text-primary);
          position: relative;
          overflow: hidden;
          transition: background-color 0.4s ease;
          font-family: 'Outfit', sans-serif;
        }

        /* Noise texture */
        .lp-root::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
          opacity: 0.4;
        }
        .lp-light .lp-root::after { opacity: 0.15; }

        /* Glow blobs */
        .lp-blob {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }

        /* Theme toggle */
        .lp-theme-btn {
          position: fixed;
          top: 16px; right: 16px;
          z-index: 100;
          width: 44px; height: 24px;
          border-radius: 12px;
          border: 1px solid var(--border-medium);
          background: var(--bg-secondary);
          cursor: pointer;
          transition: all 0.3s;
          padding: 0;
        }
        .lp-thumb {
          position: absolute;
          top: 3px; left: 3px;
          width: 16px; height: 16px;
          border-radius: 50%;
          background: #00d9ff;
          transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
          display: flex; align-items: center; justify-content: center;
        }
        .lp-thumb-light { transform: translateX(20px); background: #f59e0b; }

        /* Wrapper */
        .lp-wrap {
          width: 100%;
          max-width: 440px;
          position: relative;
          z-index: 10;
        }

        /* Header */
        .lp-header {
          text-align: center;
          margin-bottom: 28px;
          animation: lpFadeUp 0.5s ease-out forwards;
        }
        .lp-logo-link {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          text-decoration: none;
        }
        .lp-logo-box {
          width: 36px; height: 36px;
          border: 1px solid #00d9ff;
          position: relative;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .lp-logo-inner { width: 16px; height: 16px; background: #00d9ff; }
        .lp-logo-tl {
          position: absolute; top: -1px; left: -1px;
          width: 10px; height: 10px;
          border-top: 2px solid #00d9ff; border-left: 2px solid #00d9ff;
        }
        .lp-logo-br {
          position: absolute; bottom: -1px; right: -1px;
          width: 10px; height: 10px;
          border-bottom: 2px solid #00d9ff; border-right: 2px solid #00d9ff;
        }
        .lp-logo-text {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 1.5rem;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }
        .lp-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid rgba(16,185,129,0.3);
          background: rgba(16,185,129,0.06);
          padding: 4px 12px;
          font-family: 'DM Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.15em;
          color: #10b981;
        }
        .lp-dot {
          width: 6px; height: 6px;
          background: #10b981;
          border-radius: 50%;
          animation: lpBlink 1.5s ease-in-out infinite;
        }

        /* Terminal card */
        .lp-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          position: relative;
          overflow: hidden;
          transition: background 0.4s, border-color 0.3s;
          animation: lpFadeUp 0.5s ease-out 0.1s both;
        }
        .lp-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00d9ff, #7c3aed, transparent);
        }
        .lp-light .lp-card::before {
          background: linear-gradient(90deg, transparent, #0099bb, #6d28d9, transparent);
        }

        /* Scanline */
        .lp-scan {
          position: absolute;
          left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(0,217,255,0.12), transparent);
          animation: lpScan 4s linear infinite;
          pointer-events: none;
          z-index: 1;
        }
        @keyframes lpScan {
          0%   { top: 0%;   opacity: 1; }
          95%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }

        /* Corners */
        .lp-corner-tl {
          position: absolute; top: -1px; left: -1px;
          width: 14px; height: 14px;
          border-top: 2px solid #00d9ff; border-left: 2px solid #00d9ff;
        }
        .lp-corner-br {
          position: absolute; bottom: -1px; right: -1px;
          width: 14px; height: 14px;
          border-bottom: 2px solid #00d9ff; border-right: 2px solid #00d9ff;
        }
        .lp-light .lp-corner-tl,
        .lp-light .lp-corner-br { border-color: #0099bb; }

        /* Title bar */
        .lp-titlebar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-subtle);
        }
        .lp-tb-dot { width: 10px; height: 10px; border-radius: 50%; }
        .lp-tb-label {
          margin-left: 10px;
          font-family: 'DM Mono', monospace;
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        .lp-tb-badge {
          margin-left: auto;
          font-family: 'DM Mono', monospace;
          font-size: 0.68rem;
          color: #00d9ff;
          opacity: 0.45;
          letter-spacing: 0.05em;
        }

        /* Body */
        .lp-body { padding: 22px 22px 18px; }

        /* Terminal output */
        .lp-term {
          font-family: 'DM Mono', monospace;
          font-size: 0.7rem;
          margin-bottom: 20px;
          line-height: 1.7;
        }
        .lp-term-muted { color: var(--text-muted); }
        .lp-term-cyan  { color: #00d9ff; }
        .lp-term-green { color: #10b981; }
        .lp-cursor {
          display: inline-block;
          width: 6px; height: 11px;
          background: #00d9ff;
          vertical-align: middle;
          margin-left: 2px;
          animation: lpBlink 1s step-end infinite;
        }
        @keyframes lpBlink { 0%,100%{opacity:1} 50%{opacity:0} }

        /* Alerts */
        .lp-alert {
          font-family: 'DM Mono', monospace;
          font-size: 0.72rem;
          padding: 9px 12px;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .lp-alert-ok  { background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.25); color: #34d399; }
        .lp-alert-err { background: rgba(239,68,68,0.08);  border: 1px solid rgba(239,68,68,0.25);  color: #f87171; }

        /* Form fields */
        .lp-fields { display: flex; flex-direction: column; gap: 16px; }
        .lp-label {
          font-family: 'DM Mono', monospace;
          font-size: 0.68rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 5px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .lp-prompt { color: #00d9ff; }
        .lp-light .lp-prompt { color: #0077aa; }

        .lp-field-wrap { position: relative; }
        .lp-input {
          width: 100%;
          box-sizing: border-box;
          background: var(--bg-secondary);
          border: 1px solid var(--border-medium);
          color: var(--text-primary);
          font-family: 'DM Mono', monospace;
          font-size: 0.85rem;
          padding: 10px 38px 10px 13px;
          outline: none;
          transition: border-color 0.25s, box-shadow 0.25s;
          caret-color: #00d9ff;
        }
        .lp-input:focus {
          border-color: #00d9ff;
          box-shadow: 0 0 0 1px rgba(0,217,255,0.18), inset 0 0 10px rgba(0,217,255,0.03);
        }
        .lp-input::placeholder { color: var(--text-muted); font-size: 0.8rem; }
        .lp-input-err { border-color: rgba(239,68,68,0.55) !important; }
        .lp-light .lp-input:focus { border-color: #0099bb; box-shadow: 0 0 0 1px rgba(0,153,187,0.18); }

        .lp-field-icon {
          position: absolute;
          right: 11px; top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: var(--text-muted);
        }
        .lp-eye-btn {
          position: absolute;
          right: 11px; top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          color: var(--text-muted);
          transition: color 0.2s;
          display: flex;
          align-items: center;
        }
        .lp-eye-btn:hover { color: #00d9ff; }

        .lp-field-err {
          font-family: 'DM Mono', monospace;
          font-size: 0.68rem;
          color: #f87171;
          margin-top: 4px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        /* Remember */
        .lp-remember {
          display: flex;
          align-items: center;
          gap: 9px;
          padding-top: 2px;
        }
        .lp-check {
          width: 14px; height: 14px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-medium);
          appearance: none;
          -webkit-appearance: none;
          cursor: pointer;
          position: relative;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .lp-check:checked { background: rgba(0,217,255,0.12); border-color: #00d9ff; }
        .lp-check:checked::after {
          content: '✓';
          position: absolute;
          top: -2px; left: 1px;
          font-size: 10px;
          color: #00d9ff;
        }
        .lp-check-label {
          font-family: 'DM Mono', monospace;
          font-size: 0.72rem;
          color: var(--text-muted);
          cursor: pointer;
          user-select: none;
          letter-spacing: 0.06em;
        }

        /* Divider */
        .lp-divider { border: none; border-top: 1px solid var(--border-subtle); margin: 6px 0; }

        /* Submit */
        .lp-submit {
          width: 100%;
          padding: 11px;
          background: linear-gradient(135deg, rgba(0,217,255,0.08), rgba(124,58,237,0.08));
          border: 1px solid #00d9ff;
          color: #00d9ff;
          font-family: 'DM Mono', monospace;
          font-size: 0.78rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.25s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-sizing: border-box;
        }
        .lp-submit:hover:not(:disabled) {
          background: #00d9ff;
          color: #0a0e27;
          box-shadow: 0 0 24px rgba(0,217,255,0.28);
        }
        .lp-submit:disabled { opacity: 0.45; cursor: not-allowed; }
        .lp-light .lp-submit { border-color: #0099bb; color: #0077aa; }
        .lp-light .lp-submit:hover:not(:disabled) { background: #0099bb; color: #fff; }

        /* Footer */
        .lp-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 18px;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-subtle);
        }
        .lp-footer-l { font-family: 'DM Mono', monospace; font-size: 0.68rem; color: var(--text-muted); }
        .lp-footer-r {
          font-family: 'DM Mono', monospace;
          font-size: 0.68rem;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s;
        }
        .lp-footer-r:hover { color: #00d9ff; }

        /* Hint */
        .lp-hint {
          text-align: center;
          font-family: 'DM Mono', monospace;
          font-size: 0.68rem;
          margin-top: 14px;
          color: var(--text-muted);
          animation: lpFadeUp 0.5s ease-out 0.3s both;
        }

        @keyframes lpFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className={`lp-root${isLight ? ' lp-light' : ''}`}>

        {/* Blobs */}
        <div className="lp-blob" style={{ width: 280, height: 280, background: 'radial-gradient(circle, rgba(0,217,255,0.05), transparent 70%)', top: '8%', left: '4%' }} />
        <div className="lp-blob" style={{ width: 360, height: 360, background: 'radial-gradient(circle, rgba(124,58,237,0.06), transparent 70%)', bottom: '4%', right: '4%' }} />

        {/* Theme toggle */}
        <button className="lp-theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
          <div className={`lp-thumb${isLight ? ' lp-thumb-light' : ''}`}>
            {!isLight
              ? <svg style={{ width: 9, height: 9, color: '#0a0e27' }} fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
              : <svg style={{ width: 9, height: 9, color: '#fff' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
            }
          </div>
        </button>

        <div className="lp-wrap">

          {/* Header */}
          <div className="lp-header">
            <Link href="/" className="lp-logo-link">
              <div className="lp-logo-box">
                <div className="lp-logo-inner" />
                <div className="lp-logo-tl" />
                <div className="lp-logo-br" />
              </div>
              <span className="lp-logo-text">
                CMD<span style={{ color: '#00d9ff' }}>_</span>CTR
              </span>
            </Link>
            <div>
              <span className="lp-status">
                <span className="lp-dot" />
                SYSTEM ONLINE
              </span>
            </div>
          </div>

          {/* Card */}
          <div className="lp-card">
            <div className="lp-scan" />
            <div className="lp-corner-tl" />
            <div className="lp-corner-br" />

            {/* Title bar */}
            <div className="lp-titlebar">
              <div className="lp-tb-dot" style={{ background: 'rgba(239,68,68,0.65)' }} />
              <div className="lp-tb-dot" style={{ background: 'rgba(245,158,11,0.65)' }} />
              <div className="lp-tb-dot" style={{ background: 'rgba(34,197,94,0.65)' }} />
              <span className="lp-tb-label">auth.sh</span>
              <span className="lp-tb-badge">— RESTRICTED ACCESS —</span>
            </div>

            {/* Body */}
            <div className="lp-body">

              {/* Terminal lines */}
              <div className="lp-term">
                <div className="lp-term-muted">
                  <span className="lp-term-cyan">$</span> ./authenticate --mode=admin
                </div>
                <div className="lp-term-muted">
                  Initializing secure session... <span className="lp-term-green">OK</span>
                </div>
                <div className="lp-term-muted">
                  Awaiting credentials<span className="lp-cursor" />
                </div>
              </div>

              {/* Alerts */}
              {status && (
                <div className="lp-alert lp-alert-ok">
                  <span>✓</span> {status}
                </div>
              )}
              {errors.general && (
                <div className="lp-alert lp-alert-err">
                  <span>✗</span> {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="lp-fields">

                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="lp-label">
                      <span className="lp-prompt">&gt;</span> operator_name
                    </label>
                    <div className="lp-field-wrap">
                      <input
                        id="name" name="name" type="text"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        required autoFocus autoComplete="username"
                        className={`lp-input${errors.name ? ' lp-input-err' : ''}`}
                        placeholder="enter name..."
                      />
                      <span className="lp-field-icon">
                        <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </span>
                    </div>
                    {errors.name && <div className="lp-field-err">✗ {errors.name}</div>}
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="lp-label">
                      <span className="lp-prompt">&gt;</span> access_key
                    </label>
                    <div className="lp-field-wrap">
                      <input
                        id="password" name="password"
                        type={showPass ? 'text' : 'password'}
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        required autoComplete="current-password"
                        className={`lp-input${errors.password ? ' lp-input-err' : ''}`}
                        placeholder="••••••••••••"
                      />
                      <button type="button" className="lp-eye-btn" onClick={() => setShowPass(v => !v)} tabIndex={-1}
                        style={{ color: showPass ? '#00d9ff' : undefined }}>
                        {showPass
                          ? <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                          : <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        }
                      </button>
                    </div>
                    {errors.password && <div className="lp-field-err">✗ {errors.password}</div>}
                  </div>

                  {/* Remember me */}
                  <div className="lp-remember">
                    <input id="remember" type="checkbox" className="lp-check"
                      checked={form.remember}
                      onChange={e => setForm(f => ({ ...f, remember: e.target.checked }))} />
                    <label htmlFor="remember" className="lp-check-label">
                      maintain_session = <span style={{ color: '#00d9ff' }}>true</span>
                    </label>
                  </div>

                  <hr className="lp-divider" />

                  {/* Submit */}
                  <button type="submit" className="lp-submit" disabled={loading}>
                    <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    {loading ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
                  </button>

                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="lp-footer">
              <span className="lp-footer-l">// session encrypted</span>
              <Link href="/" className="lp-footer-r">← back to portfolio</Link>
            </div>
          </div>

          <p className="lp-hint">// restricted area — authorized personnel only</p>
        </div>
      </div>
    </>
  );
}