#!/usr/bin/env node
/**
 * Generate ATS-friendly CV in PDF format
 * Layout mirrors preview.blade.php exactly:
 *   Header (name, italic role, courier contact | MIA.dev)
 *   → Professional Summary
 *   → Education
 *   → Work Experience
 *   → Certifications  (entry-header style: name bold left, issuer mono gray, year right)
 *   → Selected Projects
 *   → Key Skills
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

const data  = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));
const owner = data.owner || {};

// ── Page geometry ────────────────────────────────────────────────────────────
const PAGE_W = 612;   // LETTER width  (pt)
const PAGE_H = 792;   // LETTER height (pt)
const M      = 58;    // left/right margin  ≈ 1.5 cm
const TW     = PAGE_W - M * 2;  // usable text width

// ── Colours ──────────────────────────────────────────────────────────────────
const BLACK = '#000000';
const GRAY  = '#555555';   // .cv-entry-meta / .cv-entry-date color

// ── Fonts ─────────────────────────────────────────────────────────────────────
// Body  → Times-Roman / Times-Bold / Times-Italic  (= Times New Roman in blade)
// Mono  → Courier / Courier-Bold                   (= Courier New in blade)
const BODY        = 'Times-Roman';
const BODY_BOLD   = 'Times-Bold';
const BODY_ITALIC = 'Times-Italic';
const MONO        = 'Courier';
const MONO_BOLD   = 'Courier-Bold';

// ── Font sizes — calibrated to match blade rem values ────────────────────────
// blade rem base ≈ 16px; 1rem ≈ 12pt in PDF context
const SZ_NAME     = 26;    // 1.9rem  → cv-owner-name
const SZ_ROLE     = 16;    // 0.95rem → cv-owner-role  (italic)
const SZ_CONTACT  = 9.5;   // 0.8rem  → cv-contact (courier)
const SZ_SECTION  = 16;    // 2rem    → cv-section-title (courier bold, letter-spaced)
const SZ_ENTRY_T  = 11.5;  // 0.95rem → cv-entry-title (bold)
const SZ_META     = 9.5;   // 0.78rem → cv-entry-meta / cv-entry-date (courier)
const SZ_BODY     = 10.5;  // 0.85rem → cv-body / cv-bullets
const SZ_GPA      = 10;    // 0.82rem → cv-gpa

// ── Date helper ──────────────────────────────────────────────────────────────
function fmtDate(str) {
  if (!str) return '';
  try {
    const d = new Date(str);
    if (isNaN(d.getTime())) return str;
    const mo = ['Jan','Feb','Mar','Apr','May','Jun',
                'Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${mo[d.getMonth()]} ${d.getFullYear()}`;
  } catch { return str; }
}

// ── Create document ───────────────────────────────────────────────────────────
const doc = new PDFDocument({
  size: 'LETTER',
  margin: M,
  bufferPages: true,
  info: { Title: `CV - ${owner.name || ''}`, Author: owner.name || '' },
});

const out = fs.createWriteStream(outputPath);
doc.pipe(out);

// ── Low-level helpers ─────────────────────────────────────────────────────────

/** Add new page if remaining vertical space is less than `needed` pt. */
function ensureSpace(needed) {
  if (doc.y + needed > PAGE_H - M) doc.addPage();
}

/**
 * Section title — Courier-Bold, 2rem-equivalent, letter-spaced.
 * Underlined with 1.5px solid black (mirrors .cv-section-title border-bottom).
 */
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

/**
 * Body paragraph — Times-Roman, justified (mirrors .cv-body text-align:justify).
 */
function para(text, opts = {}) {
  if (!text) return;
  ensureSpace(18);
  doc.font(opts.bold ? BODY_BOLD : BODY)
     .fontSize(opts.size || SZ_BODY)
     .fillColor(opts.color || BLACK)
     .text(text, M, doc.y, { width: TW, align: opts.align || 'justify' });
  doc.moveDown(opts.gap ?? 0.3);
}

/**
 * Bullet point — "•" + justified text indented.
 * Mirrors .cv-bullets li (flex, gap 0.55rem, justify).
 */
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

/**
 * Entry header — mirrors .cv-entry-header (flex, space-between).
 *   Left col:  cv-entry-title (bold) on line 1
 *              cv-entry-meta  (mono, gray) on line 2
 *   Right col: cv-entry-date  (mono, gray, white-space:nowrap) — stamped at startY
 *
 * Strategy: render left column first → capture afterLeftY →
 *           stamp date with lineBreak:false → restore doc.y = afterLeftY.
 */
function entryHeader(title, meta, dateRange) {
  ensureSpace(52);
  const startY = doc.y;

  // Left: bold title (Times-Bold, cv-entry-title)
  doc.font(BODY_BOLD).fontSize(SZ_ENTRY_T).fillColor(BLACK)
     .text(title || '', M, startY, { width: TW - 130 });

  // Left: meta — Courier, gray (cv-entry-meta)
  if (meta) {
    doc.font(MONO).fontSize(SZ_META).fillColor(GRAY)
       .text(meta, M, doc.y, { width: TW - 130 });
  }

  const afterLeftY = doc.y;  // true bottom of left column

  // Right: date — Courier, gray, right-aligned (cv-entry-date)
  //        lineBreak:false so PDFKit does NOT advance doc.y
  if (dateRange) {
    doc.font(MONO).fontSize(SZ_META).fillColor(GRAY)
       .text(dateRange, M, startY, {
         width:     TW,
         align:     'right',
         lineBreak: false,
       });
  }

  // Restore Y to bottom of left column — bullets must follow the left col
  doc.y = afterLeftY;
  doc.moveDown(0.35);
}

// ══════════════════════════════════════════════════════════════════════════════
// HEADER  — mirrors .cv-header (text-align:center, border-bottom:2px solid #000)
// ══════════════════════════════════════════════════════════════════════════════

// Name — Times-Bold, 26pt, centered
doc.font(BODY_BOLD).fontSize(SZ_NAME).fillColor(BLACK)
   .text(owner.name || '', M, M, { width: TW, align: 'center' });
doc.moveDown(0.2);

// Role — Times-Italic, 12pt, centered
if (owner.role) {
  doc.font(BODY_ITALIC).fontSize(SZ_ROLE).fillColor(BLACK)
     .text(owner.role, M, doc.y, { width: TW, align: 'center' });
  doc.moveDown(0.3);
}

// Contact line — Courier, 9.5pt, centered, pipe-separated  + MIA.dev hardcoded
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

// Thick divider — 2pt (border-b-2 solid black)
const divY = doc.y;
doc.moveTo(M, divY).lineTo(M + TW, divY)
   .lineWidth(2).strokeColor(BLACK).stroke();
doc.moveDown(0.55);

// ══════════════════════════════════════════════════════════════════════════════
// PROFESSIONAL SUMMARY
// ══════════════════════════════════════════════════════════════════════════════
const about = (owner.about || '').trim();
if (about) {
  sectionTitle('Professional Summary');
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
  sectionTitle('Education');

  educations.forEach(edu => {
    const start   = fmtDate(edu.start_date);
    const end     = fmtDate(edu.end_date);
    const dateStr = [start, end].filter(Boolean).join(' \u2013 ');
    const meta    = [edu.company, edu.location].filter(Boolean).join('  |  ');

    entryHeader(edu.title, meta, dateStr);

    if (owner.gpa) {
      doc.font(BODY_BOLD).fontSize(SZ_GPA).fillColor(BLACK)
         .text(`GPA: ${owner.gpa}/4.00`, M, doc.y, { width: TW });
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
  sectionTitle('Work Experience');

  experiences.forEach(exp => {
    const start   = fmtDate(exp.start_date);
    const end     = exp.is_current ? 'Present' : fmtDate(exp.end_date);
    const dateStr = [start, end].filter(Boolean).join(' \u2013 ');
    const meta    = [exp.company, exp.location].filter(Boolean).join('  |  ');

    entryHeader(exp.title, meta, dateStr);

    (exp.achievements || []).forEach(a => { if (a.trim()) bullet(a); });
    doc.moveDown(0.55);
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// CERTIFICATIONS
// Mirrors blade .cv-entry-header style:
//   name  → cv-entry-title (Times-Bold, left)
//   issuer → cv-entry-meta  (Courier, gray, below name)
//   year  → cv-entry-date   (Courier, gray, right-aligned same row as name)
// ══════════════════════════════════════════════════════════════════════════════
const certs = data.certifications || [];
if (certs.length) {
  sectionTitle('Certifications');

  certs.forEach(c => {
    ensureSpace(44);
    const startY = doc.y;

    // Left: cert name — Times-Bold (cv-entry-title)
    doc.font(BODY_BOLD).fontSize(SZ_ENTRY_T).fillColor(BLACK)
       .text(c.name || '', M, startY, { width: TW - 70 });

    // Left: issuer — Courier, gray (cv-entry-meta)
    if (c.issuer) {
      doc.font(MONO).fontSize(SZ_META).fillColor(GRAY)
         .text(c.issuer, M, doc.y, { width: TW - 70 });
    }

    const afterLeftY = doc.y;

    // Right: year — Courier, gray (cv-entry-date), no cursor advance
    if (c.year) {
      doc.font(MONO).fontSize(SZ_META).fillColor(GRAY)
         .text(String(c.year), M, startY, {
           width:     TW,
           align:     'right',
           lineBreak: false,
         });
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
  sectionTitle('Selected Projects');

  projects.forEach(proj => {
    ensureSpace(44);

    // Title — Times-Bold (cv-entry-title used as project heading)
    doc.font(BODY_BOLD).fontSize(SZ_ENTRY_T).fillColor(BLACK)
       .text(proj.title || '', M, doc.y, { width: TW });
    doc.moveDown(0.15);

    // Description — justified body text
    if (proj.description) {
      para(proj.description.replace(/\n/g, ' ').trim(), { gap: 0.2 });
    }

    // Tech Stack — bold label + regular value
    const tech = proj.tech_stack || [];
    if (tech.length) {
      ensureSpace(16);
      const label = 'Tech Stack: ';
      const lw    = doc.font(BODY_BOLD).fontSize(SZ_BODY).widthOfString(label);
      doc.font(BODY_BOLD).fontSize(SZ_BODY).fillColor(BLACK)
         .text(label, M, doc.y, { continued: true, width: TW });
      doc.font(BODY).fontSize(SZ_BODY).fillColor(BLACK)
         .text(tech.join(', '), { width: TW - lw, align: 'left' });
      doc.moveDown(0.2);
    }

    // Links — Courier, gray, left-aligned (cv-project-links)
    const links = [];
    if (proj.github_url) links.push(`GitHub: ${proj.github_url}`);
    if (proj.demo_url)   links.push(`Demo: ${proj.demo_url}`);
    if (links.length) {
      doc.font(MONO).fontSize(SZ_META).fillColor(GRAY)
         .text(links.join('  |  '), M, doc.y, { width: TW, align: 'left' });
      doc.moveDown(0.2);
    }

    doc.moveDown(0.45);
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// KEY SKILLS  — mirrors blade KEY SKILLS section
// ══════════════════════════════════════════════════════════════════════════════
const skills = data.skills || [];
if (skills.length) {
  sectionTitle('Key Skills');

  const hard = skills.filter(s => s.category === 'hard').map(s => s.name);
  const soft = skills.filter(s => s.category === 'soft').map(s => s.name);

  if (hard.length) {
    ensureSpace(18);
    const label = 'Technical Skills: ';
    const lw    = doc.font(BODY_BOLD).fontSize(SZ_BODY).widthOfString(label);
    doc.font(BODY_BOLD).fontSize(SZ_BODY).fillColor(BLACK)
       .text(label, M, doc.y, { continued: true, width: TW });
    doc.font(BODY).fontSize(SZ_BODY).fillColor(BLACK)
       .text(hard.join(' \u2022 '), { width: TW - lw, align: 'justify' });
    doc.moveDown(0.4);
  }

  if (soft.length) {
    ensureSpace(18);
    const label = 'Soft Skills: ';
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
