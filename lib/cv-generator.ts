/**
 * lib/cv-generator.ts
 * Inline CV PDF generator — no child_process, no filesystem writes.
 * Works on Vercel serverless. Requires: npm install pdfkit @types/pdfkit
 */

// @ts-ignore
import PDFDocument from 'pdfkit';

// ── Types ─────────────────────────────────────────────────────────────────────
interface CvLabels {
  summary: string; education: string; experience: string;
  certifications: string; projects: string; skills: string;
  techSkills: string; softSkills: string; techStack: string;
  present: string; gpa: string; github: string; demo: string;
}

interface CvOwner {
  name: string; role: string; about: string;
  email: string; phone: string; location: string;
  linkedin: string; gpa: string;
}

interface CvExperience {
  title: string; company: string; location: string;
  start_date: string; end_date: string; is_current: boolean;
  description: string; achievements: string[];
}

interface CvEducation {
  title: string; company: string; location: string;
  start_date: string; end_date: string;
  description: string; achievements: string[];
}

interface CvProject {
  title: string; description: string; shortDescription: string;
  tech_stack: string[]; github_url?: string; demo_url?: string;
  is_featured: boolean;
}

interface CvSkill {
  name: string; category: 'hard' | 'soft'; level?: string | null;
}

interface CvCert {
  name: string; issuer: string; year: string;
}

export interface CvPayload {
  lang: 'en' | 'id';
  labels: CvLabels;
  generated_at: string;
  owner: CvOwner;
  projects: CvProject[];
  skills: CvSkill[];
  experiences: CvExperience[];
  educations: CvEducation[];
  certifications: CvCert[];
}

// ── Constants ─────────────────────────────────────────────────────────────────
const PAGE_W = 612, PAGE_H = 792, M = 58, TW = PAGE_W - M * 2;
const BLACK = '#000000', GRAY = '#555555';
const BODY = 'Times-Roman', BODY_BOLD = 'Times-Bold', BODY_ITALIC = 'Times-Italic';
const MONO = 'Courier', MONO_BOLD = 'Courier-Bold';
const SZ_NAME = 26, SZ_ROLE = 16, SZ_CONTACT = 9.5, SZ_SECTION = 16;
const SZ_ENTRY_T = 11.5, SZ_META = 9.5, SZ_BODY = 10.5, SZ_GPA = 10;

const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_ID = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

function fmtDate(str: string, lang: 'en' | 'id'): string {
  if (!str) return '';
  try {
    const d = new Date(str);
    if (isNaN(d.getTime())) return str;
    const months = lang === 'id' ? MONTHS_ID : MONTHS_EN;
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch { return str; }
}

// ── Main export ───────────────────────────────────────────────────────────────
export function generateCvBuffer(data: CvPayload): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    const doc = new PDFDocument({
      size: 'LETTER',
      margin: M,
      bufferPages: true,
      info: { Title: `CV - ${data.owner?.name || ''}`, Author: data.owner?.name || '' },
    });

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(new Uint8Array(Buffer.concat(chunks))));
    doc.on('error', reject);

    const owner  = data.owner  || {} as CvOwner;
    const labels = data.labels || {
      summary:'PROFESSIONAL SUMMARY', education:'EDUCATION',
      experience:'WORK EXPERIENCE', certifications:'CERTIFICATIONS',
      projects:'SELECTED PROJECTS', skills:'KEY SKILLS',
      techSkills:'Technical Skills', softSkills:'Soft Skills',
      techStack:'Tech Stack', present:'Present',
      gpa:'GPA', github:'GitHub', demo:'Demo',
    };
    const lang = data.lang || 'en';

    // ── Helpers ───────────────────────────────────────────────────────────────

    function ensureSpace(needed: number) {
      if (doc.y + needed > PAGE_H - M) doc.addPage();
    }

    function sectionTitle(label: string) {
      ensureSpace(36);
      doc.moveDown(0.6);
      doc.font(MONO_BOLD).fontSize(SZ_SECTION).fillColor(BLACK)
        .text(label.toUpperCase(), M, doc.y, { width: TW, characterSpacing: 1.2 });
      const lineY = doc.y + 2;
      doc.moveTo(M, lineY).lineTo(M + TW, lineY).lineWidth(1.5).strokeColor(BLACK).stroke();
      doc.moveDown(0.5);
    }

    function para(text: string, opts: { bold?: boolean; size?: number; color?: string; align?: string; gap?: number } = {}) {
      if (!text) return;
      ensureSpace(18);
      doc.font(opts.bold ? BODY_BOLD : BODY)
        .fontSize(opts.size || SZ_BODY)
        .fillColor(opts.color || BLACK)
        .text(text, M, doc.y, { width: TW, align: (opts.align || 'justify') as any });
      doc.moveDown(opts.gap ?? 0.3);
    }

    function bullet(text: string) {
      if (!text?.trim()) return;
      ensureSpace(16);
      const bx = M + 8, tx = M + 20, tw = TW - 20;
      const y = doc.y;
      doc.font(BODY).fontSize(SZ_BODY).fillColor(BLACK).text('•', bx, y, { width: 12, lineBreak: false });
      doc.font(BODY).fontSize(SZ_BODY).fillColor(BLACK).text(text.trim(), tx, y, { width: tw, align: 'justify' });
    }

    function entryHeader(title: string, meta: string, dateRange: string) {
      ensureSpace(52);
      const startY = doc.y;
      doc.font(BODY_BOLD).fontSize(SZ_ENTRY_T).fillColor(BLACK)
        .text(title || '', M, startY, { width: TW - 130 });
      if (meta) {
        doc.font(MONO).fontSize(SZ_META).fillColor(GRAY).text(meta, M, doc.y, { width: TW - 130 });
      }
      const afterLeftY = doc.y;
      if (dateRange) {
        doc.font(MONO).fontSize(SZ_META).fillColor(GRAY)
          .text(dateRange, M, startY, { width: TW, align: 'right', lineBreak: false });
      }
      doc.y = afterLeftY;
      doc.moveDown(0.35);
    }

    // ── HEADER ────────────────────────────────────────────────────────────────
    doc.font(BODY_BOLD).fontSize(SZ_NAME).fillColor(BLACK)
      .text(owner.name || '', M, M, { width: TW, align: 'center' });
    doc.moveDown(0.2);

    if (owner.role) {
      doc.font(BODY_ITALIC).fontSize(SZ_ROLE).fillColor(BLACK)
        .text(owner.role, M, doc.y, { width: TW, align: 'center' });
      doc.moveDown(0.3);
    }

    const contactParts = [
      owner.email, owner.phone, owner.location,
      owner.linkedin ? owner.linkedin.replace(/https?:\/\/(www\.)?/g, '') : '',
      'MIA.dev',
    ].filter(Boolean);

    if (contactParts.length) {
      doc.font(MONO).fontSize(SZ_CONTACT).fillColor(BLACK)
        .text(contactParts.join('  |  '), M, doc.y, { width: TW, align: 'center' });
    }
    doc.moveDown(0.5);

    const divY = doc.y;
    doc.moveTo(M, divY).lineTo(M + TW, divY).lineWidth(2).strokeColor(BLACK).stroke();
    doc.moveDown(0.55);

    // ── SUMMARY ───────────────────────────────────────────────────────────────
    const about = (owner.about || '').trim();
    if (about) {
      sectionTitle(labels.summary);
      about.split(/\n\n+/).forEach(p => {
        p = p.replace(/\n/g, ' ').trim();
        if (p) para(p);
      });
    }

    // ── EDUCATION ─────────────────────────────────────────────────────────────
    if (data.educations?.length) {
      sectionTitle(labels.education);
      data.educations.forEach(edu => {
        const start = fmtDate(edu.start_date, lang);
        const end   = fmtDate(edu.end_date, lang);
        const dateStr = [start, end].filter(Boolean).join(' – ');
        const meta  = [edu.company, edu.location].filter(Boolean).join('  |  ');
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

    // ── WORK EXPERIENCE ───────────────────────────────────────────────────────
    if (data.experiences?.length) {
      sectionTitle(labels.experience);
      data.experiences.forEach(exp => {
        const start   = fmtDate(exp.start_date, lang);
        const end     = exp.is_current ? labels.present : fmtDate(exp.end_date, lang);
        const dateStr = [start, end].filter(Boolean).join(' – ');
        const meta    = [exp.company, exp.location].filter(Boolean).join('  |  ');
        entryHeader(exp.title, meta, dateStr);
        (exp.achievements || []).forEach(a => { if (a.trim()) bullet(a); });
        doc.moveDown(0.55);
      });
    }

    // ── CERTIFICATIONS ────────────────────────────────────────────────────────
    if (data.certifications?.length) {
      sectionTitle(labels.certifications);
      data.certifications.forEach(c => {
        ensureSpace(44);
        const startY = doc.y;
        doc.font(BODY_BOLD).fontSize(SZ_ENTRY_T).fillColor(BLACK)
          .text(c.name || '', M, startY, { width: TW - 70 });
        if (c.issuer) {
          doc.font(MONO).fontSize(SZ_META).fillColor(GRAY).text(c.issuer, M, doc.y, { width: TW - 70 });
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

    // ── SELECTED PROJECTS ─────────────────────────────────────────────────────
    const featProjects = (data.projects || []).filter(p => p.is_featured).slice(0, 5);
    if (featProjects.length) {
      sectionTitle(labels.projects);
      featProjects.forEach(proj => {
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
          const lbl = `${labels.techStack}: `;
          const lw  = doc.font(BODY_BOLD).fontSize(SZ_BODY).widthOfString(lbl);
          doc.font(BODY_BOLD).fontSize(SZ_BODY).fillColor(BLACK).text(lbl, M, doc.y, { continued: true, width: TW });
          doc.font(BODY).fontSize(SZ_BODY).fillColor(BLACK).text(tech.join(', '), { width: TW - lw, align: 'left' });
          doc.moveDown(0.2);
        }
        const links: string[] = [];
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

    // ── KEY SKILLS ────────────────────────────────────────────────────────────
    if (data.skills?.length) {
      sectionTitle(labels.skills);
      const hard = data.skills.filter(s => s.category === 'hard').map(s => s.name);
      const soft = data.skills.filter(s => s.category === 'soft').map(s => s.name);
      if (hard.length) {
        ensureSpace(18);
        const lbl = `${labels.techSkills}: `;
        const lw  = doc.font(BODY_BOLD).fontSize(SZ_BODY).widthOfString(lbl);
        doc.font(BODY_BOLD).fontSize(SZ_BODY).fillColor(BLACK).text(lbl, M, doc.y, { continued: true, width: TW });
        doc.font(BODY).fontSize(SZ_BODY).fillColor(BLACK).text(hard.join(' • '), { width: TW - lw, align: 'justify' });
        doc.moveDown(0.4);
      }
      if (soft.length) {
        ensureSpace(18);
        const lbl = `${labels.softSkills}: `;
        const lw  = doc.font(BODY_BOLD).fontSize(SZ_BODY).widthOfString(lbl);
        doc.font(BODY_BOLD).fontSize(SZ_BODY).fillColor(BLACK).text(lbl, M, doc.y, { continued: true, width: TW });
        doc.font(BODY).fontSize(SZ_BODY).fillColor(BLACK).text(soft.join(' • '), { width: TW - lw, align: 'justify' });
        doc.moveDown(0.4);
      }
    }

    doc.end();
  });
}