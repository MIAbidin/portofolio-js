'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import ExperienceForm from '../ExperienceForm';

export default function EditExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router  = useRouter();
  const [data,    setData]    = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    fetch(`/api/experiences/${id}`)
      .then(r => r.json())
      .then(res => { if (res.success) setData(res.data); else setError('Experience not found.'); })
      .catch(() => setError('Failed to load.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{
        fontFamily: 'DM Mono, monospace', fontSize: '0.75rem',
        color: '#475569', padding: '60px 0', textAlign: 'center',
        letterSpacing: '0.1em',
      }}>
        Loading...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <div className="alert alert-error" style={{ marginBottom: 20 }}>
          ⚠ {error || 'Not found'}
        </div>
        <button onClick={() => router.push('/admin/experiences')} className="btn btn-ghost">
          ← Back to Experiences
        </button>
      </div>
    );
  }

  return <ExperienceForm mode="edit" initialData={data} />;
}