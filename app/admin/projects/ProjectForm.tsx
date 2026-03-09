'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, Panel, Btn } from '@/components/AdminLayout';

export interface ProjectFormData {
  _id?:        string;
  title:       string;
  slug:        string;
  categoryId:  string;
  imagePath:   string;
  techStack:   string[];
  githubUrl:   string;
  demoUrl:     string;
  isFeatured:  boolean;
  order:       number;
  completedAt: string;
  // English (primary)
  description:      string;
  shortDescription: string;
  // Indonesian (translation)
  description_id:      string;
  shortDescription_id: string;
  createdAt?: string;
}

interface Category {
  _id:  string;
  name: string;
  slug: string;
}

interface Props {
  initialData?: Partial<ProjectFormData>;
  categories:   Category[];
  mode: 'create' | 'edit';
}

const EMPTY: ProjectFormData = {
  title: '', slug: '', categoryId: '', imagePath: '',
  techStack: [], githubUrl: '', demoUrl: '',
  isFeatured: false, order: 0, completedAt: '',
  description: '', shortDescription: '',
  description_id: '', shortDescription_id: '',
};

function toDateInput(val?: string | null): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

function slugify(str: string) {
  return str.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ── Tech Stack Tag Input ──────────────────────────────────────────────────────
function TagInput({ items, onChange }: { items: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState('');
  const ref = useRef<HTMLInputElement>(null);

  const add = () => {
    const v = draft.trim();
    if (!v || items.includes(v)) return;
    onChange([...items, v]);
    setDraft('');
    ref.current?.focus();
  };
  const remove = (i: number) => onChange(items.filter((_, x) => x !== i));
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); }
    if (e.key === 'Backspace' && !draft && items.length > 0) remove(items.length - 1);
  };

  return (
    <div
      style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 10px', background: '#111633', border: '1px solid #1e2749', minHeight: 42, alignItems: 'center', cursor: 'text' }}
      onClick={() => ref.current?.focus()}
    >
      {items.map((item, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'DM Mono, monospace', fontSize: '0.72rem', padding: '2px 8px', background: 'rgba(0,217,255,0.08)', border: '1px solid rgba(0,217,255,0.25)', color: '#00d9ff' }}>
          {item}
          <button type="button" onClick={() => remove(i)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0, lineHeight: 1, fontSize: '0.9rem' }}
            onMouseOver={e => (e.currentTarget.style.color = '#ef4444')}
            onMouseOut={e  => (e.currentTarget.style.color = '#475569')}>×</button>
        </span>
      ))}
      <input
        ref={ref} value={draft}
        onChange={e => setDraft(e.target.value)} onKeyDown={onKey}
        placeholder={items.length === 0 ? 'Type and press Enter or comma...' : ''}
        style={{ flex: 1, minWidth: 120, background: 'transparent', border: 'none', outline: 'none', color: '#e2e8f0', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem' }}
      />
    </div>
  );
}

// ── Image Input (URL + File Upload) ──────────────────────────────────────────
function ImageInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [tab,       setTab]       = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith('image/')) { setUploadErr('File must be an image.'); return; }
    if (file.size > 5 * 1024 * 1024)    { setUploadErr('Max file size is 5MB.');    return; }

    setUploadErr('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res  = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok || !data.url) {
        setUploadErr(data.error || 'Upload failed.');
      } else {
        onChange(data.url);
        setTab('url'); // Switch to URL tab to show the result
      }
    } catch {
      setUploadErr('Network error during upload.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  // Drag & drop
  const [dragging, setDragging] = useState(false);
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (fileRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileRef.current.files = dt.files;
      fileRef.current.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  return (
    <div>
      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 8 }}>
        {(['url', 'upload'] as const).map(t => (
          <button key={t} type="button"
            onClick={() => setTab(t)}
            style={{
              fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em',
              textTransform: 'uppercase', padding: '5px 14px', border: '1px solid',
              cursor: 'pointer', background: 'transparent', transition: 'all 0.2s',
              borderColor: tab === t ? '#00d9ff' : 'rgba(100,116,139,0.3)',
              color: tab === t ? '#00d9ff' : '#475569',
              backgroundColor: tab === t ? 'rgba(0,217,255,0.08)' : 'transparent',
              marginRight: t === 'url' ? -1 : 0,
              zIndex: tab === t ? 1 : 0,
              position: 'relative',
            }}>
            {t === 'url' ? '🔗 URL' : '📁 Upload'}
          </button>
        ))}
      </div>

      {/* URL tab */}
      {tab === 'url' && (
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://images.unsplash.com/..."
          className="form-input"
          style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.78rem' }}
        />
      )}

      {/* Upload tab */}
      {tab === 'upload' && (
        <div>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => !uploading && fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? '#00d9ff' : 'rgba(0,217,255,0.2)'}`,
              background: dragging ? 'rgba(0,217,255,0.06)' : 'rgba(0,217,255,0.02)',
              padding: '28px 16px',
              textAlign: 'center',
              cursor: uploading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {uploading ? (
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.72rem', color: '#00d9ff' }}>
                Uploading...
              </div>
            ) : (
              <>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🖼️</div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.72rem', color: '#475569', lineHeight: 1.6 }}>
                  Drag & drop or <span style={{ color: '#00d9ff', textDecoration: 'underline' }}>click to browse</span>
                </div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: '#374151', marginTop: 4 }}>
                  JPG, PNG, WebP · max 5MB
                </div>
              </>
            )}
          </div>
          <input
            ref={fileRef} type="file" accept="image/*"
            onChange={handleFile}
            style={{ display: 'none' }}
          />
          {uploadErr && (
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.68rem', color: '#ef4444', marginTop: 6 }}>
              ⚠ {uploadErr}
            </div>
          )}
        </div>
      )}

      {/* Preview */}
      {value && (
        <div style={{ marginTop: 10, position: 'relative' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value} alt="preview"
            style={{ width: '100%', height: 150, objectFit: 'cover', border: '1px solid rgba(0,217,255,0.15)', display: 'block' }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            onLoad={e  => { (e.target as HTMLImageElement).style.display = 'block'; }}
          />
          <button
            type="button" onClick={() => onChange('')}
            style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(239,68,68,0.5)', color: '#ef4444', cursor: 'pointer', padding: '3px 8px', fontFamily: 'DM Mono, monospace', fontSize: '0.65rem' }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
            onMouseOut={e  => (e.currentTarget.style.background = 'rgba(0,0,0,0.7)')}
          >
            ✕ Remove
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Form ─────────────────────────────────────────────────────────────────
export default function ProjectForm({ initialData, categories, mode }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<ProjectFormData>({
    ...EMPTY, ...initialData,
    completedAt: toDateInput(initialData?.completedAt),
    techStack:   initialData?.techStack ?? [],
  });

  const [langTab,   setLangTab]  = useState<'en' | 'id'>('en');
  const [saving,    setSaving]   = useState(false);
  const [error,     setError]    = useState('');
  const [success,   setSuccess]  = useState('');
  const [autoSlug,  setAutoSlug] = useState(mode === 'create');

  const set = <K extends keyof ProjectFormData>(k: K, v: ProjectFormData[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const idFilled = !!(form.description_id || form.shortDescription_id);

  const handleTitleChange = (val: string) => {
    set('title', val);
    if (autoSlug) set('slug', slugify(val));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');

    const payload = {
      title:       form.title.trim(),
      slug:        form.slug.trim(),
      categoryId:  form.categoryId,
      imagePath:   form.imagePath.trim(),
      techStack:   form.techStack.filter(t => t.trim()),
      githubUrl:   form.githubUrl.trim()  || null,
      demoUrl:     form.demoUrl.trim()    || null,
      isFeatured:  form.isFeatured,
      order:       form.order,
      completedAt: form.completedAt       || null,
      description:         form.description.trim(),
      shortDescription:    form.shortDescription.trim(),
      description_id:      form.description_id.trim(),
      shortDescription_id: form.shortDescription_id.trim(),
    };

    const url    = mode === 'create' ? '/api/projects' : `/api/projects/${initialData?._id}`;
    const method = mode === 'create' ? 'POST' : 'PUT';

    try {
      const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong.'); }
      else {
        setSuccess(mode === 'create' ? 'Project created!' : 'Changes saved!');
        setTimeout(() => router.push('/admin/projects'), 800);
      }
    } catch { setError('Network error.'); }
    finally  { setSaving(false); }
  }

  async function handleDelete() {
    if (!confirm('Permanently delete this project?')) return;
    await fetch(`/api/projects/${initialData?._id}`, { method: 'DELETE' });
    router.push('/admin/projects');
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
        .lang-tab { padding:8px 20px; font-family:'DM Mono',monospace; font-size:0.68rem; letter-spacing:0.1em; text-transform:uppercase; border:none; border-bottom:2px solid transparent; background:transparent; cursor:pointer; color:#475569; transition:all 0.2s; }
        .lang-tab:hover:not(.tab-active) { color:#94a3b8; }
        .tab-en { color:#00d9ff; border-bottom-color:#00d9ff; }
        .tab-id { color:#a78bfa; border-bottom-color:#a78bfa; }
        .toggle-track { width:32px; height:16px; border:1px solid rgba(100,116,139,0.3); background:#0a0e27; position:relative; cursor:pointer; transition:border-color 0.2s; flex-shrink:0; }
        .toggle-thumb { position:absolute; top:2px; left:2px; width:10px; height:10px; background:#475569; transition:all 0.2s; }
        .toggle-thumb.on { left:18px; background:#10b981; }
      `}</style>

      <PageHeader
        title={mode === 'create' ? 'New Project' : 'Edit Project'}
        sub={mode === 'edit' && initialData?.title ? initialData.title : 'Add a portfolio project'}
        actions={<Btn href="/admin/projects" variant="ghost">← Back</Btn>}
      />

      {error   && <div className="alert alert-error"   style={{ marginBottom: 20 }}>⚠ {error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: 20 }}>✓ {success}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>

          {/* ── LEFT ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Basic Info */}
            <Panel style={{ padding: 20 }}>
              {panelTitle('Project Details')}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  {lbl('Title', true)}
                  <input value={form.title} onChange={e => handleTitleChange(e.target.value)}
                    placeholder="e.g. Inventory Management System"
                    className="form-input" required />
                </div>
                <div>
                  {lbl('Category', true)}
                  <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)}
                    className="form-input" required
                    style={{ background: '#111633', color: form.categoryId ? '#e2e8f0' : '#64748b' }}>
                    <option value="">Select category...</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Slug */}
              <div style={{ marginBottom: 14 }}>
                {lbl('Slug', true)}
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={form.slug}
                    onChange={e => { setAutoSlug(false); set('slug', e.target.value); }}
                    placeholder="e.g. inventory-management-system"
                    className="form-input" required
                    style={{ flex: 1, fontFamily: 'DM Mono, monospace', fontSize: '0.8rem' }}
                  />
                  <button type="button"
                    onClick={() => { setAutoSlug(true); set('slug', slugify(form.title)); }}
                    style={{ padding: '0 12px', fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', background: 'rgba(0,217,255,0.08)', border: '1px solid rgba(0,217,255,0.2)', color: '#00d9ff', cursor: 'pointer', flexShrink: 0, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    ↺ Auto
                  </button>
                </div>
              </div>

              {/* Image */}
              <div style={{ marginBottom: 14 }}>
                {lbl('Project Image')}
                <ImageInput value={form.imagePath} onChange={v => set('imagePath', v)} />
              </div>

              {/* Tech Stack */}
              <div style={{ marginBottom: 14 }}>
                {lbl('Tech Stack')}
                <TagInput items={form.techStack} onChange={v => set('techStack', v)} />
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: '#374151', marginTop: 6 }}>
                  Press Enter or comma to add. Backspace to remove last.
                </p>
              </div>

              {/* GitHub + Demo */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  {lbl('GitHub URL')}
                  <input value={form.githubUrl} onChange={e => set('githubUrl', e.target.value)}
                    placeholder="https://github.com/..." className="form-input" />
                </div>
                <div>
                  {lbl('Demo URL')}
                  <input value={form.demoUrl} onChange={e => set('demoUrl', e.target.value)}
                    placeholder="https://demo..." className="form-input" />
                </div>
              </div>
            </Panel>

            {/* Content — bilingual tabs */}
            <Panel style={{ overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(0,217,255,0.08)', paddingLeft: 8 }}>
                <button type="button" className={`lang-tab${langTab === 'en' ? ' tab-active tab-en' : ''}`} onClick={() => setLangTab('en')}>
                  🇬🇧 English <span style={{ color: '#00d9ff', marginLeft: 4 }}>*</span>
                </button>
                <button type="button" className={`lang-tab${langTab === 'id' ? ' tab-active tab-id' : ''}`} onClick={() => setLangTab('id')}>
                  🇮🇩 Bahasa Indonesia
                  {idFilled && <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: '#10b981', marginLeft: 6, verticalAlign: 'middle' }} />}
                </button>
                <span style={{ marginLeft: 'auto', marginRight: 16, fontFamily: 'DM Mono, monospace', fontSize: '0.62rem', color: '#374151' }}>
                  {langTab === 'en' ? 'Public pages + CV EN' : 'CV ID only'}
                </span>
              </div>

              <div style={{ padding: 20 }}>
                {langTab === 'en' && (
                  <>
                    <div style={{ padding: '8px 12px', background: 'rgba(0,217,255,0.04)', border: '1px solid rgba(0,217,255,0.1)', fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: '#475569', marginBottom: 16, lineHeight: 1.6 }}>
                      ℹ <strong style={{ color: '#00d9ff' }}>Primary language.</strong> Used on public portfolio pages and English CV.
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      {lbl('Short Description (English)', true)}
                      <input value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)}
                        placeholder="One-line summary shown in project cards..."
                        className="form-input" required />
                    </div>
                    <div>
                      {lbl('Full Description (English)', true)}
                      <textarea value={form.description} onChange={e => set('description', e.target.value)}
                        rows={6} required placeholder="Detailed description of the project..."
                        className="form-input" style={{ resize: 'vertical' }} />
                    </div>
                  </>
                )}

                {langTab === 'id' && (
                  <>
                    <div style={{ padding: '8px 12px', background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.15)', fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: '#475569', marginBottom: 16, lineHeight: 1.6 }}>
                      ℹ <strong style={{ color: '#a78bfa' }}>Terjemahan opsional.</strong> Hanya digunakan untuk CV Bahasa Indonesia. Kosongkan untuk fallback ke English.
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      {lbl('Short Description (Bahasa Indonesia)')}
                      <input value={form.shortDescription_id} onChange={e => set('shortDescription_id', e.target.value)}
                        placeholder="Ringkasan singkat untuk card project..."
                        className="form-input" style={{ borderColor: 'rgba(167,139,250,0.25)' }} />
                    </div>
                    <div>
                      {lbl('Deskripsi Lengkap (Bahasa Indonesia)')}
                      <textarea value={form.description_id} onChange={e => set('description_id', e.target.value)}
                        rows={6} placeholder="Deskripsi detail proyek..."
                        className="form-input" style={{ resize: 'vertical', borderColor: 'rgba(167,139,250,0.25)' }} />
                    </div>
                  </>
                )}
              </div>
            </Panel>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Featured toggle */}
            <Panel style={{ padding: 16 }}>
              {panelTitle('Visibility')}
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <div className="toggle-track"
                  style={{ borderColor: form.isFeatured ? 'rgba(16,185,129,0.5)' : undefined }}
                  onClick={() => set('isFeatured', !form.isFeatured)}>
                  <div className={`toggle-thumb${form.isFeatured ? ' on' : ''}`} />
                </div>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.72rem', color: '#475569' }}>Featured project</span>
              </label>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: '#374151', marginTop: 8 }}>
                Featured projects appear on the home page.
              </p>
            </Panel>

            {/* Order + Date */}
            <Panel style={{ padding: 16 }}>
              <div style={{ marginBottom: 14 }}>
                {lbl('Display Order')}
                <input type="number" min={0} value={form.order}
                  onChange={e => set('order', Number(e.target.value))} className="form-input" />
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: '#374151', marginTop: 6 }}>Lower = appears first.</p>
              </div>
              <div>
                {lbl('Completed At')}
                <input type="date" value={form.completedAt}
                  onChange={e => set('completedAt', e.target.value)} className="form-input" />
              </div>
            </Panel>

            {/* Indonesian translation status */}
            <Panel style={{ padding: 16 }}>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: '#374151', marginBottom: 10 }}>Indonesian translation</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: idFilled ? '#10b981' : '#374151', boxShadow: idFilled ? '0 0 8px rgba(16,185,129,0.5)' : 'none', flexShrink: 0 }} />
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', color: idFilled ? '#34d399' : '#475569' }}>
                  {idFilled ? 'Filled' : 'Not filled (falls back to EN)'}
                </span>
              </div>
              {!idFilled && (
                <button type="button" onClick={() => setLangTab('id')}
                  style={{ marginTop: 10, fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: '#a78bfa', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                  → Add Indonesian version
                </button>
              )}
            </Panel>

            {/* Meta */}
            {mode === 'edit' && initialData?.createdAt && (
              <Panel style={{ padding: 16 }}>
                {[
                  ['Created', new Date(initialData.createdAt).toLocaleDateString('en', { day: '2-digit', month: 'short', year: 'numeric' })],
                  ['ID', String(initialData._id).slice(-8)],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', marginBottom: 6 }}>
                    <span style={{ color: '#374151' }}>{k}</span>
                    <span style={{ color: '#64748b' }}>{v}</span>
                  </div>
                ))}
              </Panel>
            )}

            {/* Save / Delete */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button type="submit" disabled={saving} className="btn btn-primary"
                style={{ justifyContent: 'center', padding: '12px', opacity: saving ? 0.6 : 1 }}>
                <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {saving ? 'Saving...' : mode === 'create' ? 'Save Project' : 'Save Changes'}
              </button>
              {mode === 'edit' && (
                <button type="button" onClick={handleDelete} className="btn btn-danger"
                  style={{ justifyContent: 'center', padding: '10px' }}>
                  Delete Project
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </>
  );
}