'use client';

import { useState, useEffect, useRef } from 'react';
import { PageHeader, Panel } from '@/components/AdminLayout';

interface Setting {
  _id:      string;
  key:      string;
  type:     string;
  value:    string;
  value_id: string;
  updatedAt: string;
}

// ── Key metadata — matches seed.ts exactly ────────────────────────────────────
const KEY_META: Record<string, {
  label:     string;
  hint?:     string;
  bilingual: boolean;
}> = {
  // Hero
  hero_title:        { label: 'Name / Hero Title',      bilingual: false },
  hero_subtitle:     { label: 'Hero Subtitle / Bio',    hint: 'Shown below name on homepage', bilingual: true },
  hero_cta_text:     { label: 'CTA Button Text',        hint: 'e.g. "Download CV"',           bilingual: true },

  // About
  about_title:       { label: 'About Section Title',    bilingual: true  },
  about_text:        { label: 'About / Long Bio',       hint: 'Full paragraph shown on public About page', bilingual: true  },

  // Contact
  contact_email:     { label: 'Email',                  bilingual: false },
  contact_phone:     { label: 'Phone',                  bilingual: false },
  contact_location:  { label: 'Location',               hint: 'e.g. Karanganyar, Central Java', bilingual: true  },

  // Social
  social_github:     { label: 'GitHub URL',             bilingual: false },
  social_linkedin:   { label: 'LinkedIn URL',           bilingual: false },
  social_instagram:  { label: 'Instagram URL',          bilingual: false },

  // Brand
  brand_initials:    { label: 'Brand Initials',         hint: 'e.g. MIA', bilingual: false },
  brand_suffix:      { label: 'Brand Suffix',           hint: 'e.g. .Dev', bilingual: false },

  // SEO
  site_title:        { label: 'Site Title',             hint: 'Browser tab title', bilingual: true  },
  site_description:  { label: 'Meta Description',       hint: 'SEO description',   bilingual: true  },
  site_keywords:     { label: 'Meta Keywords',          hint: 'Comma-separated',   bilingual: true  },
};

// ── Groups — keys must match KEY_META ─────────────────────────────────────────
const GROUPS = [
  {
    label: 'Hero Section',
    color: '#00d9ff',
    keys:  ['hero_title', 'hero_subtitle', 'hero_cta_text'],
  },
  {
    label: 'About / Bio',
    color: '#a78bfa',
    keys:  ['about_title', 'about_text'],
  },
  {
    label: 'Contact Info',
    color: '#34d399',
    keys:  ['contact_email', 'contact_phone', 'contact_location'],
  },
  {
    label: 'Social Links',
    color: '#fb923c',
    keys:  ['social_github', 'social_linkedin', 'social_instagram'],
  },
  {
    label: 'Brand',
    color: '#f472b6',
    keys:  ['brand_initials', 'brand_suffix'],
  },
  {
    label: 'SEO / Meta',
    color: '#facc15',
    keys:  ['site_title', 'site_description', 'site_keywords'],
  },
] as const;

// ── Auto-detect if a key should render as textarea ────────────────────────────
function isTextarea(key: string, type: string) {
  if (type === 'textarea') return true;
  return ['hero_subtitle', 'about_text', 'site_description', 'site_keywords'].includes(key);
}

// ── Single row ────────────────────────────────────────────────────────────────
function SettingRow({
  setting,
  onSave,
}: {
  setting: Setting;
  onSave: (id: string, value: string, value_id: string) => Promise<void>;
}) {
  const meta      = KEY_META[setting.key];
  const ta        = isTextarea(setting.key, setting.type);
  const bilingual = meta?.bilingual ?? false;

  const [valueEN, setValueEN] = useState(setting.value    ?? '');
  const [valueID, setValueID] = useState(setting.value_id ?? '');
  const [langTab, setLangTab] = useState<'en' | 'id'>('en');
  const [dirty,   setDirty]   = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [err,     setErr]     = useState('');

  // Re-sync if parent data changes (e.g. after save)
  const prevId = useRef(setting._id);
  useEffect(() => {
    if (prevId.current !== setting._id) {
      setValueEN(setting.value    ?? '');
      setValueID(setting.value_id ?? '');
      prevId.current = setting._id;
    }
  }, [setting]);

  useEffect(() => {
    setDirty(
      valueEN !== (setting.value    ?? '') ||
      valueID !== (setting.value_id ?? '')
    );
  }, [valueEN, valueID, setting.value, setting.value_id]);

  async function save() {
    setSaving(true); setErr(''); setSaved(false);
    try {
      await onSave(setting._id, valueEN, valueID);
      setSaved(true); setDirty(false);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setErr(e.message || 'Save failed');
    } finally { setSaving(false); }
  }

  const idFilled = !!valueID.trim();

  const base: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    background: '#0d1229', border: '1px solid rgba(30,39,73,0.8)',
    color: '#e2e8f0', padding: '8px 11px',
    fontFamily: setting.type === 'url' ? 'DM Mono, monospace' : 'Outfit, sans-serif',
    fontSize: '0.85rem', outline: 'none', transition: 'border-color 0.2s',
    resize: ta ? 'vertical' as const : undefined,
  };
  const accentStyle = (color?: string): React.CSSProperties => ({
    ...base,
    borderColor: color ? `${color}44` : 'rgba(30,39,73,0.8)',
  });

  const activeVal  = langTab === 'en' ? valueEN : valueID;
  const setActive  = langTab === 'en' ? setValueEN : setValueID;
  const accentColor = langTab === 'id' ? '#a78bfa' : undefined;

  return (
    <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.15s' }}
      onMouseOver={e => (e.currentTarget.style.background = 'rgba(0,217,255,0.012)')}
      onMouseOut={e  => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr 90px', gap: 18, alignItems: 'start' }}>

        {/* ── Label col ── */}
        <div style={{ paddingTop: bilingual ? 36 : 4 }}>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 500, marginBottom: 3 }}>
            {meta?.label ?? setting.key}
          </div>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: '#374151', letterSpacing: '0.06em', marginBottom: meta?.hint ? 4 : 0 }}>
            {setting.key}
          </div>
          {meta?.hint && (
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.61rem', color: '#475569', lineHeight: 1.45 }}>
              {meta.hint}
            </div>
          )}
          {bilingual && (
            <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', padding: '2px 8px' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: idFilled ? '#10b981' : '#374151', boxShadow: idFilled ? '0 0 6px rgba(16,185,129,0.5)' : 'none' }} />
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: idFilled ? '#34d399' : '#a78bfa' }}>
                {idFilled ? 'ID filled' : 'bilingual'}
              </span>
            </div>
          )}
        </div>

        {/* ── Input col ── */}
        <div>
          {bilingual && (
            <div style={{ display: 'flex', marginBottom: 6, borderBottom: '1px solid rgba(0,217,255,0.08)' }}>
              {(['en', 'id'] as const).map(lang => (
                <button key={lang} type="button" onClick={() => setLangTab(lang)}
                  style={{
                    fontFamily: 'DM Mono, monospace', fontSize: '0.62rem', letterSpacing: '0.1em',
                    textTransform: 'uppercase', padding: '5px 16px', border: 'none',
                    background: 'transparent', cursor: 'pointer', transition: 'all 0.2s',
                    color:        langTab === lang ? (lang === 'en' ? '#00d9ff' : '#a78bfa') : '#475569',
                    borderBottom: langTab === lang
                      ? `2px solid ${lang === 'en' ? '#00d9ff' : '#a78bfa'}`
                      : '2px solid transparent',
                    marginBottom: -1,
                  }}>
                  {lang === 'en' ? '🇬🇧 EN' : '🇮🇩 ID'}
                  {lang === 'id' && idFilled && (
                    <span style={{ display: 'inline-block', width: 4, height: 4, borderRadius: '50%', background: '#10b981', marginLeft: 5, verticalAlign: 'middle' }} />
                  )}
                </button>
              ))}
              <span style={{ marginLeft: 'auto', fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: '#374151', alignSelf: 'center', paddingRight: 4 }}>
                {langTab === 'en' ? 'Public + CV EN' : 'CV ID only'}
              </span>
            </div>
          )}

          {ta ? (
            <textarea
              value={activeVal}
              onChange={e => setActive(e.target.value)}
              rows={activeVal.split('\n').length > 4 ? 6 : 4}
              placeholder={langTab === 'id' ? 'Terjemahan Bahasa Indonesia (opsional)...' : ''}
              style={accentStyle(accentColor)}
            />
          ) : (
            <input
              value={activeVal}
              onChange={e => setActive(e.target.value)}
              type={setting.type === 'url' ? 'url' : 'text'}
              placeholder={langTab === 'id' ? 'Terjemahan Bahasa Indonesia (opsional)...' : ''}
              style={accentStyle(accentColor)}
            />
          )}

          {err && (
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.64rem', color: '#ef4444', marginTop: 5 }}>
              ⚠ {err}
            </div>
          )}
        </div>

        {/* ── Save col ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, paddingTop: bilingual ? 34 : 2 }}>
          <button
            type="button" onClick={save}
            disabled={saving || !dirty}
            style={{
              fontFamily: 'DM Mono, monospace', fontSize: '0.64rem', letterSpacing: '0.08em',
              textTransform: 'uppercase', padding: '7px 16px', border: '1px solid',
              cursor: dirty && !saving ? 'pointer' : 'default', transition: 'all 0.2s',
              background: 'transparent', whiteSpace: 'nowrap',
              borderColor: saved  ? 'rgba(16,185,129,0.5)'
                         : dirty  ? 'rgba(0,217,255,0.4)'
                         :          'rgba(100,116,139,0.15)',
              color:       saved  ? '#10b981'
                         : dirty  ? '#00d9ff'
                         :          '#374151',
              backgroundColor: saved ? 'rgba(16,185,129,0.05)' : dirty ? 'rgba(0,217,255,0.05)' : 'transparent',
              opacity: saving ? 0.6 : 1,
            }}>
            {saving ? '···' : saved ? '✓ Saved' : 'Save'}
          </button>
          {dirty && !saving && (
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.58rem', color: '#f59e0b' }}>
              ● unsaved
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const res  = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data.data || []);
    } finally { setLoading(false); }
  }

  async function saveSingle(id: string, value: string, value_id: string) {
    const res  = await fetch(`/api/settings/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ value, value_id }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Save failed');
    setSettings(prev => prev.map(s => s._id === id ? { ...s, value, value_id } : s));
  }

  const map = Object.fromEntries(settings.map(s => [s.key, s]));
  const knownKeys = new Set(GROUPS.flatMap(g => [...g.keys]));
  const others = settings.filter(s => !knownKeys.has(s.key));

  const total    = settings.length;
  const bilingualFilled = settings.filter(s => KEY_META[s.key]?.bilingual && s.value_id?.trim()).length;
  const bilingualTotal  = settings.filter(s => KEY_META[s.key]?.bilingual).length;

  return (
    <>
      <style>{`
        textarea, input[type="text"], input[type="url"] { transition: border-color 0.2s; }
        textarea:focus, input:focus { border-color: rgba(0,217,255,0.35) !important; outline: none; }
      `}</style>

      <PageHeader
        title="Settings"
        sub={`${total} keys · ${bilingualFilled}/${bilingualTotal} Indonesian translations filled`}
      />

      {loading ? (
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: '#475569', padding: '48px 0', textAlign: 'center', letterSpacing: '0.1em' }}>
          Loading...
        </div>
      ) : settings.length === 0 ? (
        <Panel style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🌱</div>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: '#374151', marginBottom: 8 }}>
            No settings found in database.
          </div>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: '#1e2749', background: '#06091a', display: 'inline-block', padding: '6px 14px', border: '1px solid rgba(0,217,255,0.1)' }}>
            npx ts-node scripts/seed.ts
          </div>
        </Panel>
      ) : (
        <>
          {/* ── Grouped sections ── */}
          {GROUPS.map(({ label, color, keys }) => {
            const rows = keys.map(k => map[k]).filter(Boolean);
            if (rows.length === 0) return null;

            const biCount = rows.filter(s => KEY_META[s.key]?.bilingual && s.value_id?.trim()).length;
            const biTotal = rows.filter(s => KEY_META[s.key]?.bilingual).length;

            return (
              <div key={label} style={{ marginBottom: 28 }}>
                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.68rem', letterSpacing: '0.16em', textTransform: 'uppercase', color, whiteSpace: 'nowrap' }}>
                    {label}
                  </span>
                  <div style={{ flex: 1, height: 1, background: `${color}22` }} />
                  {biTotal > 0 && (
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.62rem', color: biCount === biTotal ? '#10b981' : '#374151', whiteSpace: 'nowrap' }}>
                      🇮🇩 {biCount}/{biTotal}
                    </span>
                  )}
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.62rem', color: '#374151', whiteSpace: 'nowrap' }}>
                    {rows.length} key{rows.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <Panel style={{ overflow: 'hidden', padding: 0 }}>
                  {rows.map(s => (
                    <SettingRow key={s._id} setting={s} onSave={saveSingle} />
                  ))}
                </Panel>
              </div>
            );
          })}

          {/* ── Other / uncategorized ── */}
          {others.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.68rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#475569', whiteSpace: 'nowrap' }}>
                  Other Settings
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(71,85,105,0.2)' }} />
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.62rem', color: '#374151' }}>
                  {others.length} keys
                </span>
              </div>
              <Panel style={{ overflow: 'hidden', padding: 0 }}>
                {/* header */}
                <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr 90px', gap: 18, padding: '8px 22px', background: '#06091a', borderBottom: '1px solid rgba(0,217,255,0.08)' }}>
                  {['Key', 'Value', ''].map(h => (
                    <div key={h} style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.58rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#374151' }}>{h}</div>
                  ))}
                </div>
                {others.map(s => (
                  <SettingRow key={s._id} setting={s} onSave={saveSingle} />
                ))}
              </Panel>
            </div>
          )}
        </>
      )}
    </>
  );
}