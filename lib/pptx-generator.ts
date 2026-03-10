/**
 * lib/pptx-generator.ts
 * Inline Portfolio PPTX generator — no child_process, no filesystem writes.
 * Works on Vercel serverless. Requires: npm install pptxgenjs
 */

// @ts-ignore
import pptxgen from 'pptxgenjs';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface PptxPayload {
  generated_at: string;
  owner: {
    name: string; role: string; about: string;
    email: string; phone: string; location: string;
    github: string; linkedin: string; instagram?: string; gpa: string;
  };
  projects: {
    id: string; title: string; description: string;
    category: string; tech_stack: string[];
    github_url?: string; demo_url?: string; is_featured: boolean;
  }[];
  skills: { name: string; category: string; level?: string | null }[];
  experiences: {
    title: string; company: string; location: string;
    start_date: string; end_date: string; is_current: boolean; description: string;
  }[];
  educations: {
    title: string; company: string; location: string;
    start_date: string; end_date: string; description: string;
  }[];
  certifications: { name: string; issuer: string; year: string }[];
}

// ── Constants ─────────────────────────────────────────────────────────────────
const C = {
  bg:'080D26', bgCard:'0F1535', bgDeep:'060B1F',
  cyber:'00D9FF', purple:'7C3AED', green:'10B981',
  white:'FFFFFF', offWhite:'E2E8F0', slate:'94A3B8',
  slateDeep:'475569', yellow:'F59E0B', red:'EF4444',
};
const ACCENTS = [C.cyber, C.purple, C.green, C.yellow, C.red, C.cyber, C.purple, C.green];

// pptxgenjs shape name constants (string literals — avoids pres.shapes TS error)
const RECT = 'rect';
const OVAL = 'ellipse';

function shadow() {
  return { type: 'outer' as const, blur:10, offset:3, angle:135, color:'000000', opacity:0.25 };
}
function trunc(str: string, max: number): string {
  if (!str) return '';
  return str.length > max ? str.substring(0, max - 1) + '…' : str;
}
function fmtDate(d: string): string {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('id-ID', { month:'short', year:'numeric' }); }
  catch { return d; }
}
function chip(s: any, text: string, x: number, y: number, w = 1.7) {
  s.addShape(RECT, { x, y, w, h:0.22, fill:{color:C.cyber,transparency:85}, line:{color:C.cyber,width:0.5} });
  s.addText(text, { x, y, w, h:0.22, fontSize:7, fontFace:'Consolas', color:C.cyber, align:'center', valign:'middle', bold:true, charSpacing:2, margin:0 });
}
function rule(s: any, x: number, y: number, w: number, color = C.cyber, tr = 70) {
  s.addShape(RECT, { x, y, w, h:0.015, fill:{color,transparency:tr}, line:{color,width:0} });
}
function dots(s: any, cols: number, rows: number, x0: number, y0: number, gx: number, gy: number, color = C.cyber, tr = 88) {
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++)
      s.addShape(OVAL, { x:x0+i*gx, y:y0+j*gy, w:0.025, h:0.025, fill:{color,transparency:tr}, line:{color,width:0} });
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function generatePptxBuffer(payload: PptxPayload): Promise<Uint8Array> {
  const brandName   = 'Portfolio';
  const generatedAt = payload.generated_at || new Date().toLocaleDateString('id-ID');
  const owner       = payload.owner || {} as PptxPayload['owner'];
  const projects    = payload.projects || [];
  const skills      = payload.skills || [];
  const experiences = payload.experiences || [];
  const educations  = payload.educations || [];
  const certs       = payload.certifications || [];

  const ownerName     = owner.name     || brandName;
  const ownerRole     = owner.role     || 'IT Support & Developer';
  const statProjects  = `${projects.length}+`;
  const statExpYears  = experiences.length > 0 ? `${Math.max(1, Math.floor((Date.now() - new Date(experiences[experiences.length-1].start_date).getTime()) / (1000*60*60*24*365)))}+` : '2+';
  const statGpa       = owner.gpa || '3.83';
  const statCerts     = `${certs.length > 0 ? certs.length : 4}+`;
  const hardSkills    = skills.filter(s => s.category === 'hard').map(s => s.name);
  const softSkills    = skills.filter(s => s.category === 'soft').map(s => s.name);

  const pres = new pptxgen();
  pres.layout  = 'LAYOUT_16x9';
  pres.author  = ownerName;
  pres.title   = `${brandName} — Portfolio`;
  pres.subject = `Portfolio Presentation — ${generatedAt}`;

  // ══ SLIDE 1 — COVER ═══════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    dots(s, 20, 12, 0, 0, 0.53, 0.5);

    s.addShape(RECT, { x:0,    y:0, w:0.08, h:5.625, fill:{color:C.cyber},                  line:{color:C.cyber,width:0} });
    s.addShape(RECT, { x:0.08, y:0, w:0.04, h:5.625, fill:{color:C.purple,transparency:60}, line:{color:C.purple,width:0} });

    const TX=6.3, TY=0.55, TW=3.45, TH=4.65;
    s.addShape(RECT, { x:TX,y:TY,w:TW,h:TH,fill:{color:C.cyber,transparency:96},line:{color:C.cyber,width:0.5} });
    s.addShape(RECT, { x:TX+0.15,y:TY+0.16,w:TW-0.3,h:TH-0.32,fill:{color:C.purple,transparency:97},line:{color:C.purple,width:0.3} });

    [[0.18,'EF4444'],[0.33,C.yellow],[0.48,C.green]].forEach(([dx,c]: any) =>
      s.addShape(OVAL, { x:TX+dx,y:TY+0.1,w:0.1,h:0.1,fill:{color:c},line:{color:c,width:0} })
    );
    s.addText('portfolio.sh', { x:TX+0.18,y:TY+0.08,w:TW-0.36,h:0.16,fontSize:6.5,fontFace:'Consolas',color:C.slateDeep,align:'right',margin:0 });
    s.addShape(RECT, { x:TX+0.15,y:TY+0.26,w:TW-0.3,h:0.01,fill:{color:C.cyber,transparency:70},line:{color:C.cyber,width:0} });

    const termLines = [
      {t:'$ whoami',c:C.slateDeep,b:false},{t:`> ${ownerName}`,c:C.white,b:false},{t:'',c:C.slateDeep,b:false},
      {t:'$ cat role.txt',c:C.slateDeep,b:false},{t:`> ${ownerRole}`,c:C.green,b:false},{t:'',c:C.slateDeep,b:false},
      {t:'$ echo $STATUS',c:C.slateDeep,b:false},{t:'> AVAILABLE FOR HIRE',c:C.green,b:true},{t:'',c:C.slateDeep,b:false},
      {t:'$ git log --oneline',c:C.slateDeep,b:false},
      {t:`> ${statProjects} projects committed`,c:C.cyber,b:false},
      {t:`> ${statExpYears} years experience`,c:C.cyber,b:false},
      ...(statGpa ? [{t:`> GPA: ${statGpa}/4.00`,c:C.cyber,b:false}] : []),
    ];
    s.addText(
      termLines.map((l,i) => ({ text:l.t, options:{ breakLine:i<termLines.length-1, color:l.c, bold:l.b } })),
      { x:TX+0.2,y:TY+0.34,w:TW-0.4,h:TH-0.48,fontSize:8.5,fontFace:'Consolas',valign:'top' }
    );

    s.addShape(RECT, { x:0.28,y:0.3,w:1.9,h:0.26,fill:{color:C.green,transparency:88},line:{color:C.green,width:0.5} });
    s.addShape(OVAL,      { x:0.38,y:0.39,w:0.09,h:0.09,fill:{color:C.green},line:{color:C.green,width:0} });
    s.addText('AVAILABLE FOR HIRE', { x:0.51,y:0.3,w:1.64,h:0.26,fontSize:7,fontFace:'Consolas',color:C.green,bold:true,valign:'middle',charSpacing:1,margin:0 });

    const parts = ownerName.split(' ');
    s.addText(parts[0]||ownerName,      { x:0.23,y:0.66,w:5.9,h:0.82,fontSize:50,fontFace:'Arial Black',color:C.white,bold:true,margin:0 });
    if (parts.slice(1).join(' '))
      s.addText(parts.slice(1).join(' '),{ x:0.23,y:1.44,w:5.9,h:0.82,fontSize:50,fontFace:'Arial Black',color:C.cyber,bold:true,margin:0 });

    s.addText(ownerRole, { x:0.23,y:2.34,w:5.9,h:0.28,fontSize:12,fontFace:'Consolas',color:C.slate,charSpacing:1,margin:0 });
    rule(s,0.23,2.69,5.9,C.cyber,65);

    const facts = [
      owner.location ? `📍  ${owner.location}` : null,
      statGpa        ? `⭐  GPA: ${statGpa}` : null,
      experiences.length>0 ? `🏢  ${experiences[0].title} @ ${experiences[0].company}` : null,
      educations.length>0  ? `🎓  ${educations[0].title} — ${trunc(educations[0].company,38)}` : null,
    ].filter(Boolean) as string[];
    facts.slice(0,4).forEach((f,i) =>
      s.addText(f, { x:0.23,y:2.82+i*0.3,w:5.9,h:0.26,fontSize:9.5,fontFace:'Calibri',color:C.offWhite,margin:0 })
    );

    s.addShape(RECT, { x:0,y:5.245,w:10,h:0.38,fill:{color:C.bgCard},line:{color:C.bgCard,width:0} });
    s.addShape(RECT, { x:0,y:5.24,w:10,h:0.015,fill:{color:C.cyber,transparency:55},line:{color:C.cyber,width:0} });
    const cParts = [
      owner.email    ? `✉  ${owner.email}` : null,
      owner.phone    ? `📱 ${owner.phone}` : null,
      owner.github   ? `🐙 ${owner.github.replace(/https?:\/\//,'')}` : null,
      owner.linkedin ? `💼 ${owner.linkedin.replace(/https?:\/\//,'')}` : null,
    ].filter(Boolean) as string[];
    s.addText(cParts.join('   |   '), { x:0.2,y:5.245,w:9.6,h:0.38,fontSize:7.5,fontFace:'Consolas',color:C.slate,align:'center',valign:'middle' });
  }

  // ══ SLIDE 2 — ABOUT ═══════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };

    s.addShape(RECT, { x:0,y:0,w:3.85,h:5.625,fill:{color:C.bgCard},line:{color:C.bgCard,width:0} });
    s.addShape(RECT, { x:3.85,y:0,w:0.02,h:5.625,fill:{color:C.cyber,transparency:70},line:{color:C.cyber,width:0} });
    chip(s,'ABOUT ME',0.2,0.22);

    s.addShape(RECT, { x:0.2,y:0.55,w:3.45,h:4.65,fill:{color:C.bg},line:{color:C.cyber,width:0.3},shadow:shadow() });
    s.addShape(RECT, { x:0.2,y:0.55,w:3.45,h:0.05,fill:{color:C.cyber},line:{color:C.cyber,width:0} });

    s.addShape(OVAL, { x:1.2,y:0.72,w:1.45,h:1.45,fill:{color:C.cyber,transparency:88},line:{color:C.cyber,width:1.2} });
    const ini = ownerName.split(' ').map((w: string) => w[0]).join('').substring(0,3).toUpperCase();
    s.addText(ini, { x:1.2,y:0.72,w:1.45,h:1.45,fontSize:28,fontFace:'Arial Black',color:C.cyber,align:'center',valign:'middle',bold:true,margin:0 });
    s.addText(ownerName, { x:0.25,y:2.27,w:3.35,h:0.3,fontSize:11,fontFace:'Calibri',color:C.white,align:'center',bold:true,margin:0 });
    s.addText(ownerRole, { x:0.25,y:2.57,w:3.35,h:0.25,fontSize:8.5,fontFace:'Consolas',color:C.cyber,align:'center',margin:0 });
    rule(s,0.35,2.86,3.15,C.slateDeep,50);

    const cItems = [
      owner.email    ? {icon:'✉',  val:owner.email} : null,
      owner.phone    ? {icon:'📱', val:owner.phone} : null,
      owner.location ? {icon:'📍', val:owner.location} : null,
      owner.github   ? {icon:'🐙', val:owner.github.replace(/https?:\/\//,'')} : null,
      owner.linkedin ? {icon:'💼', val:owner.linkedin.replace(/https?:\/\//,'')} : null,
    ].filter(Boolean) as {icon:string,val:string}[];
    cItems.slice(0,5).forEach((c,i) =>
      s.addText(`${c.icon}  ${c.val}`, { x:0.32,y:2.97+i*0.33,w:3.25,h:0.29,fontSize:7.5,fontFace:'Consolas',color:C.slate,margin:0 })
    );

    s.addShape(RECT, { x:0.55,y:4.9,w:2.75,h:0.24,fill:{color:C.green,transparency:88},line:{color:C.green,width:0.5} });
    s.addText('Open to Opportunities', { x:0.8,y:4.9,w:2.4,h:0.24,fontSize:8,fontFace:'Consolas',color:C.green,valign:'middle',bold:true,margin:0 });

    chip(s,'PROFILE',4.1,0.22);
    s.addText('About Me', { x:4.1,y:0.5,w:5.65,h:0.5,fontSize:28,fontFace:'Arial Black',color:C.white,bold:true,margin:0 });
    rule(s,4.1,1.06,5.65,C.cyber,60);

    const bio = owner.about || `${ownerName} adalah seorang ${ownerRole}.`;
    s.addText(bio, { x:4.1,y:1.16,w:5.65,h:3.15,fontSize:9.5,fontFace:'Calibri',color:C.slate,valign:'top',lineSpacingMultiple:1.3,margin:0 });

    const SW=1.28, SG=0.11, STOTAL=4*SW+3*SG;
    const SX0 = 4.1 + (5.65-STOTAL)/2;
    const SY  = 5.625 - 0.14 - 1.0;
    [
      {val:statProjects,lbl:'PROJECTS',color:C.cyber },
      {val:statExpYears,lbl:'YRS EXP', color:C.purple},
      {val:statGpa,     lbl:'GPA',     color:C.green },
      {val:statCerts,   lbl:'CERTS',   color:C.yellow},
    ].forEach((st,i) => {
      const x = SX0 + i*(SW+SG);
      s.addShape(RECT, { x,y:SY,w:SW,h:1.0,fill:{color:C.bgCard},line:{color:st.color,width:0.5},shadow:shadow() });
      s.addShape(RECT, { x,y:SY,w:SW,h:0.04,fill:{color:st.color,transparency:40},line:{color:st.color,width:0} });
      s.addText(String(st.val), { x,y:SY+0.07,w:SW,h:0.52,fontSize:24,fontFace:'Arial Black',color:st.color,align:'center',bold:true,margin:0 });
      s.addText(st.lbl,         { x,y:SY+0.6, w:SW,h:0.28,fontSize:7, fontFace:'Consolas',  color:C.slateDeep,align:'center',charSpacing:1.5,margin:0 });
    });
  }

  // ══ SLIDE 3 — WORK EXPERIENCE ══════════════════════════════════════════════
  {
    function makeExpSlide(expList: PptxPayload['experiences'], pageNum: number, totalPages: number) {
      const s = pres.addSlide();
      s.background = { color: C.bg };
      s.addShape(RECT, { x:0,y:0,w:10,h:0.07,fill:{color:C.purple},line:{color:C.purple,width:0} });
      chip(s,totalPages>1?`CAREER  ${pageNum}/${totalPages}`:'CAREER',0.4,0.18,1.8);
      s.addText('Work Experience', { x:0.4,y:0.46,w:9.2,h:0.5,fontSize:28,fontFace:'Arial Black',color:C.white,bold:true,margin:0 });
      rule(s,0.4,1.01,9.2,C.purple,60);

      const count = expList.length||1, AREA_Y=1.12, AREA_H=4.18, GAP=0.09;
      const cardH = Math.min((AREA_H-GAP*(count-1))/count, 1.7);
      s.addShape(RECT, { x:0.62,y:AREA_Y,w:0.025,h:AREA_H,fill:{color:C.purple,transparency:50},line:{color:C.purple,width:0} });

      expList.forEach((exp,i) => {
        const isCurr = exp.is_current || !exp.end_date;
        const dc = isCurr ? C.green : C.purple;
        const y  = AREA_Y + i*(cardH+GAP);
        s.addShape(OVAL, { x:0.565,y:y+0.13,w:0.12,h:0.12,fill:{color:dc},line:{color:dc,width:0} });
        s.addShape(RECT, { x:0.85,y,w:8.8,h:cardH,fill:{color:isCurr?'071520':C.bgCard},line:{color:dc,width:isCurr?0.8:0.3},shadow:shadow() });
        if (isCurr) s.addShape(RECT, { x:0.85,y,w:8.8,h:0.04,fill:{color:C.green,transparency:40},line:{color:C.green,width:0} });

        s.addText(exp.title||'', { x:1.05,y:y+0.07,w:5.4,h:0.26,fontSize:12,fontFace:'Calibri',color:C.white,bold:true,margin:0 });
        if (isCurr) {
          s.addShape(RECT, { x:6.7,y:y+0.07,w:0.9,h:0.21,fill:{color:C.green,transparency:88},line:{color:C.green,width:0.5} });
          s.addText('● NOW', { x:6.7,y:y+0.07,w:0.9,h:0.21,fontSize:7,fontFace:'Consolas',color:C.green,align:'center',valign:'middle',bold:true,charSpacing:1,margin:0 });
        }
        const period = `${fmtDate(exp.start_date)} — ${exp.end_date?fmtDate(exp.end_date):'Present'}`;
        s.addText(period, { x:7.75,y:y+0.07,w:1.85,h:0.2,fontSize:7,fontFace:'Consolas',color:C.slateDeep,align:'right',margin:0 });
        if (exp.location)
          s.addText(exp.location, { x:7.75,y:y+0.26,w:1.85,h:0.18,fontSize:6.5,fontFace:'Consolas',color:C.slateDeep,align:'right',margin:0 });
        s.addText(exp.company||'', { x:1.05,y:y+0.3,w:5.4,h:0.22,fontSize:9,fontFace:'Consolas',color:dc,margin:0 });

        const desc = exp.description || '';
        if (desc) {
          s.addText(trunc(desc,200), { x:1.05,y:y+0.54,w:8.5,h:cardH-0.58,fontSize:7.5,fontFace:'Calibri',color:C.slate,valign:'top',margin:0 });
        }
      });
    }

    const EPS = 4;
    const pages: PptxPayload['experiences'][] = [];
    for (let i=0; i<Math.max(experiences.length,1); i+=EPS) pages.push(experiences.slice(i,i+EPS));
    if (pages.length===0) pages.push([]);
    pages.forEach((pg,pi) => makeExpSlide(pg, pi+1, pages.length));
  }

  // ══ SLIDE — EDUCATION & CERTS ══════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    s.addShape(RECT, { x:7.1,y:0,w:2.9,h:5.625,fill:{color:C.bgCard},line:{color:C.bgCard,width:0} });

    chip(s,'EDUCATION',0.4,0.18);
    s.addText('Education &\nCertifications', { x:0.4,y:0.46,w:6.5,h:0.95,fontSize:26,fontFace:'Arial Black',color:C.white,bold:true,margin:0 });
    rule(s,0.4,1.47,6.5,C.green,60);

    educations.slice(0,2).forEach((edu,i) => {
      const ey=1.62+i*1.45, eh=1.35, co=i===0?C.green:C.cyber;
      s.addShape(RECT, { x:0.4,y:ey,w:6.5,h:eh,fill:{color:C.bgCard},line:{color:co,width:0.5},shadow:shadow() });
      s.addShape(RECT, { x:0.4,y:ey,w:6.5,h:0.04,fill:{color:co},line:{color:co,width:0} });
      s.addShape(RECT, { x:0.4,y:ey,w:0.07,h:eh,fill:{color:co},line:{color:co,width:0} });
      s.addText(`🎓  ${edu.title||''}`, { x:0.62,y:ey+0.07,w:5.9,h:0.28,fontSize:12,fontFace:'Calibri',color:C.white,bold:true,margin:0 });
      s.addText(edu.company||'', { x:0.62,y:ey+0.35,w:5.9,h:0.22,fontSize:9,fontFace:'Consolas',color:co,margin:0 });
      s.addText(`${fmtDate(edu.start_date)} – ${edu.end_date?fmtDate(edu.end_date):'Present'}${edu.location?'  |  '+edu.location:''}`,
        { x:0.62,y:ey+0.56,w:5.9,h:0.2,fontSize:8,fontFace:'Consolas',color:C.slateDeep,margin:0 });
      if (edu.description)
        s.addText(trunc(edu.description,120), { x:0.62,y:ey+0.82,w:6.1,h:eh-0.9,fontSize:7.5,fontFace:'Calibri',color:C.slate,valign:'top',margin:0 });
    });

    const CY = 4.22;
    s.addText('Certifications', { x:0.4,y:CY,w:6.5,h:0.27,fontSize:12,fontFace:'Arial Black',color:C.white,bold:true,margin:0 });
    rule(s,0.4,CY+0.29,6.5,C.yellow,70);
    certs.slice(0,4).forEach((c,i) => {
      s.addText(`🏅  ${c.name}`, { x:0.45,y:CY+0.37+i*0.23,w:4.5,h:0.2,fontSize:8.5,fontFace:'Calibri',color:C.offWhite,bold:true,margin:0 });
      if (c.issuer||c.year)
        s.addText(`${c.issuer||''}${c.year?' — '+c.year:''}`, { x:5.0,y:CY+0.37+i*0.23,w:1.8,h:0.2,fontSize:8,fontFace:'Consolas',color:C.yellow,align:'right',margin:0 });
    });

    const eduYear = educations.length>0&&educations[0].end_date ? fmtDate(educations[0].end_date) : '2025';
    s.addText('GPA',       { x:7.2,y:0.6, w:2.6,h:0.28,fontSize:11,fontFace:'Consolas',  color:C.slateDeep,align:'center',charSpacing:3,margin:0 });
    s.addText(statGpa||'—',{ x:7.2,y:0.88,w:2.6,h:0.9, fontSize:58,fontFace:'Arial Black',color:C.green,    align:'center',bold:true,margin:0 });
    s.addText('/ 4.00',    { x:7.2,y:1.78,w:2.6,h:0.27,fontSize:13,fontFace:'Consolas',  color:C.slateDeep,align:'center',margin:0 });
    rule(s,7.4,2.17,2.2,C.green,60);
    s.addText(`Graduation\n${eduYear}`, { x:7.2,y:2.34,w:2.6,h:0.55,fontSize:10,fontFace:'Calibri',color:C.slate,align:'center',margin:0 });
  }

  // ══ SLIDE — SKILLS ════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    s.addShape(RECT, { x:0,y:0,w:10,h:0.07,fill:{color:C.cyber},line:{color:C.cyber,width:0} });
    chip(s,'CAPABILITIES',0.4,0.18);
    s.addText('Technical Arsenal', { x:0.4,y:0.46,w:9.2,h:0.5,fontSize:28,fontFace:'Arial Black',color:C.white,bold:true,margin:0 });
    rule(s,0.4,1.0,9.2,C.cyber,60);

    const cats = hardSkills.length > 0 ? [
      {title:'Hard Skills', color:C.cyber,  skills:hardSkills.slice(0,8)},
      {title:'Soft Skills', color:C.purple, skills:softSkills.slice(0,8)},
    ] : [
      {title:'IT Support & Infrastructure',color:C.cyber,  skills:['Hardware Troubleshooting','Network LAN/WAN','Windows OS','CCTV Install','Email Server','Preventive Maintenance','IT Asset Management','VoIP Systems']},
      {title:'Programming & Web Dev',      color:C.purple, skills:['PHP / Laravel','Python','JavaScript','MySQL','Tailwind CSS','Git','REST API','HTML5 / CSS3']},
    ];

    const cw=4.55, ch=2.3, colX=[0.28,5.17];
    cats.slice(0,2).forEach((cat,i) => {
      const x=colX[i], y=1.12, sk=cat.skills.slice(0,8);
      s.addShape(RECT, { x,y,w:cw,h:ch,fill:{color:C.bgCard},line:{color:cat.color,width:0.4},shadow:shadow() });
      s.addShape(RECT, { x,y,w:0.06,h:ch,fill:{color:cat.color},line:{color:cat.color,width:0} });
      s.addShape(RECT, { x,y,w:cw,h:0.04,fill:{color:cat.color,transparency:50},line:{color:cat.color,width:0} });
      s.addText(cat.title, { x:x+0.16,y:y+0.07,w:cw-0.22,h:0.26,fontSize:10,fontFace:'Arial Black',color:cat.color,bold:true,margin:0 });
      rule(s,x+0.16,y+0.36,cw-0.26,cat.color,70);
      const half=Math.ceil(sk.length/2), L=sk.slice(0,half), R=sk.slice(half);
      if (L.length>0) s.addText(L.map((n,si) => ({text:n,options:{bullet:true,breakLine:si<L.length-1,color:C.slate}})),{x:x+0.16,y:y+0.44,w:cw/2-0.1,h:ch-0.52,fontSize:8,fontFace:'Calibri',valign:'top',margin:0,paraSpaceAfter:1});
      if (R.length>0) s.addText(R.map((n,si) => ({text:n,options:{bullet:true,breakLine:si<R.length-1,color:C.slate}})),{x:x+cw/2+0.06,y:y+0.44,w:cw/2-0.22,h:ch-0.52,fontSize:8,fontFace:'Calibri',valign:'top',margin:0,paraSpaceAfter:1});
    });
  }

  // ══ SLIDES — PROJECTS ════════════════════════════════════════════════════
  const featProjects    = projects.filter(p => p.is_featured);
  const nonFeatProjects = projects.filter(p => !p.is_featured);

  featProjects.forEach((proj, pi) => {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    const accent = ACCENTS[pi % ACCENTS.length];
    s.addShape(RECT, { x:0,y:0,w:0.08,h:5.625,fill:{color:accent},line:{color:accent,width:0} });
    s.addShape(RECT, { x:0,y:0,w:10,h:0.07,fill:{color:accent,transparency:60},line:{color:accent,width:0} });
    chip(s,`FEATURED PROJECT  ${pi+1}/${featProjects.length}`,0.22,0.17,2.6);
    s.addText(proj.title||'Untitled', { x:0.22,y:0.44,w:9.5,h:0.68,fontSize:26,fontFace:'Arial Black',color:C.white,bold:true,margin:0 });

    const cat = (proj.category||'').toLowerCase();
    let tag = 'PROJECT';
    if (/web|app|site|laravel|php/.test(cat)) tag='WEB APP';
    else if (/ml|machine|data|ai/.test(cat)) tag='ML / AI';
    else if (proj.category) tag = proj.category.toUpperCase().substring(0,10);

    s.addShape(RECT, { x:0.22,y:1.18,w:1.1,h:0.22,fill:{color:accent,transparency:85},line:{color:accent,width:0.5} });
    s.addText(tag, { x:0.22,y:1.18,w:1.1,h:0.22,fontSize:7,fontFace:'Consolas',color:accent,align:'center',valign:'middle',bold:true,charSpacing:1,margin:0 });
    rule(s,0.22,1.48,9.5,accent,65);
    s.addText(proj.description||'', { x:0.22,y:1.58,w:9.5,h:1.52,fontSize:9.5,fontFace:'Calibri',color:C.slate,valign:'top',lineSpacingMultiple:1.35,margin:0 });

    const techArr = proj.tech_stack || [];
    if (techArr.length) {
      s.addText('TECH STACK', { x:0.22,y:3.18,w:2,h:0.18,fontSize:7,fontFace:'Consolas',color:C.slateDeep,charSpacing:2,margin:0 });
      rule(s,0.22,3.36,9.5,C.slateDeep,70);
      let px = 0.22;
      techArr.slice(0,8).forEach((t: string) => {
        const tw2 = Math.max(t.length*0.075+0.3, 0.72);
        if (px+tw2 > 9.65) return;
        s.addShape(RECT, {x:px,y:3.44,w:tw2,h:0.24,fill:{color:accent,transparency:88},line:{color:accent,width:0.4}});
        s.addText(t,{x:px,y:3.44,w:tw2,h:0.24,fontSize:7.5,fontFace:'Consolas',color:accent,align:'center',valign:'middle',margin:0});
        px += tw2+0.1;
      });
    }

    const links = [];
    if (proj.github_url) links.push({lbl:'GitHub',url:proj.github_url});
    if (proj.demo_url)   links.push({lbl:'Live Demo',url:proj.demo_url});
    links.forEach((lk,li) => {
      const lx = 0.22+li*1.55;
      s.addShape(RECT,{x:lx,y:3.8,w:1.4,h:0.3,fill:{color:C.bgCard},line:{color:accent,width:0.5}});
      s.addText(`🔗 ${lk.lbl}`,{x:lx,y:3.8,w:1.4,h:0.3,fontSize:8,fontFace:'Consolas',color:accent,align:'center',valign:'middle',margin:0});
    });
  });

  if (nonFeatProjects.length > 0) {
    const PPS = 6;
    for (let pi=0; pi<Math.ceil(nonFeatProjects.length/PPS); pi++) {
      const s = pres.addSlide();
      s.background = { color: C.bg };
      chip(s,'MORE PROJECTS',0.4,0.18,2.3);
      s.addText('Other Projects', { x:0.4,y:0.46,w:9.2,h:0.5,fontSize:28,fontFace:'Arial Black',color:C.white,bold:true,margin:0 });
      rule(s,0.4,1.0,9.2,C.purple,60);

      nonFeatProjects.slice(pi*PPS,(pi+1)*PPS).forEach((proj,i) => {
        const col=i%3, row=Math.floor(i/3);
        const x=0.28+col*3.2, y=1.14+row*2.08, cw=3.06, ch=1.96;
        const accent=ACCENTS[i%ACCENTS.length];
        s.addShape(RECT,{x,y,w:cw,h:ch,fill:{color:C.bgCard},line:{color:accent,width:0.3},shadow:shadow()});
        s.addShape(RECT,{x,y,w:cw,h:0.04,fill:{color:accent},line:{color:accent,width:0}});
        s.addText(trunc(proj.title||'Untitled',45),{x:x+0.14,y:y+0.04,w:cw-0.22,h:0.36,fontSize:9.5,fontFace:'Calibri',color:C.white,bold:true,margin:0});
        const ts=(proj.tech_stack||[]).slice(0,5).join(' · ')||proj.category||'';
        if (ts) s.addText(trunc(ts,60),{x:x+0.14,y:y+0.34,w:cw-0.22,h:0.2,fontSize:7,fontFace:'Consolas',color:accent,margin:0});
        rule(s,x+0.14,y+0.57,cw-0.24,accent,75);
        s.addText(trunc(proj.description||'',160),{x:x+0.14,y:y+0.65,w:cw-0.22,h:ch-0.72,fontSize:8,fontFace:'Calibri',color:C.slate,valign:'top',lineSpacingMultiple:1.2,margin:0});
      });
    }
  }

  // ══ LAST SLIDE — CONTACT ══════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    s.addShape(RECT,{x:1.1,y:0.42,w:7.8,h:4.96,fill:{color:C.bgCard},line:{color:C.cyber,width:0.5},shadow:shadow()});
    s.addShape(RECT,{x:1.1,y:0.42,w:7.8,h:0.06,fill:{color:C.cyber}, line:{color:C.cyber, width:0}});
    chip(s,"LET'S CONNECT",4.15,0.57,1.7);
    s.addText('Got a project in mind?',{x:1.3,y:0.93,w:7.4,h:0.55,fontSize:28,fontFace:'Arial Black',color:C.white,bold:true,align:'center',margin:0});
    s.addText('Mari diskusi dan wujudkan ide kamu menjadi solusi nyata.',{x:1.3,y:1.53,w:7.4,h:0.3,fontSize:11,fontFace:'Calibri',color:C.slate,align:'center',margin:0});
    rule(s,2.5,1.92,5.0,C.cyber,60);

    const contactItems = [
      owner.email    ? {sym:'@',  lbl:'EMAIL',    val:owner.email,                                  color:C.cyber } : null,
      owner.phone    ? {sym:'☎', lbl:'PHONE',    val:owner.phone,                                  color:C.green } : null,
      owner.github   ? {sym:'<>',lbl:'GITHUB',   val:owner.github.replace(/https?:\/\//,''),       color:C.purple} : null,
      owner.linkedin ? {sym:'in',lbl:'LINKEDIN', val:owner.linkedin.replace(/https?:\/\//,''),     color:C.yellow} : null,
    ].filter(Boolean) as {sym:string,lbl:string,val:string,color:string}[];

    const CC=2, CW2=3.4, CXS=[1.45,5.15];
    contactItems.forEach((c,i) => {
      const col=i%CC, row=Math.floor(i/CC);
      const x=CXS[col], y=2.07+row*0.73;
      s.addShape(RECT,{x,y,w:CW2,h:0.6,fill:{color:C.bg},line:{color:c.color,width:0.3}});
      s.addShape(RECT,{x:x+0.06,y:y+0.07,w:0.48,h:0.46,fill:{color:c.color,transparency:75},line:{color:c.color,width:0.5}});
      s.addText(c.sym,{x:x+0.06,y:y+0.07,w:0.48,h:0.46,fontSize:11,fontFace:'Arial Black',color:C.white,align:'center',valign:'middle',bold:true,margin:0});
      s.addText(c.lbl,         {x:x+0.64,y:y+0.05,w:CW2-0.74,h:0.22,fontSize:7,  fontFace:'Consolas',color:c.color,  bold:true,charSpacing:1.5,margin:0});
      s.addText(trunc(c.val,45),{x:x+0.64,y:y+0.27,w:CW2-0.74,h:0.22,fontSize:8.5,fontFace:'Calibri', color:C.offWhite,margin:0});
    });

    const rowsUsed = Math.ceil(contactItems.length/CC);
    const bottomY  = 2.07 + rowsUsed*0.73 + 0.18;
    s.addText('Open to full-time roles, internships, freelance projects & collaborations.',{x:1.3,y:bottomY,w:7.4,h:0.28,fontSize:9,fontFace:'Consolas',color:C.slateDeep,align:'center',margin:0});
    s.addText('AVAILABLE FOR HIRE',{x:1.3,y:bottomY+0.48,w:7.4,h:0.28,fontSize:10,fontFace:'Consolas',color:C.green,align:'center',bold:true,charSpacing:2,margin:0});
    s.addText(`Generated by ${brandName}  ·  ${generatedAt}`,{x:1.3,y:5.35,w:7.4,h:0.2,fontSize:7.5,fontFace:'Consolas',color:C.slateDeep,align:'center',margin:0});
  }

  // ── Write to buffer ───────────────────────────────────────────────────────
  const result = await pres.write({ outputType: 'nodebuffer' });
  return result as Uint8Array;
}