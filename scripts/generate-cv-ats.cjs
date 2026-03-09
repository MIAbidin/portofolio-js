#!/usr/bin/env node
/**
 * Generate ATS-friendly CV in PDF format — Bilingual (EN / ID)
 *
 * The payload now carries a `labels` object with all section titles,
 * skill headings, and date words in the selected language.
 * The script itself is language-agnostic: it just renders whatever
 * strings are in payload.labels.
 *
 * Usage: node generate-cv-ats.cjs <payload.json> <output.pdf>
 * Requires: npm install pdfkit
 */

'use strict';

const fs          = require('fs');
const PDFDocument = require('pdfkit');

const [,, payloadPath, outputPath] = process.argv;
if (!payloadPath || !outputPath) {
  console.error('Usage: node generate-cv-ats.cjs <payload.json> <output.pdf>');
  process.exit(1);
}

const data   = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));
const owner  = data.owner  || {};
const labels = data.labels || {
  // Fallback to English if labels are not supplied
  summary:        'PROFESSIONAL SUMMARY',
  education:      'EDUCATION',
  experience:     'WORK EXPERIENCE',
  certifications: 'CERTIFICATIONS',
  projects:       'SELECTED PROJECTS',
  skills:         'KEY SKILLS',
  techSkills:     'Technical Skills',
  softSkills:     'Soft Skills',
  techStack:      'Tech Stack',
  present:        'Present',
  gpa:            'GPA',
  github:         'GitHub',
  demo:           'Demo',
};

// ── Page geometry ────────────────────────────────────────────────────────────
const PAGE_W = 612;
const PAGE_H = 792;
const M      = 58;
const TW     = PAGE_W - M * 2;

// ── Colours ──────────────────────────────────────────────────────────────────
const BLACK = '#000000';
const GRAY  = '#555555';

// ── Fonts ─────────────────────────────────────────────────────────────────────
const BODY        = 'Times-Roman';
const BODY_BOLD   = 'Times-Bold';
const BODY_ITALIC = 'Times-Italic';
const MONO        = 'Courier';
const MONO_BOLD   = 'Courier-Bold';

// ── Font sizes ────────────────────────────────────────────────────────────────
const SZ_NAME     = 26;
const SZ_ROLE     = 16;
const SZ_CONTACT  = 9.5;
const SZ_SECTION  = 16;
const SZ_ENTRY_T  = 11.5;
const SZ_META     = 9.5;
const SZ_BODY     = 10.5;
const SZ_GPA      = 10;

// ── Date helper ──────────────────────────────────────────────────────────────
const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_ID = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

function fmtDate(str, lang) {
  if (!str) return '';
  try {
    const d = new Date(str);
    if (isNaN(d.getTime())) return str;
    const months = (lang === 'id') ? MONTHS_ID : MONTHS_EN;
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch { return str; }
}

const lang = data.lang || 'en';

// ── Create document ───────────────────────────────────────────────────────────
const doc = new PDFDocument({
  size:        'LETTER',
  margin:      M,
  bufferPages: true,
  info:        { Title: `CV - ${owner.name || ''}`, Author: owner.name || '' },
});

const out = fs.createWriteStream(outputPath);
doc.pipe(out);

// ── Low-level helpers ─────────────────────────────────────────────────────────

function ensureSpace(needed) {
  if (doc.y + needed > PAGE_H - M) doc.addPage();
}

function sectionTitle(label) {
  ensureSpace(36);
  doc.moveDown(0.6);
  doc.font(MONO_BOLD).fontSize(SZ_SECTION).fillColor(BLACK)
     .text(label.toUpperCase(), M, doc.y, { width: TW, characterSpacing: 1.2 });
  const lineY = doc.y + 2;
  doc.moveTo(M, lineY).lineTo(M + TW, lineY)
     .lineWidth(1.5).strokeColor(BLACK).stroke();
  doc.moveDown(0.5);
}

function para(text, opts = {}) {
  if (!text) return;
  ensureSpace(18);
  doc.font(opts.bold ? BODY_BOLD : BODY)
     .fontSize(opts.size || SZ_BODY)
     .fillColor(opts.color || BLACK)
     .text(text, M, doc.y, { width: TW, align: opts.align || 'justify' });
  doc.moveDown(opts.gap ?? 0.3);
}

function bullet(text) {
  if (!text || !text.trim()) return;
  ensureSpace(16);
  const bx = M + 8;
  const tx = M + 20;
  const tw = TW - 20;
  const y  = doc.y;
  doc.font(BODY).fontSize(SZ_BODY).fillColor(BLACK)
     .text('•', bx, y, { width: 12, lineBreak: false });
  doc.font(BODY).fontSize(SZ_BODY).fillColor(BLACK)
     .text(text.trim(), tx, y, { width: tw, align: 'justify' });
}

function entryHeader(title, meta, dateRange) {
  ensureSpace(52);
  const startY = doc.y;

  doc.font(BODY_BOLD).fontSize(SZ_ENTRY_T).fillColor(BLACK)
     .text(title || '', M, startY, { width: TW - 130 });

  if (meta) {
    doc.font(MONO).fontSize(SZ_META).fillColor(GRAY)
       .text(meta, M, doc.y, { width: TW - 130 });
  }

  const afterLeftY = doc.y;

  if (dateRange) {
    doc.font(MONO).fontSize(SZ_META).fillColor(GRAY)
       .text(dateRange, M, startY, { width: TW, align: 'right', lineBreak: false });
  }

  doc.y = afterLeftY;
  doc.moveDown(0.35);
}

// ══════════════════════════════════════════════════════════════════════════════
// HEADER
// ══════════════════════════════════════════════════════════════════════════════

doc.font(BODY_BOLD).fontSize(SZ_NAME).fillColor(BLACK)
   .text(owner.name || '', M, M, { width: TW, align: 'center' });
doc.moveDown(0.2);

if (owner.role) {
  doc.font(BODY_ITALIC).fontSize(SZ_ROLE).fillColor(BLACK)
     .text(owner.role, M, doc.y, { width: TW, align: 'center' });
  doc.moveDown(0.3);
}

const contactParts = [
  owner.email,
  owner.phone,
  owner.location,
  owner.linkedin ? owner.linkedin.replace(/https?:\/\/(www\.)?/g, '') : '',
  'MIA.dev',
].filter(Boolean);

if (contactParts.length) {
  doc.font(MONO).fontSize(SZ_CONTACT).fillColor(BLACK)
     .text(contactParts.join('  |  '), M, doc.y, { width: TW, align: 'center' });
}
doc.moveDown(0.5);

const divY = doc.y;
doc.moveTo(M, divY).lineTo(M + TW, divY)
   .lineWidth(2).strokeColor(BLACK).stroke();
doc.moveDown(0.55);

// ══════════════════════════════════════════════════════════════════════════════
// PROFESSIONAL SUMMARY
// ══════════════════════════════════════════════════════════════════════════════
const about = (owner.about || '').trim();
if (about) {
  sectionTitle(labels.summary);
  about.split(/\n\n+/).forEach(p => {
    p = p.replace(/\n/g, ' ').trim();
    if (p) para(p);
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// EDUCATION
// ══════════════════════════════════════════════════════════════════════════════
const educations = data.educations || [];
if (educations.length) {
  sectionTitle(labels.education);

  educations.forEach(edu => {
    const start   = fmtDate(edu.start_date, lang);
    const end     = fmtDate(edu.end_date,   lang);
    const dateStr = [start, end].filter(Boolean).join(' \u2013 ');
    const meta    = [edu.company, edu.location].filter(Boolean).join('  |  ');

    entryHeader(edu.title, meta, dateStr);

    if (owner.gpa) {
      doc.font(BODY_BOLD).fontSize(SZ_GPA).fillColor(BLACK)
         .text(`${labels.gpa}: ${owner.gpa}/4.00`, M, doc.y, { width: TW });
      doc.moveDown(0.2);
    }

    (edu.achievements || []).forEach(a => { if (a.trim()) bullet(a); });
    doc.moveDown(0.55);
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// WORK EXPERIENCE
// ══════════════════════════════════════════════════════════════════════════════
const experiences = data.experiences || [];
if (experiences.length) {
  sectionTitle(labels.experience);

  experiences.forEach(exp => {
    const start   = fmtDate(exp.start_date, lang);
    const end     = exp.is_current ? labels.present : fmtDate(exp.end_date, lang);
    const dateStr = [start, end].filter(Boolean).join(' \u2013 ');
    const meta    = [exp.company, exp.location].filter(Boolean).join('  |  ');

    entryHeader(exp.title, meta, dateStr);

    (exp.achievements || []).forEach(a => { if (a.trim()) bullet(a); });
    doc.moveDown(0.55);
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// CERTIFICATIONS
// ══════════════════════════════════════════════════════════════════════════════
const certs = data.certifications || [];
if (certs.length) {
  sectionTitle(labels.certifications);

  certs.forEach(c => {
    ensureSpace(44);
    const startY = doc.y;

    doc.font(BODY_BOLD).fontSize(SZ_ENTRY_T).fillColor(BLACK)
       .text(c.name || '', M, startY, { width: TW - 70 });

    if (c.issuer) {
      doc.font(MONO).fontSize(SZ_META).fillColor(GRAY)
         .text(c.issuer, M, doc.y, { width: TW - 70 });
    }

    const afterLeftY = doc.y;

    if (c.year) {
      doc.font(MONO).fontSize(SZ_META).fillColor(GRAY)
         .text(String(c.year), M, startY, { width: TW, align: 'right', lineBreak: false });
    }

    doc.y = afterLeftY;
    doc.moveDown(0.5);
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SELECTED PROJECTS
// ══════════════════════════════════════════════════════════════════════════════
const projects = (data.projects || []).filter(p => p.is_featured).slice(0, 5);
if (projects.length) {
  sectionTitle(labels.projects);

  projects.forEach(proj => {
    ensureSpace(44);

    doc.font(BODY_BOLD).fontSize(SZ_ENTRY_T).fillColor(BLACK)
       .text(proj.title || '', M, doc.y, { width: TW });
    doc.moveDown(0.15);

    if (proj.description) {
      para(proj.description.replace(/\n/g, ' ').trim(), { gap: 0.2 });
    }

    const tech = proj.tech_stack || [];
    if (tech.length) {
      ensureSpace(16);
      const label = `${labels.techStack}: `;
      const lw    = doc.font(BODY_BOLD).fontSize(SZ_BODY).widthOfString(label);
      doc.font(BODY_BOLD).fontSize(SZ_BODY).fillColor(BLACK)
         .text(label, M, doc.y, { continued: true, width: TW });
      doc.font(BODY).fontSize(SZ_BODY).fillColor(BLACK)
         .text(tech.join(', '), { width: TW - lw, align: 'left' });
      doc.moveDown(0.2);
    }

    const links = [];
    if (proj.github_url) links.push(`${labels.github}: ${proj.github_url}`);
    if (proj.demo_url)   links.push(`${labels.demo}: ${proj.demo_url}`);
    if (links.length) {
      doc.font(MONO).fontSize(SZ_META).fillColor(GRAY)
         .text(links.join('  |  '), M, doc.y, { width: TW, align: 'left' });
      doc.moveDown(0.2);
    }

    doc.moveDown(0.45);
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// KEY SKILLS
// ══════════════════════════════════════════════════════════════════════════════
const skills = data.skills || [];
if (skills.length) {
  sectionTitle(labels.skills);

  const hard = skills.filter(s => s.category === 'hard').map(s => s.name);
  const soft = skills.filter(s => s.category === 'soft').map(s => s.name);

  if (hard.length) {
    ensureSpace(18);
    const label = `${labels.techSkills}: `;
    const lw    = doc.font(BODY_BOLD).fontSize(SZ_BODY).widthOfString(label);
    doc.font(BODY_BOLD).fontSize(SZ_BODY).fillColor(BLACK)
       .text(label, M, doc.y, { continued: true, width: TW });
    doc.font(BODY).fontSize(SZ_BODY).fillColor(BLACK)
       .text(hard.join(' \u2022 '), { width: TW - lw, align: 'justify' });
    doc.moveDown(0.4);
  }

  if (soft.length) {
    ensureSpace(18);
    const label = `${labels.softSkills}: `;
    const lw    = doc.font(BODY_BOLD).fontSize(SZ_BODY).widthOfString(label);
    doc.font(BODY_BOLD).fontSize(SZ_BODY).fillColor(BLACK)
       .text(label, M, doc.y, { continued: true, width: TW });
    doc.font(BODY).fontSize(SZ_BODY).fillColor(BLACK)
       .text(soft.join(' \u2022 '), { width: TW - lw, align: 'justify' });
    doc.moveDown(0.4);
  }
}

// ── Finalize ──────────────────────────────────────────────────────────────────
doc.end();
out.on('finish', () => console.log(`CV generated: ${outputPath}`));
out.on('error',  err => { console.error(err); process.exit(1); });
