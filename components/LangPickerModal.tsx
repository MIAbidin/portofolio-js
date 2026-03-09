'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type DownloadTarget = 'cv' | 'ppt' | null;

interface Props {
  target: DownloadTarget;
  onClose: () => void;
}

const FLAGS = {
  en: '🇬🇧',
  id: '🇮🇩',
};

const LABELS = {
  en: { lang: 'English', desc: 'Download in English' },
  id: { lang: 'Indonesia', desc: 'Unduh dalam Bahasa Indonesia' },
};

const ENDPOINTS: Record<'cv' | 'ppt', Record<'en' | 'id', string>> = {
  cv:  { en: '/api/cv/download?lang=en',   id: '/api/cv/download?lang=id'  },
  ppt: { en: '/api/portfolio/download/pptx?lang=en', id: '/api/portfolio/download/pptx?lang=id' },
};

export default function LangPickerModal({ target, onClose }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handlePick = (lang: 'en' | 'id') => {
    if (!target) return;
    window.location.href = ENDPOINTS[target][lang];
    onClose();
  };

  return (
    <AnimatePresence>
      {target && (
        <motion.div
          ref={backdropRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 99990,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(6px)',
          }}
        >
          <motion.div
            initial={{ scale: 0.88, y: 32, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.88, y: 32, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            style={{
              background: '#0d1130',
              border: '1px solid rgba(0,217,255,0.25)',
              maxWidth: 440,
              width: '100%',
              fontFamily: "'DM Mono', monospace",
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Top accent line */}
            <div style={{ height: 2, background: 'linear-gradient(90deg,transparent,#00d9ff,transparent)' }} />

            {/* Header */}
            <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#00d9ff', marginBottom: 6 }}>
                  // SELECT LANGUAGE
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
                  {target === 'cv' ? '📄 Download CV' : '📊 Download Portfolio PPT'}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                  Choose your preferred language for this document
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#475569', fontSize: 20, lineHeight: 1, padding: '4px 6px',
                  transition: 'color 0.2s',
                  flexShrink: 0,
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
                aria-label="Close"
              >×</button>
            </div>

            {/* Options */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '20px 24px 24px' }}>
              {(['en', 'id'] as const).map((lang) => (
                <motion.button
                  key={lang}
                  onClick={() => handlePick(lang)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    background: 'rgba(0,217,255,0.05)',
                    border: '1px solid rgba(0,217,255,0.2)',
                    cursor: 'pointer',
                    padding: '20px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10,
                    transition: 'all 0.25s',
                    color: '#e2e8f0',
                    fontFamily: "'DM Mono', monospace",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,217,255,0.12)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#00d9ff';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 24px rgba(0,217,255,0.15)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,217,255,0.05)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,217,255,0.2)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                  }}
                >
                  <span style={{ fontSize: 36 }}>{FLAGS[lang]}</span>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#00d9ff', letterSpacing: '0.05em' }}>
                      {LABELS[lang].lang}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                      {LABELS[lang].desc}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Footer hint */}
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.05)',
              padding: '10px 24px',
              fontSize: 11,
              color: '#334155',
              textAlign: 'center',
            }}>
              Press <kbd style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid #334155', padding: '1px 6px', borderRadius: 3, color: '#475569' }}>ESC</kbd> to cancel
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}