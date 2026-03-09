'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, Panel, Btn } from '@/components/AdminLayout';

export interface ExperienceFormData {
  _id?:            string;
  type:            'work' | 'education';
  title:           string;
  company:         string;
  location:        string;
  startDate:       string;
  endDate:         string;
  isCurrent:       boolean;
  // English (primary)
  description:     string;
  achievements:    string[];
  // Indonesian (translation)
  description_id:  string;
  achievements_id: string[];
  order:           number;
  createdAt?:      string;
}

interface Props {
  initialData?: Partial<ExperienceFormData>;
  mode: 'create' | 'edit';
}

const EMPTY: ExperienceFormData = {
  type: 'work', title: '', company: '', location: '',
  startDate: '', endDate: '', isCurrent: false,
  description: '', achievements: [],
  description_id: '', achievements_id: [],
  order: 0,
};

// ── Extracted outside JSX to avoid "as const" parsing error in Turbopack ──
const TYPE_OPTIONS = [
  ['work',      'Work',      '#00d9ff', 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'],
  ['education', 'Education', '#a78bfa', 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z'],
] as const;

function toMonthInput(val?: string | Date | null): string {
  if (!val) return '';
  const d = new Date(val as string);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ── Achievement list ──────────────────────────────────────────────────────
function AchievementList({
  items, onChange, placeholder, accentColor,
}: {
  items: string[]; onChange: (v: string[]) => void;
  placeholder: string; accentColor: string;
}) {
  const [draft, setDraft] = useState('');
  const ref = useRef<HTMLInputElement>(null);

  const add    = () => { const v = draft.trim(); if (!v) return; onChange([...items, v]); setDraft(''); ref.current?.focus(); };
  const remove = (i: number) => onChange(items.filter((_, x) => x !== i));
  const move   = (i: number, dir: -1 | 1) => { const n = [...items]; [n[i], n[i+dir]] = [n[i+dir], n[i]]; onChange(n); };
  const edit   = (i: number, v: string) => { const n = [...items]; n[i] = v; onChange(n); };
  const onKey  = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { e.preventDefault(); add(); } };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input ref={ref} value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={onKey}
          placeholder={placeholder} className="form-input" style={{ flex: 1, fontSize: '0.82rem' }} />
        <button type="button" onClick={add} className="btn btn-primary"
          style={{ padding: '0 16px', flexShrink: 0, fontSize: '0.7rem' }}>+ Add</button>
      </div>

      {items.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map((item, idx) => (
            <div key={idx} className="ach-row"
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', padding: '7px 10px' }}>
              <span style={{ color: accentColor, fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', flexShrink: 0 }}>▸</span>
              <input type="text" value={item} onChange={e => edit(idx, e.target.value)}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#cbd5e1', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', minWidth: 0 }} />
              <div className="ach-controls" style={{ display: 'flex', gap: 2, flexShrink: 0, opacity: 0, transition: 'opacity 0.15s' }}>
                {[[-1,'↑','Move up'],[1,'↓','Move down']].map(([d, icon, title]) => (
                  <button key={String(icon)} type="button"
                    onClick={() => move(idx, d as -1|1)}
                    disabled={d === -1 ? idx === 0 : idx === items.length-1}
                    title={title as string}
                    style={{ padding: 3, background: 'none', border: 'none', cursor: 'pointer', color: '#475569', opacity: (d === -1 ? idx === 0 : idx === items.length-1) ? 0.25 : 1 }}>
                    <svg style={{ width: 11, height: 11 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d === -1 ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                    </svg>
                  </button>
                ))}
                <button type="button" onClick={() => remove(idx)} title="Remove"
                  style={{ padding: 3, background: 'none', border: 'none', cursor: 'pointer', color: '#475569', transition: 'color 0.15s' }}
                  onMouseOver={e => (e.currentTarget.style.color = '#ef4444')}
                  onMouseOut={e  => (e.currentTarget.style.color = '#475569')}>
                  <svg style={{ width: 11, height: 11 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ border: '1px dashed rgba(255,255,255,0.07)', padding: '24px 16px', textAlign: 'center', fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', color: '#374151' }}>
          No achievements yet. Add key wins and metrics above.
        </div>
      )}
    </div>
  );
}

// ── Main Form ─────────────────────────────────────────────────────────────

export default function ExperienceForm({ initialData, mode }: Props) {
  const router = useRouter();
  // Di ExperienceForm, tepat sebelum useState
  console.log('RAW initialData:', JSON.stringify(initialData, null, 2));
  const [form, setForm] = useState<ExperienceFormData>({
    ...EMPTY, ...initialData,
    startDate:       toMonthInput(initialData?.startDate),
    endDate:         toMonthInput(initialData?.endDate),
    isCurrent:       mode === 'edit' ? !initialData?.endDate : false,
    achievements:    initialData?.achievements    ?? [],
    achievements_id: initialData?.achievements_id ?? [],
  });

  const [langTab, setLangTab] = useState<'en' | 'id'>('en');
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  const set = <K extends keyof ExperienceFormData>(k: K, v: ExperienceFormData[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const isWork = form.type === 'work';
  const idFilled = !!(form.description_id || form.achievements_id.some(a => a.trim()));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');

    const payload = {
      type: form.type, title: form.title, company: form.company, location: form.location,
      startDate: form.startDate ? `${form.startDate}-01` : '',
      endDate:   form.isCurrent ? null : (form.endDate ? `${form.endDate}-01` : null),
      description:     form.description,
      achievements:    form.achievements.filter(a => a.trim()),
      description_id:  form.description_id,
      achievements_id: form.achievements_id.filter(a => a.trim()),
      order: form.order,
    };

    const url    = mode === 'create' ? '/api/experiences' : `/api/experiences/${initialData?._id}`;
    const method = mode === 'create' ? 'POST' : 'PUT';

    try {
      const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong.'); }
      else { setSuccess(mode === 'create' ? 'Experience created!' : 'Changes saved!'); setTimeout(() => router.push('/admin/experiences'), 800); }
    } catch { setError('Network error.'); }
    finally  { setSaving(false); }
  }

  async function handleDelete() {
    if (!confirm('Permanently delete this entry?')) return;
    await fetch(`/api/experiences/${initialData?._id}`, { method: 'DELETE' });
    router.push('/admin/experiences');
  }

  const panelTitle = (t: string) => (
    <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#475569', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid rgba(0,217,255,0.06)' }}>
      {t}
    </div>
  );
  const lbl = (text: string, req = false) => (
    <label className="form-label">{text} {req && <span style={{ color: '#00d9ff' }}>*</span>}</label>
  );

  return (
    <>
      <style>{`
        .ach-row:hover .ach-controls { opacity: 1 !important; }
        .type-card { display:flex; align-items:center; gap:8px; padding:8px 16px; border:1px solid rgba(100,116,139,0.25); color:#475569; background:transparent; cursor:pointer; font-family:'DM Mono',monospace; font-size:0.7rem; letter-spacing:0.1em; text-transform:uppercase; transition:all 0.2s; user-select:none; }
        .type-card:hover { border-color:#64748b; color:#94a3b8; }
        .lang-tab { padding:8px 20px; font-family:'DM Mono',monospace; font-size:0.68rem; letter-spacing:0.1em; text-transform:uppercase; border:none; border-bottom:2px solid transparent; background:transparent; cursor:pointer; color:#475569; transition:all 0.2s; }
        .lang-tab:hover:not(.tab-active) { color:#94a3b8; }
        .tab-en { color:#00d9ff; border-bottom-color:#00d9ff; }
        .tab-id { color:#a78bfa; border-bottom-color:#a78bfa; }
        .toggle-track { width:32px; height:16px; border:1px solid rgba(100,116,139,0.3); background:#0a0e27; position:relative; cursor:pointer; transition:border-color 0.2s; flex-shrink:0; }
        .toggle-thumb { position:absolute; top:2px; left:2px; width:10px; height:10px; background:#475569; transition:all 0.2s; }
        .toggle-thumb.on { left:18px; background:#10b981; }
      `}</style>

      <PageHeader
        title={mode === 'create' ? 'New Experience' : 'Edit Experience'}
        sub={mode === 'edit' && initialData?.title ? `${initialData.title} · ${initialData?.company}` : 'Add career or education entry'}
        actions={<Btn href="/admin/experiences" variant="ghost">← Back</Btn>}
      />

      {error   && <div className="alert alert-error"   style={{ marginBottom: 20 }}>⚠ {error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: 20 }}>✓ {success}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>

          {/* ── LEFT ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Entry Details */}
            <Panel style={{ padding: 20 }}>
              {panelTitle('Entry Details')}

              {/* Type */}
              <div style={{ marginBottom: 20 }}>
                {lbl('Type', true)}
                <div style={{ display: 'flex', gap: 10 }}>
                  {TYPE_OPTIONS.map(([val, label, color, d]) => (
                    <label key={val} style={{ cursor: 'pointer' }}>
                      <input type="radio" style={{ display: 'none' }} checked={form.type === val} onChange={() => set('type', val)} />
                      <div className="type-card" style={form.type === val ? { borderColor: color, background: `${color}12`, color } : {}}>
                        <svg style={{ width: 13, height: 13, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
                        </svg>
                        {label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Title + Company */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  {lbl(isWork ? 'Job Title' : 'Degree / Program', true)}
                  <input value={form.title} onChange={e => set('title', e.target.value)}
                    placeholder={isWork ? 'e.g. IT Support Specialist' : 'e.g. S1 Informatics Engineering'}
                    className="form-input" required />
                </div>
                <div>
                  {lbl(isWork ? 'Company' : 'Institution', true)}
                  <input value={form.company} onChange={e => set('company', e.target.value)}
                    placeholder={isWork ? 'e.g. PT Pan Brothers Tbk' : 'e.g. Universitas Muhammadiyah Surakarta'}
                    className="form-input" required />
                </div>
              </div>
              <div>
                {lbl('Location')}
                <input value={form.location} onChange={e => set('location', e.target.value)}
                  placeholder="e.g. Sragen, Central Java" className="form-input" />
              </div>
            </Panel>

            {/* Period */}
            <Panel style={{ padding: 20 }}>
              {panelTitle('Period')}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  {lbl('Start Date', true)}
                  <input type="month" value={form.startDate} onChange={e => set('startDate', e.target.value)} className="form-input" required />
                </div>
                <div>
                  {lbl('End Date')}
                  <input type="month" value={form.isCurrent ? '' : form.endDate}
                    onChange={e => set('endDate', e.target.value)} disabled={form.isCurrent}
                    className="form-input" style={{ opacity: form.isCurrent ? 0.3 : 1, cursor: form.isCurrent ? 'not-allowed' : 'default' }} />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <div className="toggle-track" style={{ borderColor: form.isCurrent ? 'rgba(16,185,129,0.5)' : undefined }}
                  onClick={() => set('isCurrent', !form.isCurrent)}>
                  <div className={`toggle-thumb${form.isCurrent ? ' on' : ''}`} />
                </div>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.72rem', color: '#475569' }}>Currently working / studying here</span>
              </label>
            </Panel>

            {/* Content — bilingual tabs */}
            <Panel style={{ overflow: 'hidden' }}>
              {/* Tab bar */}
              <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(0,217,255,0.08)', paddingLeft: 8 }}>
                <button type="button" className={`lang-tab${langTab === 'en' ? ' tab-active tab-en' : ''}`} onClick={() => setLangTab('en')}>
                  🇬🇧 English <span style={{ color: '#00d9ff', marginLeft: 4 }}>*</span>
                </button>
                <button type="button" className={`lang-tab${langTab === 'id' ? ' tab-active tab-id' : ''}`} onClick={() => setLangTab('id')}>
                  🇮🇩 Bahasa Indonesia
                  {idFilled && <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: '#10b981', marginLeft: 6, verticalAlign: 'middle' }} />}
                </button>
                <span style={{ marginLeft: 'auto', marginRight: 16, fontFamily: 'DM Mono, monospace', fontSize: '0.62rem', color: '#374151' }}>
                  {langTab === 'en' ? 'Used on public pages + CV EN' : 'Used on CV ID only'}
                </span>
              </div>

              <div style={{ padding: 20 }}>
                {/* ── ENGLISH tab (primary, required) ── */}
                {langTab === 'en' && (
                  <>
                    <div style={{ padding: '8px 12px', background: 'rgba(0,217,255,0.04)', border: '1px solid rgba(0,217,255,0.1)', fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: '#475569', marginBottom: 16, lineHeight: 1.6 }}>
                      ℹ This is the <strong style={{ color: '#00d9ff' }}>primary language</strong>. Content here appears on the public website and English CV. Required.
                    </div>
                    <div style={{ marginBottom: 20 }}>
                      {lbl('Description (English)', true)}
                      <textarea value={form.description} onChange={e => set('description', e.target.value)}
                        rows={6} required placeholder="Describe your responsibilities and contributions..."
                        className="form-input" style={{ resize: 'vertical' }} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                        {lbl('Achievements (English)')}
                        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: '#374151' }}>{form.achievements.length} item{form.achievements.length !== 1 ? 's' : ''}</span>
                      </div>
                      <AchievementList items={form.achievements} onChange={v => set('achievements', v)}
                        placeholder="e.g. Handled 40+ support tickets per week..." accentColor="#00d9ff" />
                    </div>
                  </>
                )}

                {/* ── INDONESIAN tab (translation, optional) ── */}
                {langTab === 'id' && (
                  <>
                    <div style={{ padding: '8px 12px', background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.15)', fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: '#475569', marginBottom: 16, lineHeight: 1.6 }}>
                      ℹ <strong style={{ color: '#a78bfa' }}>Terjemahan opsional.</strong> Konten ini hanya digunakan untuk CV Bahasa Indonesia dan CV Preview switcher. Kosongkan untuk fallback ke English.
                    </div>
                    <div style={{ marginBottom: 20 }}>
                      {lbl('Deskripsi (Bahasa Indonesia)')}
                      <textarea value={form.description_id} onChange={e => set('description_id', e.target.value)}
                        rows={6} placeholder="Deskripsikan tanggung jawab dan kontribusi..."
                        className="form-input" style={{ resize: 'vertical', borderColor: 'rgba(167,139,250,0.25)' }} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                        {lbl('Achievements (Bahasa Indonesia)')}
                        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: '#374151' }}>{form.achievements_id.length} item{form.achievements_id.length !== 1 ? 's' : ''}</span>
                      </div>
                      <AchievementList items={form.achievements_id} onChange={v => set('achievements_id', v)}
                        placeholder="Contoh: Menangani 40+ tiket support per minggu..." accentColor="#a78bfa" />
                    </div>
                  </>
                )}
              </div>
            </Panel>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            <Panel style={{ padding: 16 }}>
              {lbl('Display Order')}
              <input type="number" min={0} value={form.order} onChange={e => set('order', Number(e.target.value))} className="form-input" />
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: '#374151', marginTop: 8 }}>Lower = appears first.</p>
            </Panel>

            <Panel style={{ padding: 16 }}>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: '#374151', marginBottom: 8 }}>Current type</div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.875rem', color: '#cbd5e1' }}>
                {form.type === 'work' ? '💼 Work Experience' : '🎓 Education'}
              </div>
            </Panel>

            {/* ID translation status */}
            <Panel style={{ padding: 16 }}>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: '#374151', marginBottom: 10 }}>Indonesian translation</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: idFilled ? '#10b981' : '#374151', boxShadow: idFilled ? '0 0 8px rgba(16,185,129,0.5)' : 'none', flexShrink: 0 }} />
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', color: idFilled ? '#34d399' : '#475569' }}>
                  {idFilled ? 'Filled' : 'Not filled (falls back to EN)'}
                </span>
              </div>
              {!idFilled && (
                <button type="button" onClick={() => setLangTab('id')} style={{ marginTop: 10, fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: '#a78bfa', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                  → Add Indonesian version
                </button>
              )}
            </Panel>

            {mode === 'edit' && initialData?.createdAt && (
              <Panel style={{ padding: 16 }}>
                {[['Created', new Date(initialData.createdAt).toLocaleDateString('en', { day: '2-digit', month: 'short', year: 'numeric' })],
                  ['ID', String(initialData._id).slice(-8)]].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', marginBottom: 6 }}>
                    <span style={{ color: '#374151' }}>{k}</span>
                    <span style={{ color: '#64748b' }}>{v}</span>
                  </div>
                ))}
              </Panel>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button type="submit" disabled={saving} className="btn btn-primary" style={{ justifyContent: 'center', padding: '12px', opacity: saving ? 0.6 : 1 }}>
                <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {saving ? 'Saving...' : mode === 'create' ? 'Save Experience' : 'Save Changes'}
              </button>
              {mode === 'edit' && (
                <button type="button" onClick={handleDelete} className="btn btn-danger" style={{ justifyContent: 'center', padding: '10px' }}>
                  Delete Entry
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </>
  );
}