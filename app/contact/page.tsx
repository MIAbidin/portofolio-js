'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';

interface ContactSettings {
  contact_email?: string;
  contact_phone?: string;
  social_github?: string;
  social_linkedin?: string;
}

interface FormState {
  sender_name: string;
  sender_email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  sender_name?: string;
  sender_email?: string;
  message?: string;
}

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ContactPage() {
  const { isLight } = useTheme();
  const t = isLight;

  // ── Theme vars ─────────────────────────────────────────
  const cyber    = t ? '#0077aa' : '#00d9ff';
  const green    = '#10b981';
  const bg       = t ? '#f0f4ff' : '#0a0e27';
  const bgCard   = t ? '#ffffff' : '#151b3b';
  const bgInput  = t ? '#f8faff' : '#0d1229';
  const textPri  = t ? '#0f172a' : '#e2e8f0';
  const textSec  = t ? '#334155' : '#94a3b8';
  const textMut  = t ? '#64748b' : '#475569';
  const border   = t ? 'rgba(0,140,180,0.18)' : 'rgba(51,65,85,0.8)';
  const borderFocus = t ? '#0077aa' : '#00d9ff';

  // ── Contact settings from API ──────────────────────────
  const [contactSettings, setContactSettings] = useState<ContactSettings>({});
  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(res => {
        if (res.data) {
          const obj = res.data.reduce((acc: ContactSettings, cur: any) => {
            (acc as any)[cur.key] = cur.value;
            return acc;
          }, {});
          setContactSettings(obj);
        }
      })
      .catch(() => {});
  }, []);

  // ── Form state ─────────────────────────────────────────
  const [form, setForm] = useState<FormState>({
    sender_name: '',
    sender_email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // ── Validation ─────────────────────────────────────────
  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.sender_name.trim()) e.sender_name = 'Name is required.';
    if (!form.sender_email.trim()) {
      e.sender_email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.sender_email)) {
      e.sender_email = 'Invalid email format.';
    }
    if (!form.message.trim()) e.message = 'Message is required.';
    else if (form.message.trim().length < 10) e.message = 'Message must be at least 10 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
      setForm({ sender_name: '', sender_email: '', subject: '', message: '' });
      setErrors({});
    } catch {
      setStatus('error');
    }
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // ── Contact channels ───────────────────────────────────
  const channels = [
    {
      label: 'Email',
      value: contactSettings.contact_email || 'hello@example.com',
      href: `mailto:${contactSettings.contact_email || ''}`,
      icon: (
        <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'GitHub',
      value: contactSettings.social_github?.replace('https://', '') || 'github.com/yourhandle',
      href: contactSettings.social_github || '#',
      icon: (
        <svg width={16} height={16} fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" clipRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      ),
    },
    {
      label: 'LinkedIn',
      value: contactSettings.social_linkedin?.replace('https://', '') || 'linkedin.com/in/yourname',
      href: contactSettings.social_linkedin || '#',
      icon: (
        <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      ),
    },
  ];

  // ── Input style helper ─────────────────────────────────
  const inputStyle = (field: string, hasError?: boolean): React.CSSProperties => ({
    width: '100%',
    background: bgInput,
    border: `1px solid ${hasError ? '#f87171' : focusedField === field ? borderFocus : border}`,
    color: textPri,
    fontFamily: 'Outfit, sans-serif',
    fontSize: 14,
    padding: '12px 16px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxShadow: focusedField === field && !hasError ? `0 0 0 1px ${cyber}22` : 'none',
    borderRadius: 0,
    WebkitAppearance: 'none',
    appearance: 'none',
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${bg}; color: ${textPri}; }
        body::before {
          content: '';
          position: fixed; inset: 0;
          background-image:
            linear-gradient(${t ? 'rgba(0,140,180,0.05)' : 'rgba(0,217,255,0.03)'} 1px, transparent 1px),
            linear-gradient(90deg, ${t ? 'rgba(0,140,180,0.05)' : 'rgba(0,217,255,0.03)'} 1px, transparent 1px);
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
        textarea { resize: none; }
        textarea::placeholder, input::placeholder { color: ${textMut}; opacity: 1; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:none} }
        .alert-in { animation: fadeSlideIn 0.3s ease-out; }

        /* ── Responsive layout ── */
        .contact-wrapper {
          max-width: 1152px;
          margin: 0 auto;
          padding: clamp(40px, 8vh, 64px) clamp(16px, 5vw, 48px) clamp(48px, 10vh, 96px);
        }
        .contact-grid {
          display: grid;
          grid-template-columns: 2fr 3fr;
          gap: 48px;
          align-items: start;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .form-padding {
          padding: 32px;
        }
        .channel-value {
          display: block;
        }

        /* ── Mobile ── */
        @media (max-width: 767px) {
          .contact-grid {
            grid-template-columns: 1fr;
            gap: 28px;
          }
          .form-row {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .form-padding {
            padding: 20px 16px;
          }
          .submit-row {
            flex-direction: column;
            align-items: stretch !important;
          }
          .submit-btn {
            justify-content: center;
          }
          .channels-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .channel-value {
            display: none;
          }
          .channel-arrow {
            display: none;
          }
        }

        /* ── Small mobile ── */
        @media (max-width: 400px) {
          .channels-row {
            grid-template-columns: 1fr;
          }
          .channel-value {
            display: block;
          }
        }

        /* ── Tablet ── */
        @media (min-width: 768px) and (max-width: 1023px) {
          .contact-grid {
            grid-template-columns: 1fr;
            gap: 36px;
          }
          .left-col-tablet {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 24px;
            align-items: start;
          }
        }
      `}</style>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        <div className="contact-wrapper">

          {/* ── Page Header ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: 'clamp(36px, 7vh, 64px)' }}
          >
            <div className="section-tag" style={{ marginBottom: 12 }}>Get In Touch</div>
            <h1 style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(2rem, 8vw, 4rem)',
              color: t ? '#0f172a' : '#fff',
              marginBottom: 16,
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}>
              Let's <span style={{ color: cyber }}>Connect</span>
            </h1>
            <p style={{
              color: textSec,
              maxWidth: 480,
              lineHeight: 1.7,
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(13px, 3vw, 15px)',
            }}>
              Punya proyek menarik? Atau hanya ingin say hi? Kirim pesan dan saya akan membalas secepat mungkin.
            </p>
          </motion.div>

          {/* ── Main Grid ──────────────────────────────── */}
          <div className="contact-grid">

            {/* ── Left: Contact Info ──────────────────── */}
            <div className="left-col-tablet" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Status card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{
                  background: bgCard,
                  border: `1px solid ${t ? 'rgba(0,140,180,0.12)' : 'rgba(0,217,255,0.08)'}`,
                  padding: 'clamp(16px, 4vw, 24px)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${green}, transparent)` }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ position: 'relative', display: 'inline-flex', width: 10, height: 10 }}>
                    <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: green, opacity: 0.6, animation: 'blink 1.5s ease-in-out infinite' }} />
                    <span style={{ position: 'relative', width: 10, height: 10, borderRadius: '50%', background: green, display: 'inline-flex' }} />
                  </span>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: green, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                    Available for work
                  </span>
                </div>
                <p style={{ color: textSec, fontSize: 'clamp(12px, 2.5vw, 13px)', lineHeight: 1.7, fontFamily: 'Outfit, sans-serif' }}>
                  Saat ini saya terbuka untuk proyek freelance, kolaborasi, maupun peluang kerja full-time.
                </p>
              </motion.div>

              {/* Channels */}
              <div>
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', color: textMut, marginBottom: 12 }}>
                  Direct Channels
                </p>
                <div className="channels-row" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {channels.map((ch, i) => (
                    <motion.a
                      key={ch.label}
                      href={ch.href}
                      target="_blank"
                      rel="noreferrer"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.15 + i * 0.07 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        background: bgCard,
                        border: `1px solid ${t ? 'rgba(0,140,180,0.1)' : 'rgba(51,65,85,0.6)'}`,
                        padding: 'clamp(10px, 3vw, 14px) clamp(12px, 3vw, 16px)',
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                      }}
                      whileHover={{
                        borderColor: t ? 'rgba(0,140,180,0.4)' : 'rgba(0,217,255,0.35)',
                        y: -2,
                        boxShadow: `0 8px 24px rgba(0,0,0,0.3)`,
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Icon box */}
                      <div style={{
                        width: 38,
                        height: 38,
                        border: `1px solid ${t ? 'rgba(0,140,180,0.2)' : 'rgba(0,217,255,0.15)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: cyber,
                        transition: 'all 0.2s',
                      }}>
                        {ch.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: textMut, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 2 }}>
                          {ch.label}
                        </div>
                        <div className="channel-value" style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(11px, 2.5vw, 13px)', color: textSec, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ch.value}
                        </div>
                      </div>
                      <svg className="channel-arrow" width={12} height={12} fill="none" stroke={textMut} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right: Form ─────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              {/* Success alert */}
              <AnimatePresence>
                {status === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 14,
                      border: `1px solid rgba(16,185,129,0.3)`,
                      background: 'rgba(16,185,129,0.05)',
                      padding: 'clamp(12px, 3vw, 16px) clamp(14px, 4vw, 20px)',
                      marginBottom: 24,
                    }}
                  >
                    <div style={{
                      width: 32, height: 32,
                      border: '1px solid rgba(16,185,129,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <svg width={16} height={16} fill="none" stroke={green} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, color: green, marginBottom: 4 }}>
                        Transmission Successful
                      </p>
                      <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, color: textSec }}>
                        Pesan kamu sudah terkirim. Saya akan segera membalas!
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error alert */}
              <AnimatePresence>
                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 14,
                      border: '1px solid rgba(248,113,113,0.3)',
                      background: 'rgba(248,113,113,0.05)',
                      padding: 'clamp(12px, 3vw, 16px) clamp(14px, 4vw, 20px)',
                      marginBottom: 24,
                    }}
                  >
                    <svg width={20} height={20} fill="none" stroke="#f87171" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 2 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, color: textSec }}>
                      Gagal mengirim pesan. Silakan coba lagi atau hubungi langsung via email.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form card */}
              <div style={{
                background: bgCard,
                border: `1px solid ${t ? 'rgba(0,140,180,0.1)' : 'rgba(0,217,255,0.07)'}`,
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Top accent */}
                <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${cyber}, transparent)` }} />

                <div className="form-padding" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 4vw, 24px)' }}>

                  {/* Name + Email row — stacks on mobile */}
                  <div className="form-row">
                    <FieldGroup label="Name" required error={errors.sender_name} cyber={cyber}>
                      <input
                        type="text"
                        value={form.sender_name}
                        onChange={e => handleChange('sender_name', e.target.value)}
                        onFocus={() => setFocusedField('sender_name')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Your name"
                        style={inputStyle('sender_name', !!errors.sender_name)}
                        autoComplete="name"
                      />
                    </FieldGroup>

                    <FieldGroup label="Email" required error={errors.sender_email} cyber={cyber}>
                      <input
                        type="email"
                        value={form.sender_email}
                        onChange={e => handleChange('sender_email', e.target.value)}
                        onFocus={() => setFocusedField('sender_email')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="your@email.com"
                        style={inputStyle('sender_email', !!errors.sender_email)}
                        autoComplete="email"
                        inputMode="email"
                      />
                    </FieldGroup>
                  </div>

                  {/* Subject */}
                  <FieldGroup label="Subject" optional error={undefined} cyber={cyber}>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={e => handleChange('subject', e.target.value)}
                      onFocus={() => setFocusedField('subject')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="What's this about?"
                      style={inputStyle('subject')}
                    />
                  </FieldGroup>

                  {/* Message */}
                  <FieldGroup label="Message" required error={errors.message} cyber={cyber}>
                    <textarea
                      rows={5}
                      value={form.message}
                      onChange={e => handleChange('message', e.target.value)}
                      onFocus={() => setFocusedField('message')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Tell me about your project, idea, or just say hi..."
                      style={inputStyle('message', !!errors.message)}
                    />
                  </FieldGroup>

                  {/* Footer row — stacks on mobile */}
                  <div className="submit-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, gap: 12 }}>
                    <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: textMut }}>
                      <span style={{ color: cyber }}>*</span> Required fields
                    </p>

                    <button
                      className="submit-btn"
                      onClick={handleSubmit}
                      disabled={status === 'loading'}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 28px',
                        background: status === 'loading'
                          ? 'rgba(0,217,255,0.08)'
                          : `linear-gradient(135deg, rgba(0,217,255,0.13), rgba(124,58,237,0.13))`,
                        border: `1px solid ${cyber}`,
                        color: cyber,
                        fontFamily: 'DM Mono, monospace',
                        fontSize: 13,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                        opacity: status === 'loading' ? 0.7 : 1,
                        transition: 'all 0.3s',
                        WebkitTapHighlightColor: 'transparent',
                        touchAction: 'manipulation',
                        width: 'auto',
                      }}
                      onMouseEnter={e => {
                        if (status !== 'loading') {
                          (e.currentTarget as HTMLElement).style.background = cyber;
                          (e.currentTarget as HTMLElement).style.color = '#0a0e27';
                          (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${cyber}40`;
                        }
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = `linear-gradient(135deg, rgba(0,217,255,0.13), rgba(124,58,237,0.13))`;
                        (e.currentTarget as HTMLElement).style.color = cyber;
                        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                      }}
                    >
                      {status === 'loading' ? (
                        <>
                          <svg width={16} height={16} fill="none" viewBox="0 0 24 24" className="spin">
                            <circle cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={4} opacity={0.25} />
                            <path fill="currentColor" opacity={0.75} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Send Message
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </>
  );
}

// ── FieldGroup sub-component ──────────────────────────────
function FieldGroup({
  label, required, optional, error, cyber, children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  cyber: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontFamily: 'DM Mono, monospace',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        color: '#475569',
      }}>
        {label}{' '}
        {required && <span style={{ color: cyber }}>*</span>}
        {optional && <span style={{ color: '#334155' }}>(optional)</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#f87171', marginTop: 2 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}