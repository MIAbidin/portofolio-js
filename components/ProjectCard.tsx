'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────
interface Project {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  techStack: string[];
  githubUrl?: string;
  demoUrl?: string;
  isFeatured: boolean;
  imagePath: string;
  categoryId?: {
    _id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
}

interface ProjectCardProps {
  project: Project;
  index?: number;
  /** Show delay animation based on grid position */
  delay?: number;
}

const cyber = '#00d9ff';
const purple = '#7c3aed';

export default function ProjectCard({ project, index = 0, delay }: ProjectCardProps) {
  const animDelay = delay ?? (index % 3) * 0.08;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: animDelay }}
      style={{
        background: '#151b3b',
        border: '1px solid rgba(0,217,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'border-color 0.3s, transform 0.3s, box-shadow 0.3s',
        position: 'relative',
      }}
      whileHover={{
        y: -4,
        borderColor: 'rgba(0,217,255,0.35)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(0,217,255,0.1)',
      }}
    >
      {/* ── Thumbnail ────────────────────────────────────── */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: '#0d1229', flexShrink: 0 }}>
        {project.imagePath ? (
          <motion.img
            src={project.imagePath}
            alt={project.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.5 }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0d1229, #151b3b)',
          }}>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '3rem', color: 'rgba(0,217,255,0.1)' }}>
              {'{ }'}
            </span>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#1e2747', marginTop: 8, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              No preview
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(10,14,39,0.85), rgba(10,14,39,0.1), transparent)',
          pointerEvents: 'none',
        }} />

        {/* Category badge */}
        {project.categoryId && (
          <span style={{
            position: 'absolute',
            top: 12,
            left: 12,
            fontFamily: 'DM Mono, monospace',
            fontSize: 10,
            background: 'rgba(10,14,39,0.85)',
            border: '1px solid rgba(0,217,255,0.3)',
            color: cyber,
            padding: '3px 8px',
            backdropFilter: 'blur(4px)',
            letterSpacing: '0.05em',
          }}>
            {project.categoryId.name}
          </span>
        )}

        {/* Featured badge */}
        {project.isFeatured && (
          <span style={{
            position: 'absolute',
            top: 12,
            right: 12,
            fontFamily: 'DM Mono, monospace',
            fontSize: 10,
            background: 'rgba(245,158,11,0.12)',
            border: '1px solid rgba(245,158,11,0.3)',
            color: '#f59e0b',
            padding: '3px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            <span style={{ width: 4, height: 4, background: '#f59e0b', borderRadius: '50%' }} />
            Featured
          </span>
        )}

        {/* Hover overlay with quick-action buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            background: 'rgba(10,14,39,0.75)',
            backdropFilter: 'blur(4px)',
          }}
        >
          {/* Detail */}
          <a
            href={`/portfolio/${project.slug}`}
            title="View Detail"
            style={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: cyber,
              color: '#0a0e27',
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#33e5ff')}
            onMouseLeave={e => (e.currentTarget.style.background = cyber)}
          >
            <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </a>

          {/* GitHub */}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              title="GitHub"
              style={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#1e293b',
                color: '#fff',
                textDecoration: 'none',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#334155')}
              onMouseLeave={e => (e.currentTarget.style.background = '#1e293b')}
            >
              <GitHubIcon />
            </a>
          )}

          {/* Demo */}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noreferrer"
              title="Live Demo"
              style={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(124,58,237,0.8)',
                color: '#fff',
                textDecoration: 'none',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = purple)}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.8)')}
            >
              <ExternalLinkIcon />
            </a>
          )}
        </motion.div>
      </div>

      {/* ── Card Body ─────────────────────────────────────── */}
      <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <h3 style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            color: '#fff',
            fontSize: 18,
            marginBottom: 6,
            lineHeight: 1.2,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
          }}>
            {project.title}
          </h3>
          <p style={{
            color: '#64748b',
            fontSize: 13,
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {project.shortDescription || project.description}
          </p>
        </div>

        {/* Tech Stack */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {project.techStack.slice(0, 3).map(tech => (
            <span
              key={tech}
              style={{
                padding: '3px 10px',
                background: 'rgba(0,217,255,0.06)',
                border: '1px solid rgba(0,217,255,0.15)',
                color: cyber,
                fontFamily: 'DM Mono, monospace',
                fontSize: 11,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(0,217,255,0.12)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,217,255,0.35)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(0,217,255,0.06)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,217,255,0.15)';
              }}
            >
              {tech}
            </span>
          ))}
          {project.techStack.length > 3 && (
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#334155', padding: '3px 6px' }}>
              +{project.techStack.length - 3} more
            </span>
          )}
        </div>

        {/* Footer Links */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto',
          paddingTop: 12,
          borderTop: '1px solid rgba(30,39,73,0.8)',
        }}>
          <a
            href={`/portfolio/${project.slug}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontFamily: 'DM Mono, monospace',
              fontSize: 11,
              color: cyber,
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = cyber)}
          >
            Detail
            <svg width={12} height={12} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#334155', transition: 'color 0.2s', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
                onMouseLeave={e => (e.currentTarget.style.color = '#334155')}
                title="GitHub"
              >
                <GitHubIcon size={14} />
              </a>
            )}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#334155', transition: 'color 0.2s', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.color = cyber)}
                onMouseLeave={e => (e.currentTarget.style.color = '#334155')}
                title="Live Demo"
              >
                <ExternalLinkIcon size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

// ── Icon Helpers ──────────────────────────────────────────
function GitHubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function ExternalLinkIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}