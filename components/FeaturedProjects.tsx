'use client';

import { useEffect, useState } from 'react';
import ProjectCard from './ProjectCard';

export default function FeaturedProjects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch('/api/projects?featured=true')
      .then(res => res.json())
      .then(data => setProjects(data.data));
  }, []);

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">
          Featured <span className="text-cyber-500">Projects</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project: any) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}