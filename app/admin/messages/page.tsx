'use client';

import { useState, useEffect } from 'react';
import { PageHeader, Panel } from '@/components/AdminLayout';

interface Message {
  _id:         string;
  senderName:  string;
  senderEmail: string;
  subject?:    string;
  message:     string;
  isRead:      boolean;
  createdAt:   string;
}

function fmtDate(d: string) {
  const date = new Date(d);
  const now  = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return date.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
  if (days === 1) return 'Yesterday';
  if (days < 7)  return `${days}d ago`;
  return date.toLocaleDateString('en', { day: '2-digit', month: 'short', year: days > 365 ? 'numeric' : undefined });
}

function fmtDateFull(d: string) {
  return new Date(d).toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const hue = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
      background: `hsl(${hue}, 60%, 20%)`, border: `1px solid hsl(${hue}, 60%, 35%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: `hsl(${hue}, 60%, 70%)`, letterSpacing: '0.05em',
    }}>
      {initials}
    </div>
  );
}

export default function MessagesPage() {
  const [messages,  setMessages]  = useState<Message[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState<Message | null>(null);
  const [filter,    setFilter]    = useState<'all' | 'unread' | 'read'>('all');
  const [checked,   setChecked]   = useState<Set<string>>(new Set());
  const [deleting,  setDeleting]  = useState(false);

  useEffect(() => { fetchAll(); }, []);

  // Auto-mark as read when opened
  useEffect(() => {
    if (selected && !selected.isRead) markRead(selected._id, true);
  }, [selected?._id]);

  async function fetchAll() {
    setLoading(true);
    try {
      const res  = await fetch('/api/messages');
      const data = await res.json();
      setMessages(data.data || []);
    } finally { setLoading(false); }
  }

  async function markRead(id: string, isRead: boolean) {
    await fetch(`/api/messages/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ isRead }),
    });
    setMessages(prev => prev.map(m => m._id === id ? { ...m, isRead } : m));
    if (selected?._id === id) setSelected(prev => prev ? { ...prev, isRead } : null);
  }

  async function deleteOne(id: string) {
    if (!confirm('Delete this message?')) return;
    await fetch(`/api/messages/${id}`, { method: 'DELETE' });
    setMessages(prev => prev.filter(m => m._id !== id));
    if (selected?._id === id) setSelected(null);
    setChecked(prev => { const n = new Set(prev); n.delete(id); return n; });
  }

  async function bulkMarkRead(isRead: boolean) {
    if (checked.size === 0) return;
    await fetch('/api/messages/bulk', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ ids: [...checked], isRead }),
    });
    setMessages(prev => prev.map(m => checked.has(m._id) ? { ...m, isRead } : m));
    if (selected && checked.has(selected._id)) setSelected(prev => prev ? { ...prev, isRead } : null);
    setChecked(new Set());
  }

  async function bulkDelete() {
    if (checked.size === 0) return;
    if (!confirm(`Delete ${checked.size} message(s)?`)) return;
    setDeleting(true);
    await fetch('/api/messages/bulk', {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ ids: [...checked] }),
    });
    setMessages(prev => prev.filter(m => !checked.has(m._id)));
    if (selected && checked.has(selected._id)) setSelected(null);
    setChecked(new Set());
    setDeleting(false);
  }

  function toggleCheck(id: string) {
    setChecked(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function toggleAll() {
    const visible = filtered.map(m => m._id);
    const allChecked = visible.every(id => checked.has(id));
    if (allChecked) setChecked(new Set());
    else setChecked(new Set(visible));
  }

  const sorted   = [...messages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const filtered = sorted.filter(m =>
    filter === 'all'    ? true :
    filter === 'unread' ? !m.isRead :
                          m.isRead
  );

  const total   = messages.length;
  const unread  = messages.filter(m => !m.isRead).length;

  const FILTERS: { key: typeof filter; label: string }[] = [
    { key: 'all',    label: `All (${total})`      },
    { key: 'unread', label: `Unread (${unread})`  },
    { key: 'read',   label: `Read (${total - unread})` },
  ];

  return (
    <>
      <style>{`
        .msg-row { display:flex; align-items:flex-start; gap:12px; padding:13px 16px; border-bottom:1px solid rgba(255,255,255,0.03); cursor:pointer; transition:background 0.15s; }
        .msg-row:hover { background:rgba(0,217,255,0.025); }
        .msg-row.active { background:rgba(0,217,255,0.06) !important; border-left:2px solid #00d9ff; }
        .msg-row.unread .msg-subject { color:#e2e8f0; }
        .msg-row.read   .msg-subject { color:#475569; }
        .filter-tab { font-family:'DM Mono',monospace; font-size:0.65rem; letter-spacing:0.1em; text-transform:uppercase; padding:6px 14px; border:1px solid; cursor:pointer; transition:all 0.2s; background:transparent; }
        .act-btn { display:inline-flex; align-items:center; padding:5px 12px; font-family:'DM Mono',monospace; font-size:0.65rem; letter-spacing:0.08em; text-transform:uppercase; cursor:pointer; transition:all 0.2s; border:1px solid; background:transparent; }
        .act-btn-ghost { border-color:rgba(100,116,139,0.3); color:#64748b; }
        .act-btn-ghost:hover { border-color:#94a3b8; color:#e2e8f0; }
        .act-btn-danger { border-color:rgba(239,68,68,0.35); color:#ef4444; }
        .act-btn-danger:hover { background:rgba(239,68,68,0.08); }
        .act-btn:disabled { opacity:0.4; cursor:not-allowed; }
        .msg-checkbox { width:14px; height:14px; cursor:pointer; accent-color:#00d9ff; flex-shrink:0; margin-top:2px; }
        .unread-dot { width:7px; height:7px; border-radius:50%; background:#00d9ff; box-shadow:0 0 6px rgba(0,217,255,0.6); flex-shrink:0; margin-top:5px; }
        .read-dot   { width:7px; height:7px; flex-shrink:0; }
      `}</style>

      <PageHeader
        title="Messages"
        sub={unread > 0 ? `${unread} unread message${unread !== 1 ? 's' : ''}` : 'All caught up'}
      />

      {/* Filter tabs + bulk actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 0 }}>
          {FILTERS.map(f => (
            <button key={f.key} className="filter-tab"
              onClick={() => { setFilter(f.key); setChecked(new Set()); }}
              style={{
                borderColor: filter === f.key ? '#00d9ff' : 'rgba(100,116,139,0.2)',
                color:       filter === f.key ? '#00d9ff' : '#475569',
                background:  filter === f.key ? 'rgba(0,217,255,0.08)' : 'transparent',
                marginRight: -1, zIndex: filter === f.key ? 1 : 0, position: 'relative',
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Bulk actions */}
        {checked.size > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: '#00d9ff' }}>
              {checked.size} selected
            </span>
            <button className="act-btn act-btn-ghost" onClick={() => bulkMarkRead(true)}>Mark Read</button>
            <button className="act-btn act-btn-ghost" onClick={() => bulkMarkRead(false)}>Mark Unread</button>
            <button className="act-btn act-btn-danger" onClick={bulkDelete} disabled={deleting}>
              {deleting ? '...' : 'Delete'}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: '#475569', padding: '48px 0', textAlign: 'center', letterSpacing: '0.1em' }}>
          Loading...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 16, alignItems: 'start' }}>

          {/* ── Message list ── */}
          <Panel style={{ overflow: 'hidden', padding: 0 }}>
            {/* List header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', background: '#06091a', borderBottom: '1px solid rgba(0,217,255,0.08)' }}>
              <input type="checkbox" className="msg-checkbox"
                checked={filtered.length > 0 && filtered.every(m => checked.has(m._id))}
                onChange={toggleAll}
              />
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#374151' }}>
                {filtered.length} message{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', color: '#374151' }}>
                {filter === 'unread' ? 'No unread messages 🎉' : filter === 'read' ? 'No read messages yet.' : 'No messages yet.'}
              </div>
            ) : filtered.map(msg => (
              <div
                key={msg._id}
                className={`msg-row ${msg.isRead ? 'read' : 'unread'} ${selected?._id === msg._id ? 'active' : ''}`}
                onClick={() => setSelected(msg._id === selected?._id ? null : msg)}
              >
                {/* Checkbox */}
                <input type="checkbox" className="msg-checkbox"
                  checked={checked.has(msg._id)}
                  onClick={e => e.stopPropagation()}
                  onChange={() => toggleCheck(msg._id)}
                />

                {/* Unread dot */}
                <div className={msg.isRead ? 'read-dot' : 'unread-dot'} />

                {/* Avatar */}
                <Avatar name={msg.senderName} />

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem', color: msg.isRead ? '#64748b' : '#e2e8f0', fontWeight: msg.isRead ? 400 : 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {msg.senderName}
                    </span>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.62rem', color: '#374151', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {fmtDate(msg.createdAt)}
                    </span>
                  </div>
                  <div className="msg-subject" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.8rem', fontWeight: msg.isRead ? 400 : 500, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {msg.subject || '(no subject)'}
                  </div>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.66rem', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {msg.message}
                  </div>
                </div>
              </div>
            ))}
          </Panel>

          {/* ── Message detail ── */}
          {selected && (
            <Panel style={{ padding: 0, overflow: 'hidden', position: 'sticky', top: 24 }}>
              {/* Detail header */}
              <div style={{ padding: '14px 20px', background: '#06091a', borderBottom: '1px solid rgba(0,217,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="act-btn act-btn-ghost"
                    onClick={() => markRead(selected._id, !selected.isRead)}>
                    {selected.isRead ? 'Mark Unread' : 'Mark Read'}
                  </button>
                  <button className="act-btn act-btn-danger"
                    onClick={() => deleteOne(selected._id)}>
                    Delete
                  </button>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: '1.1rem', lineHeight: 1, padding: '2px 6px' }}
                  onMouseOver={e => (e.currentTarget.style.color = '#e2e8f0')}
                  onMouseOut={e  => (e.currentTarget.style.color = '#475569')}
                >
                  ×
                </button>
              </div>

              {/* Subject */}
              <div style={{ padding: '20px 20px 0' }}>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem', color: '#e2e8f0', fontWeight: 600, marginBottom: 14, lineHeight: 1.4 }}>
                  {selected.subject || '(no subject)'}
                </div>

                {/* Sender info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: '1px solid rgba(0,217,255,0.06)', borderBottom: '1px solid rgba(0,217,255,0.06)', marginBottom: 20 }}>
                  <Avatar name={selected.senderName} />
                  <div>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.875rem', color: '#e2e8f0', fontWeight: 500 }}>
                      {selected.senderName}
                    </div>
                    <a href={`mailto:${selected.senderEmail}`}
                      style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', color: '#00d9ff', textDecoration: 'none' }}
                      onMouseOver={e => (e.currentTarget.style.textDecoration = 'underline')}
                      onMouseOut={e  => (e.currentTarget.style.textDecoration = 'none')}
                    >
                      {selected.senderEmail}
                    </a>
                  </div>
                  <div style={{ marginLeft: 'auto', fontFamily: 'DM Mono, monospace', fontSize: '0.62rem', color: '#374151', textAlign: 'right', lineHeight: 1.5 }}>
                    {fmtDateFull(selected.createdAt)}
                  </div>
                </div>

                {/* Message body */}
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.75, whiteSpace: 'pre-wrap', paddingBottom: 24 }}>
                  {selected.message}
                </div>
              </div>

              {/* Reply button */}
              <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(0,217,255,0.06)' }}>
                <a
                  href={`mailto:${selected.senderEmail}?subject=Re: ${encodeURIComponent(selected.subject || '')}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'DM Mono, monospace', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 18px', border: '1px solid rgba(0,217,255,0.3)', color: '#00d9ff', background: 'rgba(0,217,255,0.06)', textDecoration: 'none', transition: 'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.background = 'rgba(0,217,255,0.12)'; e.currentTarget.style.borderColor = '#00d9ff'; }}
                  onMouseOut={e  => { e.currentTarget.style.background = 'rgba(0,217,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(0,217,255,0.3)'; }}
                >
                  <svg style={{ width: 12, height: 12 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10l9-7 9 7v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 21V12h6v9" />
                  </svg>
                  Reply via Email
                </a>
              </div>
            </Panel>
          )}
        </div>
      )}
    </>
  );
}