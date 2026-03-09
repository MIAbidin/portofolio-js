'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import ProjectForm from '../ProjectForm';

interface Category {
  _id:  string;
  name: string;
  slug: string;
}

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router  = useRouter();
  const [data,       setData]       = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`/api/projects/${id}`).then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ])
      .then(([pRes, cRes]) => {
        if (pRes.success) {
          setData({
            ...pRes.data,
            categoryId: pRes.data.categoryId?._id || pRes.data.categoryId || '',
          });
        } else {
          setError('Project not found.');
        }
        setCategories(cRes.data || []);
      })
      .catch(() => setError('Failed to load.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: '#475569', padding: '60px 0', textAlign: 'center', letterSpacing: '0.1em' }}>
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
        <button onClick={() => router.push('/admin/projects')} className="btn btn-ghost">
          ← Back to Projects
        </button>
      </div>
    );
  }

  return <ProjectForm mode="edit" initialData={data} categories={categories} />;
}