'use client';

import { useState, useEffect, useRef } from 'react';
import { PageHeader, Panel, Btn } from '@/components/AdminLayout';

interface Skill {
  _id:              string;
  name:             string;
  category:         'hard' | 'soft';
  subcategory?:     string;
  proficiency:      number;
  icon?:            string;   // icon name / class
  iconPath?:        string;   // uploaded icon URL
  color?:           string;
  yearsExperience?: number;
  order:            number;
  isFeatured:       boolean;
}

interface SkillFormData {
  name:            string;
  category:        'hard' | 'soft';
  subcategory:     string;
  proficiency:     number;
  icon:            string;
  iconPath:        string;
  color:           string;
  yearsExperience: string;
  order:           number;
  isFeatured:      boolean;
}

const EMPTY_FORM: SkillFormData = {
  name: '', category: 'hard', subcategory: '',
  proficiency: 75, icon: '', iconPath: '', color: '',
  yearsExperience: '', order: 0, isFeatured: false,
};

const SUBCATEGORIES = ['Web Dev', 'Programming', 'AI/ML', 'Database', 'Infrastructure', 'Tools', 'Other'];

// ── Proficiency bar ───────────────────────────────────────────────────────────
function ProfBar({ value, color = '#00d9ff' }: { value: number; color?: string }) {
  return (
    <div style={{ position: 'relative', height: 4, background: 'rgba(255,255,255,0.05)', flex: 1, minWidth: 60 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${value}%`, background: color, transition: 'width 0.4s ease' }} />
    </div>
  );
}

// ── Icon in skill row ─────────────────────────────────────────────────────────
function SkillIcon({ skill, size = 20 }: { skill: Skill; size?: number }) {
  if (skill.iconPath) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={skill.iconPath} alt={skill.name}
        style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }}
        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    );
  }
  if (skill.icon) {
    return (
      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: '#374151', flexShrink: 0 }}>
        [{skill.icon}]
      </span>
    );
  }
  return null;
}

// ── Icon Upload Component ─────────────────────────────────────────────────────
function IconUpload({
  iconPath,
  iconName,
  accent,
  onPathChange,
  onNameChange,
}: {
  iconPath:     string;
  iconName:     string;
  accent:       string;
  onPathChange: (v: string) => void;
  onNameChange: (v: string) => void;
}) {
  const [tab,       setTab]       = useState<'upload' | 'name'>(iconPath ? 'upload' : 'name');
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const [dragging,  setDragging]  = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/') && !file.name.toLowerCase().endsWith('.svg')) {
      setUploadErr('Must be an image (PNG, SVG, WebP, etc.)'); return;
    }
    if (file.size > 2 * 1024 * 1024) { setUploadErr('Max file size is 2MB.'); return; }

    setUploadErr(''); setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res  = await fetch('/api/upload?folder=icons', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || !data.url) { setUploadErr(data.error || 'Upload failed.'); return; }
      onPathChange(data.url);
      setTab('upload'); // stay on upload tab to show preview
    } catch { setUploadErr('Network error.'); }
    finally  { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      <label className="form-label">Icon</label>

      {/* Tab switcher */}
      <div style={{ display: 'flex', marginBottom: 8 }}>
        {([['upload', '🖼 Upload File'], ['name', '✏ Name / Class']] as const).map(([t, lbl], i) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            style={{
              flex: 1, fontFamily: 'DM Mono, monospace', fontSize: '0.62rem', letterSpacing: '0.08em',
              textTransform: 'uppercase', padding: '6px 8px', border: '1px solid', cursor: 'pointer',
              transition: 'all 0.2s', background: 'transparent',
              marginRight: i === 0 ? -1 : 0, position: 'relative', zIndex: tab === t ? 1 : 0,
              borderColor:     tab === t ? accent : 'rgba(100,116,139,0.25)',
              color:           tab === t ? accent : '#475569',
              backgroundColor: tab === t ? `${accent}0d` : 'transparent',
            }}>
            {lbl}
          </button>
        ))}
      </div>

      {/* ── Upload tab ── */}
      {tab === 'upload' && (
        <div>
          {iconPath ? (
            /* Preview */
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: '#0d1229', border: `1px solid ${accent}33` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={iconPath} alt="icon"
                style={{ width: 44, height: 44, objectFit: 'contain', background: 'rgba(255,255,255,0.04)', padding: 4, border: '1px solid rgba(255,255,255,0.06)' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {iconPath.split('/').pop()}
                </div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: '#10b981', marginTop: 3 }}>
                  ✓ Uploaded
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <button type="button" onClick={() => fileRef.current?.click()}
                  style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', padding: '3px 9px', border: `1px solid ${accent}44`, color: accent, background: 'transparent', cursor: 'pointer', letterSpacing: '0.06em' }}>
                  Replace
                </button>
                <button type="button" onClick={() => onPathChange('')}
                  style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', padding: '3px 9px', border: '1px solid rgba(239,68,68,0.35)', color: '#ef4444', background: 'transparent', cursor: 'pointer', letterSpacing: '0.06em' }}>
                  Remove
                </button>
              </div>
            </div>
          ) : (
            /* Drop zone */
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => !uploading && fileRef.current?.click()}
              style={{
                border: `2px dashed ${dragging ? accent : `${accent}33`}`,
                background: dragging ? `${accent}08` : 'transparent',
                padding: '22px 16px', textAlign: 'center',
                cursor: uploading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
              }}>
              {uploading ? (
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.72rem', color: accent }}>Uploading...</div>
              ) : (
                <>
                  <div style={{ fontSize: 26, marginBottom: 6 }}>🖼️</div>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.68rem', color: '#475569', lineHeight: 1.5 }}>
                    Drag & drop or{' '}
                    <span style={{ color: accent, textDecoration: 'underline' }}>click to browse</span>
                  </div>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: '#374151', marginTop: 3 }}>
                    PNG · SVG · WebP · max 2MB
                  </div>
                </>
              )}
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*,.svg" onChange={onInputChange} style={{ display: 'none' }} />
          {uploadErr && (
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: '#ef4444', marginTop: 5 }}>⚠ {uploadErr}</div>
          )}
        </div>
      )}

      {/* ── Name tab ── */}
      {tab === 'name' && (
        <div>
          <input
            value={iconName}
            onChange={e => onNameChange(e.target.value)}
            placeholder="e.g. laravel, react, python..."
            className="form-input"
            style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.78rem' }}
          />
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: '#374151', marginTop: 5, lineHeight: 1.5 }}>
            Icon name/class used by your frontend icon library (Devicons, Simple Icons, Lucide, etc.)
          </div>
          {/* Quick preview if name looks like a known icon */}
          {iconName && (
            <div style={{ marginTop: 8, padding: '6px 10px', background: '#0d1229', border: '1px solid rgba(255,255,255,0.04)', fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: '#475569' }}>
              Stored as <span style={{ color: accent }}>{iconName}</span> — rendered by your frontend icon component
            </div>
          )}
        </div>
      )}

      {/* Combined hint */}
      {(iconPath && iconName) && (
        <div style={{ marginTop: 6, fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: '#374151', lineHeight: 1.5 }}>
          ℹ Both set — uploaded image takes priority on the frontend.
        </div>
      )}
    </div>
  );
}

// ── Skill Modal ───────────────────────────────────────────────────────────────
function SkillModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: Skill;
  onSave: (data: SkillFormData) => Promise<void>;
  onClose: () => void;
}) {
  const [form,   setForm]   = useState<SkillFormData>(
    initial ? {
      name:            initial.name,
      category:        initial.category,
      subcategory:     initial.subcategory     ?? '',
      proficiency:     initial.proficiency,
      icon:            initial.icon            ?? '',
      iconPath:        initial.iconPath        ?? '',
      color:           initial.color           ?? '',
      yearsExperience: initial.yearsExperience?.toString() ?? '',
      order:           initial.order,
      isFeatured:      initial.isFeatured,
    } : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const set = <K extends keyof SkillFormData>(k: K, v: SkillFormData[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setSaving(true); setError('');
    try { await onSave(form); onClose(); }
    catch (e: any) { setError(e.message || 'Save failed.'); }
    finally { setSaving(false); }
  }

  const accent = form.category === 'hard' ? '#00d9ff' : '#a78bfa';

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#0a0e27', border: `1px solid ${accent}33`, width: '100%', maxWidth: 520, maxHeight: '92vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${accent}22` }}>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: accent }}>
            {initial ? 'Edit Skill' : 'Add Skill'}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Name */}
          <div>
            <label className="form-label">Skill Name <span style={{ color: accent }}>*</span></label>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="e.g. Laravel" className="form-input" required />
          </div>

          {/* Category toggle */}
          <div>
            <label className="form-label">Category</label>
            <div style={{ display: 'flex' }}>
              {(['hard', 'soft'] as const).map((cat, i) => (
                <button key={cat} type="button" onClick={() => set('category', cat)}
                  style={{
                    flex: 1, fontFamily: 'DM Mono, monospace', fontSize: '0.68rem', letterSpacing: '0.1em',
                    textTransform: 'uppercase', padding: '9px', border: '1px solid', cursor: 'pointer', transition: 'all 0.2s',
                    marginRight: i === 0 ? -1 : 0, position: 'relative', zIndex: form.category === cat ? 1 : 0,
                    borderColor: form.category === cat ? (cat === 'hard' ? '#00d9ff' : '#a78bfa') : 'rgba(100,116,139,0.2)',
                    color:       form.category === cat ? (cat === 'hard' ? '#00d9ff' : '#a78bfa') : '#475569',
                    background:  form.category === cat ? (cat === 'hard' ? 'rgba(0,217,255,0.08)' : 'rgba(167,139,250,0.08)') : 'transparent',
                  }}>
                  {cat === 'hard' ? '⚙ Technical' : '🧠 Soft Skill'}
                </button>
              ))}
            </div>
          </div>

          {/* Subcategory (hard only) */}
          {form.category === 'hard' && (
            <div>
              <label className="form-label">Subcategory</label>
              <select value={form.subcategory} onChange={e => set('subcategory', e.target.value)}
                className="form-input" style={{ background: '#111633', color: form.subcategory ? '#e2e8f0' : '#64748b' }}>
                <option value="">None</option>
                {SUBCATEGORIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          {/* Proficiency slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <label className="form-label" style={{ margin: 0 }}>Proficiency</label>
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.85rem', color: accent, fontWeight: 600 }}>
                {form.proficiency}%
              </span>
            </div>
            <input type="range" min={1} max={100}
              value={form.proficiency}
              onChange={e => set('proficiency', Number(e.target.value))}
              style={{ width: '100%', accentColor: accent }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'DM Mono, monospace', fontSize: '0.57rem', color: '#374151', marginTop: 2 }}>
              <span>Beginner</span><span>Intermediate</span><span>Expert</span>
            </div>
          </div>

          {/* ── Icon upload ── */}
          <IconUpload
            iconPath={form.iconPath}
            iconName={form.icon}
            accent={accent}
            onPathChange={v => set('iconPath', v)}
            onNameChange={v => set('icon', v)}
          />

          {/* Years Exp + Order */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">Years Experience</label>
              <input type="number" min={0} value={form.yearsExperience}
                onChange={e => set('yearsExperience', e.target.value)}
                placeholder="e.g. 3" className="form-input" />
            </div>
            <div>
              <label className="form-label">Display Order</label>
              <input type="number" min={0} value={form.order}
                onChange={e => set('order', Number(e.target.value))} className="form-input" />
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: '#374151', marginTop: 4 }}>Lower = first</p>
            </div>
          </div>

          {/* Featured toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{ width: 32, height: 16, border: `1px solid ${form.isFeatured ? 'rgba(16,185,129,0.5)' : 'rgba(100,116,139,0.3)'}`, background: '#0a0e27', position: 'relative', cursor: 'pointer', transition: 'border-color 0.2s', flexShrink: 0 }}
              onClick={() => set('isFeatured', !form.isFeatured)}>
              <div style={{ position: 'absolute', top: 2, left: form.isFeatured ? 18 : 2, width: 10, height: 10, background: form.isFeatured ? '#10b981' : '#475569', transition: 'all 0.2s' }} />
            </div>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.68rem', color: '#64748b', cursor: 'pointer' }}
              onClick={() => set('isFeatured', !form.isFeatured)}>
              Featured on homepage
            </span>
          </div>

          {error && (
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.68rem', color: '#ef4444' }}>⚠ {error}</div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
            <button type="submit" disabled={saving}
              style={{ flex: 1, fontFamily: 'DM Mono, monospace', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '11px', border: `1px solid ${accent}`, color: accent, background: `${accent}11`, cursor: 'pointer', opacity: saving ? 0.6 : 1, transition: 'all 0.2s' }}>
              {saving ? 'Saving...' : initial ? 'Save Changes' : 'Add Skill'}
            </button>
            <button type="button" onClick={onClose}
              style={{ padding: '11px 18px', fontFamily: 'DM Mono, monospace', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', border: '1px solid rgba(100,116,139,0.3)', color: '#475569', background: 'transparent', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Skill row ─────────────────────────────────────────────────────────────────
function SkillRow({ skill, color, onEdit, onDelete, deleting }: {
  skill:    Skill;
  color:    string;
  onEdit:   () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="skill-row">
      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.68rem', color: '#374151' }}>
        {skill.order}
      </span>

      {/* Icon + Name + badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <SkillIcon skill={skill} size={22} />
        <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.875rem', color: '#e2e8f0', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {skill.name}
        </span>
        {skill.isFeatured && (
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.56rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '1px 6px', border: `1px solid ${color}44`, color, background: `${color}0d`, flexShrink: 0 }}>
            ★ featured
          </span>
        )}
      </div>

      {/* Proficiency bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ProfBar value={skill.proficiency} color={color} />
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color, flexShrink: 0 }}>
          {skill.proficiency}%
        </span>
      </div>

      {/* Years */}
      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: '#475569' }}>
        {skill.yearsExperience ? `${skill.yearsExperience}y` : '—'}
      </span>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
        <button className="act-btn act-btn-ghost" onClick={onEdit}>Edit</button>
        <button className="act-btn act-btn-danger" onClick={onDelete} disabled={deleting}>
          {deleting ? '...' : 'Del'}
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SkillsPage() {
  const [skills,   setSkills]   = useState<Skill[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState<{ open: boolean; skill?: Skill }>({ open: false });
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const res  = await fetch('/api/skills');
      const data = await res.json();
      setSkills(data.data || []);
    } finally { setLoading(false); }
  }

  async function handleSave(form: SkillFormData) {
    const payload = {
      name:            form.name.trim(),
      category:        form.category,
      subcategory:     form.subcategory.trim() || null,
      proficiency:     form.proficiency,
      icon:            form.icon.trim()     || null,
      iconPath:        form.iconPath.trim() || null,
      color:           form.color.trim()    || null,
      yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : null,
      order:           form.order,
      isFeatured:      form.isFeatured,
    };

    const isEdit = !!modal.skill?._id;
    const url    = isEdit ? `/api/skills/${modal.skill!._id}` : '/api/skills';
    const method = isEdit ? 'PUT' : 'POST';

    const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Save failed');

    await fetchAll();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    setDeleting(id);
    await fetch(`/api/skills/${id}`, { method: 'DELETE' });
    setSkills(prev => prev.filter(s => s._id !== id));
    setDeleting(null);
  }

  // Grouping
  const hardSkills = skills.filter(s => s.category === 'hard').sort((a, b) => a.order - b.order);
  const softSkills = skills.filter(s => s.category === 'soft').sort((a, b) => a.order - b.order);

  const hardGrouped = hardSkills.reduce<Record<string, Skill[]>>((acc, s) => {
    const sub = s.subcategory || 'Other';
    if (!acc[sub]) acc[sub] = [];
    acc[sub].push(s);
    return acc;
  }, {});

  const SECTIONS = [
    { key: 'hard' as const, label: 'Technical Skills', color: '#00d9ff', skills: hardSkills },
    { key: 'soft' as const, label: 'Soft Skills',       color: '#a78bfa', skills: softSkills },
  ];

  const total    = skills.length;
  const featured = skills.filter(s => s.isFeatured).length;
  const withIcon = skills.filter(s => s.icon || s.iconPath).length;

  return (
    <>
      <style>{`
        .skill-row { display:grid; grid-template-columns:36px 1fr 130px 52px 88px; gap:12px; align-items:center; padding:11px 16px; border-bottom:1px solid rgba(255,255,255,0.03); transition:background 0.15s; }
        .skill-row:hover { background:rgba(0,217,255,0.025); }
        .skill-row:last-child { border-bottom:none; }
        .skill-th-grid { display:grid; grid-template-columns:36px 1fr 130px 52px 88px; gap:12px; }
        .skill-th { font-family:'DM Mono',monospace; font-size:0.6rem; letter-spacing:0.14em; text-transform:uppercase; color:#374151; padding:8px 16px; border-bottom:1px solid rgba(0,217,255,0.08); background:#06091a; }
        .sub-label { font-family:'DM Mono',monospace; font-size:0.62rem; letter-spacing:0.12em; text-transform:uppercase; color:#374151; padding:6px 16px; background:rgba(255,255,255,0.015); border-bottom:1px solid rgba(255,255,255,0.04); }
        .act-btn { display:inline-flex; align-items:center; padding:4px 10px; font-family:'DM Mono',monospace; font-size:0.63rem; letter-spacing:0.06em; text-transform:uppercase; cursor:pointer; transition:all 0.2s; border:1px solid; background:transparent; }
        .act-btn-ghost { border-color:rgba(100,116,139,0.3); color:#64748b; }
        .act-btn-ghost:hover { border-color:#94a3b8; color:#e2e8f0; }
        .act-btn-danger { border-color:rgba(239,68,68,0.35); color:#ef4444; }
        .act-btn-danger:hover { background:rgba(239,68,68,0.08); }
        .act-btn:disabled { opacity:0.4; cursor:not-allowed; }
      `}</style>

      <PageHeader
        title="Skills"
        sub={`${total} total · ${featured} featured · ${withIcon}/${total} with icon`}
        actions={
          <Btn onClick={() => setModal({ open: true })} variant="primary">
            <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Skill
          </Btn>
        }
      />

      {loading ? (
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: '#475569', padding: '48px 0', textAlign: 'center', letterSpacing: '0.1em' }}>
          Loading...
        </div>
      ) : (
        SECTIONS.map(({ key, label, color, skills: sectionSkills }) => (
          <div key={key} style={{ marginBottom: 32 }}>

            {/* Section divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.16em', textTransform: 'uppercase', color, whiteSpace: 'nowrap' }}>
                {label}
              </span>
              <div style={{ flex: 1, height: 1, background: `${color}22` }} />
              <button
                onClick={() => setModal({ open: true, skill: { category: key, isFeatured: false, order: 0, proficiency: 75 } as any })}
                style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.62rem', color, background: 'none', border: `1px solid ${color}44`, cursor: 'pointer', padding: '3px 10px', letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'all 0.2s' }}
                onMouseOver={e => (e.currentTarget.style.background = `${color}11`)}
                onMouseOut={e  => (e.currentTarget.style.background = 'none')}
              >
                + Add
              </button>
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.62rem', color: '#374151', whiteSpace: 'nowrap' }}>
                {sectionSkills.length} skill{sectionSkills.length !== 1 ? 's' : ''}
              </span>
            </div>

            <Panel style={{ overflow: 'hidden', padding: 0 }}>
              {/* Table header */}
              <div className="skill-th-grid skill-th">
                <div>#</div>
                <div>Skill</div>
                <div>Proficiency</div>
                <div>Yrs</div>
                <div style={{ textAlign: 'right' }}>Actions</div>
              </div>

              {sectionSkills.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', color: '#374151' }}>
                  No {label.toLowerCase()} yet.{' '}
                  <span style={{ color, cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => setModal({ open: true, skill: { category: key } as any })}>
                    Add one
                  </span>
                </div>
              ) : key === 'hard' ? (
                Object.entries(hardGrouped).map(([sub, subSkills]) => (
                  <div key={sub}>
                    <div className="sub-label">{sub}</div>
                    {subSkills.map(skill => (
                      <SkillRow key={skill._id} skill={skill} color={color}
                        onEdit={() => setModal({ open: true, skill })}
                        onDelete={() => handleDelete(skill._id, skill.name)}
                        deleting={deleting === skill._id}
                      />
                    ))}
                  </div>
                ))
              ) : (
                sectionSkills.map(skill => (
                  <SkillRow key={skill._id} skill={skill} color={color}
                    onEdit={() => setModal({ open: true, skill })}
                    onDelete={() => handleDelete(skill._id, skill.name)}
                    deleting={deleting === skill._id}
                  />
                ))
              )}
            </Panel>
          </div>
        ))
      )}

      {/* Modal */}
      {modal.open && (
        <SkillModal
          initial={modal.skill?._id ? modal.skill : undefined}
          onSave={handleSave}
          onClose={() => setModal({ open: false })}
        />
      )}
    </>
  );
}