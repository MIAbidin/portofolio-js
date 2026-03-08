'use client';

import { motion } from 'framer-motion';
import { Download, Github, Linkedin } from 'lucide-react';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-cyber-500">Full Stack</span>{' '}
            <span className="text-white">Developer</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 mb-8">
            Building digital experiences with modern technologies
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/portfolio"
              className="px-8 py-3 bg-cyber-500 text-navy-900 rounded-lg font-semibold hover:bg-cyber-400 transition-colors"
            >
              View Projects
            </Link>
            
            <Link
              href="/download-cv"
              className="px-8 py-3 bg-navy-700 text-white rounded-lg font-semibold hover:bg-navy-600 transition-colors flex items-center gap-2"
            >
              <Download size={20} />
              Download CV
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex gap-4 justify-center mt-8">
            <a href="https://github.com" target="_blank" className="text-gray-400 hover:text-cyber-500">
              <Github size={24} />
            </a>
            <a href="https://linkedin.com" target="_blank" className="text-gray-400 hover:text-cyber-500">
              <Linkedin size={24} />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}