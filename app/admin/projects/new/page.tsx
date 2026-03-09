'use client';

import { useState, useEffect } from 'react';
import ProjectForm from '../ProjectForm';

interface Category {
  _id:  string;
  name: string;
  slug: string;
}

export default function NewProjectPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(res => { setCategories(res.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: '#475569', padding: '60px 0', textAlign: 'center', letterSpacing: '0.1em' }}>
        Loading...
      </div>
    );
  }

  return <ProjectForm mode="create" categories={categories} />;
}