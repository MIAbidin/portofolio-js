#!/usr/bin/env node
/**
 * generate-projects-pptx.cjs  —  v2.1
 * Called by HomeController::downloadPptx() via shell_exec:
 *   node generate-projects-pptx.cjs <payload.json> <output.pptx>
 */
"use strict";

const pptxgen = require("pptxgenjs");
const fs      = require("fs");
const path    = require("path");

// ── CLI ──────────────────────────────────────────────────────────────────────
const [,, payloadPath, outputPath] = process.argv;
if (!payloadPath || !outputPath) { console.error("Usage: node generate-projects-pptx.cjs <payload.json> <output.pptx>"); process.exit(1); }
let payload;
try { payload = JSON.parse(fs.readFileSync(payloadPath, "utf8")); }
catch (e) { console.error("Failed to parse payload:", e.message); process.exit(1); }

// ── Destructure ───────────────────────────────────────────────────────────────
const brandName      = payload.brand_name    || "Portfolio";
const generatedAt    = payload.generated_at  || new Date().toLocaleDateString("id-ID");
const owner          = payload.owner         || {};
const stats          = payload.stats         || {};
const projects       = Array.isArray(payload.projects)       ? payload.projects       : [];
const skills         = Array.isArray(payload.skills)         ? payload.skills         : [];
const experiences    = Array.isArray(payload.experiences)    ? payload.experiences    : [];
const educations     = Array.isArray(payload.educations)     ? payload.educations     : [];
const certifications = Array.isArray(payload.certifications) ? payload.certifications : [];

const ownerName      = owner.name      || brandName;
const ownerRole      = owner.role      || "IT Support & Developer";
const ownerEmail     = owner.email     || "";
const ownerPhone     = owner.phone     || "";
const ownerLocation  = owner.location  || "";
const ownerGithub    = owner.github    || "";
const ownerLinkedin  = owner.linkedin  || "";
const ownerInstagram = owner.instagram || "";
const ownerAbout     = owner.about     || "";

const statProjects = stats.projects    || `${projects.length}+`;
const statExpYears = stats.experience  || "2+";
const statGpa      = stats.gpa         || owner.gpa || "3.83";
const statCerts    = stats.certificates|| `${certifications.length > 0 ? certifications.length : 4}+`;

// ── Colours ───────────────────────────────────────────────────────────────────
const C = {
  bg:"080D26", bgCard:"0F1535", bgDeep:"060B1F",
  cyber:"00D9FF", purple:"7C3AED", green:"10B981",
  white:"FFFFFF", offWhite:"E2E8F0", slate:"94A3B8",
  slateDeep:"475569", yellow:"F59E0B", red:"EF4444",
};
const ACCENTS = [C.cyber, C.purple, C.green, C.yellow, C.red, C.cyber, C.purple, C.green];
const shadow  = () => ({ type:"outer", blur:10, offset:3, angle:135, color:"000000", opacity:0.25 });

// ── Utility ───────────────────────────────────────────────────────────────────
function chip(s, text, x, y, w=1.7) {
  s.addShape(pres.shapes.RECTANGLE, { x,y,w,h:0.22, fill:{color:C.cyber,transparency:85}, line:{color:C.cyber,width:0.5} });
  s.addText(text, { x,y,w,h:0.22, fontSize:7, fontFace:"Consolas", color:C.cyber, align:"center", valign:"middle", bold:true, charSpacing:2, margin:0 });
}
function rule(s, x, y, w, color=C.cyber, tr=70) {
  s.addShape(pres.shapes.RECTANGLE, { x,y,w,h:0.015, fill:{color,transparency:tr}, line:{color,width:0} });
}
function dots(s, cols, rows, x0, y0, gx, gy, color=C.cyber, tr=88) {
  for (let i=0;i<cols;i++) for (let j=0;j<rows;j++)
    s.addShape(pres.shapes.OVAL, { x:x0+i*gx, y:y0+j*gy, w:0.025, h:0.025, fill:{color,transparency:tr}, line:{color,width:0} });
}
function trunc(str, max) { if (!str) return ""; return str.length>max ? str.substring(0,max-1)+"…" : str; }
function fmtDate(d) {
  if (!d) return "";
  try { return new Date(d).toLocaleDateString("id-ID",{month:"short",year:"numeric"}); } catch { return d; }
}
function loadImg(p) {
  if (!p) return null;
  try {
    if (!fs.existsSync(p)) return null;
    const ext = path.extname(p).toLowerCase().replace(".","");
    return `image/${ext==="jpg"?"jpeg":ext};base64,`+fs.readFileSync(p).toString("base64");
  } catch { return null; }
}
const hardSkills = skills.filter(s=>s.category==="hard").map(s=>s.name).filter(Boolean);
const softSkills = skills.filter(s=>s.category==="soft").map(s=>s.name).filter(Boolean);

// ── Presentation ──────────────────────────────────────────────────────────────
const pres   = new pptxgen();
pres.layout  = "LAYOUT_16x9";
pres.author  = ownerName;
pres.title   = `${brandName} — Portfolio`;
pres.subject = `Portfolio Presentation — ${generatedAt}`;

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 1 — COVER
// FIX: terminal lebih lebar (x:6.3, w:3.45), contact bar lebih kecil (h:0.38, font:7.5)
// ═════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color:C.bg };
  dots(s,20,12,0,0,0.53,0.5);

  // Left accent bars
  s.addShape(pres.shapes.RECTANGLE, { x:0,    y:0, w:0.08, h:5.625, fill:{color:C.cyber},                  line:{color:C.cyber, width:0} });
  s.addShape(pres.shapes.RECTANGLE, { x:0.08, y:0, w:0.04, h:5.625, fill:{color:C.purple,transparency:60}, line:{color:C.purple,width:0} });

  // ── Terminal panel: lebih lebar & tinggi ──
  const TX=6.3, TY=0.55, TW=3.45, TH=4.65;
  s.addShape(pres.shapes.RECTANGLE, { x:TX,      y:TY,       w:TW,       h:TH,       fill:{color:C.cyber, transparency:96}, line:{color:C.cyber, width:0.5} });
  s.addShape(pres.shapes.RECTANGLE, { x:TX+0.15, y:TY+0.16,  w:TW-0.3,   h:TH-0.32,  fill:{color:C.purple,transparency:97}, line:{color:C.purple,width:0.3} });

  // terminal dots
  [[0.18,"EF4444"],[0.33,C.yellow],[0.48,C.green]].forEach(([dx,c])=>
    s.addShape(pres.shapes.OVAL, { x:TX+dx, y:TY+0.1, w:0.1, h:0.1, fill:{color:c}, line:{color:c,width:0} })
  );
  s.addText("portfolio.sh", { x:TX+0.18, y:TY+0.08, w:TW-0.36, h:0.16, fontSize:6.5, fontFace:"Consolas", color:C.slateDeep, align:"right", margin:0 });
  s.addShape(pres.shapes.RECTANGLE, { x:TX+0.15, y:TY+0.26, w:TW-0.3, h:0.01, fill:{color:C.cyber,transparency:70}, line:{color:C.cyber,width:0} });

  const termLines = [
    {t:"$ whoami",                             c:C.slateDeep, b:false},
    {t:`> ${ownerName}`,                       c:C.white,     b:false},
    {t:"",                                     c:C.slateDeep, b:false},
    {t:"$ cat role.txt",                       c:C.slateDeep, b:false},
    {t:`> ${ownerRole}`,                       c:C.green,     b:false},
    {t:"",                                     c:C.slateDeep, b:false},
    {t:"$ echo $STATUS",                       c:C.slateDeep, b:false},
    {t:"> AVAILABLE FOR HIRE",                 c:C.green,     b:true },
    {t:"",                                     c:C.slateDeep, b:false},
    {t:"$ git log --oneline",                  c:C.slateDeep, b:false},
    {t:`> ${statProjects} projects committed`, c:C.cyber,     b:false},
    {t:`> ${statExpYears} years experience`,   c:C.cyber,     b:false},
    ...(statGpa?[{t:`> GPA: ${statGpa}/4.00`, c:C.cyber, b:false}]:[]),
  ];
  s.addText(
    termLines.map((l,i)=>({ text:l.t, options:{ breakLine:i<termLines.length-1, color:l.c, bold:l.b } })),
    { x:TX+0.2, y:TY+0.34, w:TW-0.4, h:TH-0.48, fontSize:8.5, fontFace:"Consolas", valign:"top" }
  );

  // Status badge
  s.addShape(pres.shapes.RECTANGLE, { x:0.28, y:0.3, w:1.9, h:0.26, fill:{color:C.green,transparency:88}, line:{color:C.green,width:0.5} });
  s.addShape(pres.shapes.OVAL,      { x:0.38, y:0.39, w:0.09, h:0.09, fill:{color:C.green}, line:{color:C.green,width:0} });
  s.addText("AVAILABLE FOR HIRE", { x:0.51, y:0.3, w:1.64, h:0.26, fontSize:7, fontFace:"Consolas", color:C.green, bold:true, valign:"middle", charSpacing:1, margin:0 });

  // Name
  const parts = ownerName.split(" ");
  s.addText(parts[0]||ownerName,       { x:0.23, y:0.66, w:5.9, h:0.82, fontSize:50, fontFace:"Arial Black", color:C.white, bold:true, margin:0 });
  if (parts.slice(1).join(" "))
    s.addText(parts.slice(1).join(" "), { x:0.23, y:1.44, w:5.9, h:0.82, fontSize:50, fontFace:"Arial Black", color:C.cyber, bold:true, margin:0 });

  s.addText(ownerRole, { x:0.23, y:2.34, w:5.9, h:0.28, fontSize:12, fontFace:"Consolas", color:C.slate, charSpacing:1, margin:0 });
  rule(s, 0.23, 2.69, 5.9, C.cyber, 65);

  const facts = [
    ownerLocation ? `📍  ${ownerLocation}` : null,
    statGpa       ? `⭐  IPK / GPA: ${statGpa}` : null,
    experiences.length>0 ? `🏢  ${experiences[0].title} @ ${experiences[0].company}` : null,
    educations.length>0  ? `🎓  ${educations[0].title} — ${trunc(educations[0].company,38)}` : null,
  ].filter(Boolean);
  facts.slice(0,4).forEach((f,i)=>
    s.addText(f, { x:0.23, y:2.82+i*0.3, w:5.9, h:0.26, fontSize:9.5, fontFace:"Calibri", color:C.offWhite, margin:0 })
  );

  // ── Contact bar: lebih kecil (h:0.38, font:7.5) ──
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:5.245, w:10, h:0.38, fill:{color:C.bgCard}, line:{color:C.bgCard,width:0} });
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:5.24,  w:10, h:0.015, fill:{color:C.cyber,transparency:55}, line:{color:C.cyber,width:0} });
  const cParts = [
    ownerEmail    ? `✉  ${ownerEmail}` : null,
    ownerPhone    ? `📱 ${ownerPhone}` : null,
    ownerGithub   ? `🐙 ${ownerGithub.replace(/https?:\/\//,"")}` : null,
    ownerLinkedin ? `💼 ${ownerLinkedin.replace(/https?:\/\//,"")}` : null,
  ].filter(Boolean);
  s.addText(cParts.join("   |   "), { x:0.2, y:5.245, w:9.6, h:0.38, fontSize:7.5, fontFace:"Consolas", color:C.slate, align:"center", valign:"middle" });
}

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 2 — ABOUT ME
// FIX: stats row di paling bawah (y=4.52), lebar seragam, terpusat di kolom kanan
// ═════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color:C.bg };

  // Left panel
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:3.85, h:5.625, fill:{color:C.bgCard}, line:{color:C.bgCard,width:0} });
  s.addShape(pres.shapes.RECTANGLE, { x:3.85, y:0, w:0.02, h:5.625, fill:{color:C.cyber,transparency:70}, line:{color:C.cyber,width:0} });
  dots(s,4,6,0.2,0.25,0.45,0.45);
  chip(s,"ABOUT ME",0.2,0.22);

  // Profile card
  s.addShape(pres.shapes.RECTANGLE, { x:0.2, y:0.55, w:3.45, h:4.65, fill:{color:C.bg}, line:{color:C.cyber,width:0.3}, shadow:shadow() });
  s.addShape(pres.shapes.RECTANGLE, { x:0.2, y:0.55, w:3.45, h:0.05, fill:{color:C.cyber}, line:{color:C.cyber,width:0} });

  s.addShape(pres.shapes.OVAL, { x:1.2, y:0.72, w:1.45, h:1.45, fill:{color:C.cyber,transparency:88}, line:{color:C.cyber,width:1.2} });
  const ini = ownerName.split(" ").map(w=>w[0]).join("").substring(0,3).toUpperCase();
  s.addText(ini, { x:1.2, y:0.72, w:1.45, h:1.45, fontSize:28, fontFace:"Arial Black", color:C.cyber, align:"center", valign:"middle", bold:true, margin:0 });

  s.addText(ownerName, { x:0.25, y:2.27, w:3.35, h:0.3,  fontSize:11,  fontFace:"Calibri",  color:C.white, align:"center", bold:true, margin:0 });
  s.addText(ownerRole, { x:0.25, y:2.57, w:3.35, h:0.25, fontSize:8.5, fontFace:"Consolas", color:C.cyber, align:"center", margin:0 });
  rule(s, 0.35, 2.86, 3.15, C.slateDeep, 50);

  const cItems = [
    ownerEmail    ? {icon:"✉",  val:ownerEmail} : null,
    ownerPhone    ? {icon:"📱", val:ownerPhone} : null,
    ownerLocation ? {icon:"📍", val:ownerLocation} : null,
    ownerGithub   ? {icon:"🐙", val:ownerGithub.replace(/https?:\/\//,"")} : null,
    ownerLinkedin ? {icon:"💼", val:ownerLinkedin.replace(/https?:\/\//,"")} : null,
  ].filter(Boolean).slice(0,5);
  cItems.forEach((c,i)=>
    s.addText(`${c.icon}  ${c.val}`, { x:0.32, y:2.97+i*0.33, w:3.25, h:0.29, fontSize:7.5, fontFace:"Consolas", color:C.slate, margin:0 })
  );

  s.addShape(pres.shapes.RECTANGLE, { x:0.55, y:4.9, w:2.75, h:0.24, fill:{color:C.green,transparency:88}, line:{color:C.green,width:0.5} });
  s.addShape(pres.shapes.OVAL,      { x:0.67, y:4.96, w:0.09, h:0.09, fill:{color:C.green}, line:{color:C.green,width:0} });
  s.addText("Open to Opportunities", { x:0.8, y:4.9, w:2.4, h:0.24, fontSize:8, fontFace:"Consolas", color:C.green, valign:"middle", bold:true, margin:0 });

  // Right: bio
  chip(s,"PROFILE",4.1,0.22);
  s.addText("About Me", { x:4.1, y:0.5, w:5.65, h:0.5, fontSize:28, fontFace:"Arial Black", color:C.white, bold:true, margin:0 });
  rule(s, 4.1, 1.06, 5.65, C.cyber, 60);

  let bio = ownerAbout;
  if (!bio && experiences.length>0) {
    const curr = experiences.find(e=>e.is_current)||experiences[0];
    bio = `${ownerName} adalah seorang ${ownerRole}${curr?` yang saat ini berperan sebagai ${curr.title} di ${curr.company}`:""}.`;
    if (educations.length>0) bio += ` Lulusan ${educations[0].title} dari ${educations[0].company}.`;
    if (statGpa) bio += ` IPK: ${statGpa}/4.00.`;
    bio += ` Berpengalaman di bidang IT Support, pengembangan web, dan antusias dalam teknologi AI/ML.`;
  }
  s.addText(bio, { x:4.1, y:1.16, w:5.65, h:3.15, fontSize:9.5, fontFace:"Calibri", color:C.slate, valign:"top", lineSpacingMultiple:1.3, margin:0 });

  // ── Stats row: paling bawah, center di kolom kanan (x:4.1, w:5.65) ──
  // 4 blocks @ w:1.28, gap:0.11 → total:5.45 → padding each side:0.10
  const SW=1.28, SG=0.11, STOTAL=4*SW+3*SG; // =5.45
  const SX0 = 4.1 + (5.65-STOTAL)/2;        // center within right column
  const SY  = 5.625 - 0.14 - 1.0;           // 0.14 bottom margin, block h=1.0
  const stItems = [
    {val:statProjects, lbl:"PROJECTS", color:C.cyber },
    {val:statExpYears, lbl:"YRS EXP",  color:C.purple},
    {val:statGpa,      lbl:"GPA",      color:C.green },
    {val:statCerts,    lbl:"CERTS",    color:C.yellow},
  ];
  stItems.forEach((st,i) => {
    const x = SX0 + i*(SW+SG);
    s.addShape(pres.shapes.RECTANGLE, { x, y:SY, w:SW, h:1.0, fill:{color:C.bgCard}, line:{color:st.color,width:0.5}, shadow:shadow() });
    s.addShape(pres.shapes.RECTANGLE, { x, y:SY, w:SW, h:0.04, fill:{color:st.color,transparency:40}, line:{color:st.color,width:0} });
    s.addText(String(st.val), { x, y:SY+0.07, w:SW, h:0.52, fontSize:24, fontFace:"Arial Black", color:st.color, align:"center", bold:true, margin:0 });
    s.addText(st.lbl,         { x, y:SY+0.6,  w:SW, h:0.28, fontSize:7,  fontFace:"Consolas",   color:C.slateDeep, align:"center", charSpacing:1.5, margin:0 });
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 3+ — WORK EXPERIENCE
// FIX: lokasi SELALU sebaris di bawah periode (konsisten semua exp)
//      tampilkan SEMUA achievements tanpa truncate
//      auto-paginate jika >4 entries
// ═════════════════════════════════════════════════════════════════════════════
{
  function makeExpSlide(expList, pageNum, totalPages) {
    const s = pres.addSlide();
    s.background = { color:C.bg };
    s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:10, h:0.07, fill:{color:C.purple}, line:{color:C.purple,width:0} });
    chip(s, totalPages>1 ? `CAREER  ${pageNum}/${totalPages}` : "CAREER", 0.4, 0.18, 1.8);
    s.addText("Work Experience", { x:0.4, y:0.46, w:9.2, h:0.5, fontSize:28, fontFace:"Arial Black", color:C.white, bold:true, margin:0 });
    rule(s, 0.4, 1.01, 9.2, C.purple, 60);

    const count  = expList.length || 1;
    const AREA_Y = 1.12, AREA_H = 4.18;
    const GAP    = 0.09;
    const cardH  = Math.min((AREA_H - GAP*(count-1)) / count, 1.7);

    // timeline
    s.addShape(pres.shapes.RECTANGLE, { x:0.62, y:AREA_Y, w:0.025, h:AREA_H, fill:{color:C.purple,transparency:50}, line:{color:C.purple,width:0} });

    expList.forEach((exp, i) => {
      const isCurr = exp.is_current==true || exp.is_current==1 || !exp.end_date;
      const dc     = isCurr ? C.green : C.purple;
      const y      = AREA_Y + i*(cardH+GAP);

      s.addShape(pres.shapes.OVAL, { x:0.565, y:y+0.13, w:0.12, h:0.12, fill:{color:dc}, line:{color:dc,width:0} });
      s.addShape(pres.shapes.RECTANGLE, { x:0.85, y, w:8.8, h:cardH, fill:{color:isCurr?"071520":C.bgCard}, line:{color:dc,width:isCurr?0.8:0.3}, shadow:shadow() });
      if (isCurr) s.addShape(pres.shapes.RECTANGLE, { x:0.85, y, w:8.8, h:0.04, fill:{color:C.green,transparency:40}, line:{color:C.green,width:0} });

      // Title
      s.addText(exp.title||"", { x:1.05, y:y+0.07, w:5.4, h:0.26, fontSize:12, fontFace:"Calibri", color:C.white, bold:true, margin:0 });

      // NOW badge
      if (isCurr) {
        s.addShape(pres.shapes.RECTANGLE, { x:6.7, y:y+0.07, w:0.9, h:0.21, fill:{color:C.green,transparency:88}, line:{color:C.green,width:0.5} });
        s.addText("● NOW", { x:6.7, y:y+0.07, w:0.9, h:0.21, fontSize:7, fontFace:"Consolas", color:C.green, align:"center", valign:"middle", bold:true, charSpacing:1, margin:0 });
      }

      // ── Periode di kanan atas, lokasi di baris BAWAHNYA (konsisten semua) ──
      const period = `${fmtDate(exp.start_date)} — ${exp.end_date ? fmtDate(exp.end_date) : "Present"}`;
      s.addText(period, { x:7.75, y:y+0.07, w:1.85, h:0.2, fontSize:7, fontFace:"Consolas", color:C.slateDeep, align:"right", margin:0 });
      if (exp.location)
        s.addText(exp.location, { x:7.75, y:y+0.26, w:1.85, h:0.18, fontSize:6.5, fontFace:"Consolas", color:C.slateDeep, align:"right", margin:0 });

      // Company
      s.addText(exp.company||"", { x:1.05, y:y+0.3, w:5.4, h:0.22, fontSize:9, fontFace:"Consolas", color:dc, margin:0 });

      // ── Achievements: SEMUA, tanpa truncate ──
      const items = Array.isArray(exp.achievements) && exp.achievements.length>0
        ? exp.achievements
        : (exp.description ? [exp.description] : []);
      const availH   = cardH - 0.58;
      const maxItems = Math.max(1, Math.floor(availH / 0.165));
      if (items.length>0)
        s.addText(
          items.slice(0,maxItems).map((a,ai)=>({ text:a, options:{bullet:true, breakLine:ai<Math.min(items.length,maxItems)-1, color:C.slate} })),
          { x:1.05, y:y+0.54, w:8.5, h:availH, fontSize:7.5, fontFace:"Calibri", valign:"top", margin:0, paraSpaceAfter:1 }
        );
    });
  }

  const EPS = 4;
  const pages = [];
  for (let i=0;i<Math.max(experiences.length,1);i+=EPS) pages.push(experiences.slice(i,i+EPS));
  if (pages.length===0) pages.push([]);
  pages.forEach((pg,pi)=>makeExpSlide(pg, pi+1, pages.length));
}

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE — EDUCATION & CERTIFICATIONS
// FIX: certification section naik (CERT_Y = 4.22)
// ═════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color:C.bg };

  s.addShape(pres.shapes.RECTANGLE, { x:7.1, y:0, w:2.9, h:5.625, fill:{color:C.bgCard}, line:{color:C.bgCard,width:0} });
  dots(s,3,4,7.2,4.5,0.4,0.3,C.green);

  chip(s,"EDUCATION",0.4,0.18);
  s.addText("Education &\nCertifications", { x:0.4, y:0.46, w:6.5, h:0.95, fontSize:26, fontFace:"Arial Black", color:C.white, bold:true, margin:0 });
  rule(s, 0.4, 1.47, 6.5, C.green, 60);

  const displayEdu = educations.slice(0,2);
  displayEdu.forEach((edu,i) => {
    const ey = 1.62 + i*1.45;
    const eh = 1.35;
    const co = i===0 ? C.green : C.cyber;

    s.addShape(pres.shapes.RECTANGLE, { x:0.4, y:ey, w:6.5, h:eh, fill:{color:C.bgCard}, line:{color:co,width:0.5}, shadow:shadow() });
    s.addShape(pres.shapes.RECTANGLE, { x:0.4, y:ey, w:6.5, h:0.04, fill:{color:co}, line:{color:co,width:0} });
    s.addShape(pres.shapes.RECTANGLE, { x:0.4, y:ey, w:0.07, h:eh, fill:{color:co}, line:{color:co,width:0} });

    s.addText(`🎓  ${edu.title||""}`, { x:0.62, y:ey+0.07, w:5.9, h:0.28, fontSize:12, fontFace:"Calibri", color:C.white, bold:true, margin:0 });
    s.addText(edu.company||edu.institution||"", { x:0.62, y:ey+0.35, w:5.9, h:0.22, fontSize:9, fontFace:"Consolas", color:co, margin:0 });
    s.addText(`${fmtDate(edu.start_date)} – ${edu.end_date?fmtDate(edu.end_date):"Present"}${edu.location?"  |  "+edu.location:""}`,
      { x:0.62, y:ey+0.56, w:5.9, h:0.2, fontSize:8, fontFace:"Consolas", color:C.slateDeep, margin:0 });
    rule(s, 0.65, ey+0.78, 5.7, C.slateDeep, 50);
    const ach = Array.isArray(edu.achievements)&&edu.achievements.length>0
      ? edu.achievements.slice(0,3) : (edu.description?[trunc(edu.description,120)]:[]);
    if (ach.length>0)
      s.addText(ach.map((a,ai)=>({text:trunc(a,100),options:{bullet:true,breakLine:ai<ach.length-1,color:C.slate}})),
        { x:0.62, y:ey+0.85, w:6.1, h:eh-0.9, fontSize:7.5, fontFace:"Calibri", valign:"top", margin:0, paraSpaceAfter:1 });
  });

  // ── Certifications naik ke y:4.22 ──
  const CY = 4.22;
  s.addText("Certifications", { x:0.4, y:CY, w:6.5, h:0.27, fontSize:12, fontFace:"Arial Black", color:C.white, bold:true, margin:0 });
  rule(s, 0.4, CY+0.29, 6.5, C.yellow, 70);

  const certs = certifications.length>0 ? certifications.slice(0,4) : [
    {name:"Cisco Networking Academy",       issuer:"Cisco",        year:""},
    {name:"MSIB / Kampus Merdeka",          issuer:"Kemendikbud",  year:""},
    {name:"DBS Foundation Coding Camp",     issuer:"DBS Foundation",year:""},
    {name:"Dicoding — Web Development",     issuer:"Dicoding",     year:""},
  ];
  certs.forEach((c,i)=>{
    s.addText(`🏅  ${c.name}`, { x:0.45, y:CY+0.37+i*0.23, w:4.5, h:0.2, fontSize:8.5, fontFace:"Calibri", color:C.offWhite, bold:true, margin:0 });
    if (c.issuer||c.year)
      s.addText(`${c.issuer||""}${c.year?" — "+c.year:""}`, { x:5.0, y:CY+0.37+i*0.23, w:1.8, h:0.2, fontSize:8, fontFace:"Consolas", color:C.yellow, align:"right", margin:0 });
  });

  // Right panel GPA
  s.addText("GPA",       { x:7.2, y:0.6,  w:2.6, h:0.28, fontSize:11, fontFace:"Consolas",   color:C.slateDeep, align:"center", charSpacing:3, margin:0 });
  s.addText(statGpa||"—",{ x:7.2, y:0.88, w:2.6, h:0.9,  fontSize:58, fontFace:"Arial Black", color:C.green,     align:"center", bold:true, margin:0 });
  s.addText("/ 4.00",    { x:7.2, y:1.78, w:2.6, h:0.27, fontSize:13, fontFace:"Consolas",   color:C.slateDeep, align:"center", margin:0 });
  rule(s,7.4,2.17,2.2,C.green,60);
  const eduYear = educations.length>0&&educations[0].end_date ? fmtDate(educations[0].end_date) : "2025";
  s.addText(`Graduation\n${eduYear}`, { x:7.2, y:2.34, w:2.6, h:0.55, fontSize:10, fontFace:"Calibri", color:C.slate, align:"center", margin:0 });
  rule(s,7.4,3.0,2.2,C.slateDeep,60);
  s.addText("Status",                         { x:7.2, y:3.14, w:2.6, h:0.2,  fontSize:8,  fontFace:"Consolas",   color:C.slateDeep, align:"center", charSpacing:2, margin:0 });
  s.addText("Fresh Graduate\n+ Work Experience",{ x:7.2, y:3.36, w:2.6, h:0.55, fontSize:10, fontFace:"Calibri",   color:C.cyber,     align:"center", bold:true, margin:0 });
}

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE — TECHNICAL SKILLS
// ═════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color:C.bg };
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:10, h:0.07, fill:{color:C.cyber}, line:{color:C.cyber,width:0} });
  chip(s,"CAPABILITIES",0.4,0.18);
  s.addText("Technical Arsenal", { x:0.4, y:0.46, w:9.2, h:0.5, fontSize:28, fontFace:"Arial Black", color:C.white, bold:true, margin:0 });
  rule(s,0.4,1.0,9.2,C.cyber,60);

  let cats = [];
  if (skills.length>0) {
    const hard  = hardSkills;
    const soft  = softSkills;
    const infra = hard.filter(n=>/network|cisco|cctv|voip|lan|hardware|support|troubleshoot|install|maintenance|inventory/i.test(n));
    const web   = hard.filter(n=>/php|laravel|python|javascript|js|css|html|sql|mysql|git|api|node|vue|react|bootstrap|tailwind/i.test(n));
    const ai    = hard.filter(n=>/machine|learning|data|pandas|numpy|sklearn|scikit|jupyter|tensorflow|ai|analytics|visualization/i.test(n));
    const oth   = hard.filter(n=>!infra.includes(n)&&!web.includes(n)&&!ai.includes(n));
    cats = [
      {title:"IT Support & Infrastructure",color:C.cyber, skills:infra.length>0?infra:hard.slice(0,8)},
      {title:"Programming & Web Dev",      color:C.purple,skills:web.length>0?web:hard.slice(8,16)},
      {title:"Data Science & AI",          color:C.green, skills:ai.length>0?ai:[]},
      {title:"Tools & Soft Skills",        color:C.yellow,skills:[...soft,...oth].slice(0,8)},
    ].filter(c=>c.skills.length>0);
    if (cats.length<2) cats = [
      {title:"Hard Skills",color:C.cyber, skills:hard.slice(0,8)},
      {title:"Soft Skills",color:C.purple,skills:soft.slice(0,8)},
    ];
  } else {
    cats = [
      {title:"IT Support & Infrastructure",color:C.cyber, skills:["Hardware Troubleshooting","Network LAN/WAN","Windows OS","CCTV Install","Email Server","Preventive Maintenance","IT Asset Management","VoIP Systems"]},
      {title:"Programming & Web Dev",      color:C.purple,skills:["PHP / Laravel","Python","JavaScript","MySQL","Tailwind CSS","Git","REST API","HTML5 / CSS3"]},
      {title:"Data Science & AI",          color:C.green, skills:["Machine Learning","Data Analysis","Pandas / NumPy","Scikit-learn","Jupyter Notebook","Statistical Analysis","Data Visualization","AI Implementation"]},
      {title:"Tools & Soft Skills",        color:C.yellow,skills:["Microsoft Office","Linux CLI","Documentation","Problem Solving","Time Management","Team Work","Fast Learner","Communication"]},
    ];
  }
  const cw=4.55, ch=2.05, colX=[0.28,5.17], rowY=[1.12,3.32];
  cats.slice(0,4).forEach((cat,i)=>{
    const x=colX[i%2], y=rowY[Math.floor(i/2)], sk=cat.skills.slice(0,8);
    s.addShape(pres.shapes.RECTANGLE, {x,y,w:cw,h:ch,fill:{color:C.bgCard},line:{color:cat.color,width:0.4},shadow:shadow()});
    s.addShape(pres.shapes.RECTANGLE, {x,y,w:0.06,h:ch,fill:{color:cat.color},line:{color:cat.color,width:0}});
    s.addShape(pres.shapes.RECTANGLE, {x,y,w:cw,h:0.04,fill:{color:cat.color,transparency:50},line:{color:cat.color,width:0}});
    s.addText(cat.title, {x:x+0.16,y:y+0.07,w:cw-0.22,h:0.26,fontSize:10,fontFace:"Arial Black",color:cat.color,bold:true,margin:0});
    rule(s,x+0.16,y+0.36,cw-0.26,cat.color,70);
    const half=Math.ceil(sk.length/2), L=sk.slice(0,half), R=sk.slice(half);
    if (L.length>0) s.addText(L.map((n,si)=>({text:n,options:{bullet:true,breakLine:si<L.length-1,color:C.slate}})),{x:x+0.16,y:y+0.44,w:cw/2-0.1,h:ch-0.52,fontSize:8,fontFace:"Calibri",valign:"top",margin:0,paraSpaceAfter:1});
    if (R.length>0) s.addText(R.map((n,si)=>({text:n,options:{bullet:true,breakLine:si<R.length-1,color:C.slate}})),{x:x+cw/2+0.06,y:y+0.44,w:cw/2-0.22,h:ch-0.52,fontSize:8,fontFace:"Calibri",valign:"top",margin:0,paraSpaceAfter:1});
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// SLIDES — PROJECTS
// Featured  → 1 slide per project (full layout + image)
// Non-feat  → grid 3×2 (6 per slide)
// ═════════════════════════════════════════════════════════════════════════════
const featProjects    = projects.filter(p=>p.is_featured);
const nonFeatProjects = projects.filter(p=>!p.is_featured);

// ── Featured: 1 slide each ──
featProjects.forEach((proj, pi) => {
  const s = pres.addSlide();
  s.background = { color:C.bg };
  const accent = ACCENTS[pi % ACCENTS.length];

  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:0.08, h:5.625, fill:{color:accent}, line:{color:accent,width:0} });
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:10, h:0.07,  fill:{color:accent,transparency:60}, line:{color:accent,width:0} });

  chip(s, `FEATURED PROJECT  ${pi+1}/${featProjects.length}`, 0.22, 0.17, 2.6);

  const cat = (proj.category||"").toLowerCase();
  let tag="PROJECT";
  if (/web|app|site|laravel|php/.test(cat)) tag="WEB APP";
  else if (/ml|machine|data|ai/.test(cat)) tag="ML / AI";
  else if (/infra|network|cisco/.test(cat)) tag="INFRA";
  else if (/gov|dprd/.test(cat)) tag="GOV APP";
  else if (proj.category) tag=proj.category.toUpperCase().substring(0,10);

  const imgData = loadImg(proj.image_url);
  const hasImg  = !!imgData;

  // Layout: left text col width depends on image
  const LW = hasImg ? 5.55 : 9.5;
  const LX = 0.22;

  // Title
  s.addText(proj.title||"Untitled", { x:LX, y:0.44, w:LW, h:0.68, fontSize:26, fontFace:"Arial Black", color:C.white, bold:true, margin:0 });

  // Tag + category badges
  s.addShape(pres.shapes.RECTANGLE, { x:LX, y:1.18, w:1.1, h:0.22, fill:{color:accent,transparency:85}, line:{color:accent,width:0.5} });
  s.addText(tag, { x:LX, y:1.18, w:1.1, h:0.22, fontSize:7, fontFace:"Consolas", color:accent, align:"center", valign:"middle", bold:true, charSpacing:1, margin:0 });
  if (proj.category) {
    s.addShape(pres.shapes.RECTANGLE, { x:LX+1.18, y:1.18, w:1.5, h:0.22, fill:{color:C.bgCard}, line:{color:C.slateDeep,width:0.3} });
    s.addText(proj.category, { x:LX+1.18, y:1.18, w:1.5, h:0.22, fontSize:7, fontFace:"Consolas", color:C.slateDeep, align:"center", valign:"middle", margin:0 });
  }

  rule(s, LX, 1.48, LW, accent, 65);

  // Description – full text
  s.addText(proj.description||"", { x:LX, y:1.58, w:LW, h:1.52, fontSize:9.5, fontFace:"Calibri", color:C.slate, valign:"top", lineSpacingMultiple:1.35, margin:0 });

  // Tech stack
  const techArr = Array.isArray(proj.tech_stack)?proj.tech_stack:[];
  if (techArr.length>0) {
    s.addText("TECH STACK", { x:LX, y:3.18, w:2, h:0.18, fontSize:7, fontFace:"Consolas", color:C.slateDeep, charSpacing:2, margin:0 });
    rule(s, LX, 3.36, LW, C.slateDeep, 70);
    let px = LX;
    techArr.slice(0,8).forEach(t=>{
      const tw = Math.max(t.length*0.075+0.3, 0.72);
      if (px+tw > LX+LW-0.05) return;
      s.addShape(pres.shapes.RECTANGLE, {x:px,y:3.44,w:tw,h:0.24,fill:{color:accent,transparency:88},line:{color:accent,width:0.4}});
      s.addText(t, {x:px,y:3.44,w:tw,h:0.24,fontSize:7.5,fontFace:"Consolas",color:accent,align:"center",valign:"middle",margin:0});
      px += tw+0.1;
    });
  }

  // Links
  const links = [];
  if (proj.github_url) links.push({lbl:"GitHub",url:proj.github_url});
  if (proj.demo_url)   links.push({lbl:"Live Demo",url:proj.demo_url});
  links.forEach((lk,li)=>{
    const lx=LX+li*1.55;
    s.addShape(pres.shapes.RECTANGLE, {x:lx,y:3.8,w:1.4,h:0.3,fill:{color:C.bgCard},line:{color:accent,width:0.5}});
    s.addText(`🔗 ${lk.lbl}`, {x:lx,y:3.8,w:1.4,h:0.3,fontSize:8,fontFace:"Consolas",color:accent,align:"center",valign:"middle",margin:0});
  });

  // ── Image panel (right) ──
  if (hasImg) {
    const IX=5.98, IY=0.32, IW=3.75, IH=4.85;
    s.addShape(pres.shapes.RECTANGLE, {x:IX,y:IY,w:IW,h:IH,fill:{color:C.bgCard},line:{color:accent,width:0.5},shadow:shadow()});
    s.addShape(pres.shapes.RECTANGLE, {x:IX,y:IY,w:IW,h:0.04,fill:{color:accent},line:{color:accent,width:0}});
    s.addImage({ data:imgData, x:IX+0.06, y:IY+0.1, w:IW-0.12, h:IH-0.16, sizing:{type:"contain",w:IW-0.12,h:IH-0.16} });
  }

  // Bottom strip
  s.addShape(pres.shapes.RECTANGLE, {x:0,y:5.28,w:10,h:0.345,fill:{color:C.bgCard},line:{color:C.bgCard,width:0}});
  s.addShape(pres.shapes.RECTANGLE, {x:0,y:5.275,w:10,h:0.015,fill:{color:accent,transparency:60},line:{color:accent,width:0}});
  s.addText(brandName, {x:0.2,y:5.28,w:2,h:0.345,fontSize:8,fontFace:"Consolas",color:C.slateDeep,valign:"middle",margin:0});
});

// ── Non-featured: grid 3×2 ──
if (nonFeatProjects.length>0) {
  const PPS=6;
  for (let pi=0;pi<Math.ceil(nonFeatProjects.length/PPS);pi++) {
    const s = pres.addSlide();
    s.background = {color:C.bg};
    s.addShape(pres.shapes.RECTANGLE, {x:9.92,y:0,w:0.08,h:5.625,fill:{color:C.purple},line:{color:C.purple,width:0}});
    const ttl = Math.ceil(nonFeatProjects.length/PPS);
    chip(s, ttl>1?`MORE PROJECTS  ${pi+1}/${ttl}`:"MORE PROJECTS", 0.4, 0.18, 2.3);
    s.addText("Other Projects", {x:0.4,y:0.46,w:9.2,h:0.5,fontSize:28,fontFace:"Arial Black",color:C.white,bold:true,margin:0});
    rule(s,0.4,1.0,9.2,C.purple,60);

    nonFeatProjects.slice(pi*PPS,(pi+1)*PPS).forEach((proj,i)=>{
      const col=i%3, row=Math.floor(i/3);
      const x=0.28+col*3.2, y=1.14+row*2.08;
      const cw=3.06, ch=1.96, accent=ACCENTS[i%ACCENTS.length];
      const cat=(proj.category||"").toLowerCase();
      let tag="PROJECT";
      if (/web|app|site|laravel|php/.test(cat)) tag="WEB APP";
      else if (/ml|machine|data|ai/.test(cat)) tag="ML / AI";
      else if (/infra|network|cisco/.test(cat)) tag="INFRA";
      else if (/gov|dprd/.test(cat)) tag="GOV APP";
      else if (proj.category) tag=proj.category.toUpperCase().substring(0,10);

      s.addShape(pres.shapes.RECTANGLE, {x,y,w:cw,h:ch,fill:{color:C.bgCard},line:{color:accent,width:0.3},shadow:shadow()});
      s.addShape(pres.shapes.RECTANGLE, {x,y,w:cw,h:0.04,fill:{color:accent},line:{color:accent,width:0}});
      s.addShape(pres.shapes.RECTANGLE, {x:x+cw-0.92,y:y+0.07,w:0.84,h:0.2,fill:{color:accent,transparency:85},line:{color:accent,width:0.4}});
      s.addText(tag,{x:x+cw-0.92,y:y+0.07,w:0.84,h:0.2,fontSize:6,fontFace:"Consolas",color:accent,align:"center",valign:"middle",bold:true,charSpacing:1,margin:0});
      s.addText(trunc(proj.title||"Untitled",45),{x:x+0.14,y:y+0.04,w:cw-1.05,h:0.36,fontSize:9.5,fontFace:"Calibri",color:C.white,bold:true,margin:0});
      const ts=(Array.isArray(proj.tech_stack)?proj.tech_stack:[]).slice(0,5).join(" · ")||proj.category||"";
      if (ts) s.addText(trunc(ts,60),{x:x+0.14,y:y+0.34,w:cw-0.22,h:0.2,fontSize:7,fontFace:"Consolas",color:accent,margin:0});
      rule(s,x+0.14,y+0.57,cw-0.24,accent,75);
      s.addText(trunc(proj.description||"",160),{x:x+0.14,y:y+0.65,w:cw-0.22,h:ch-0.72,fontSize:8,fontFace:"Calibri",color:C.slate,valign:"top",lineSpacingMultiple:1.2,margin:0});
      const lnk=[];
      if (proj.github_url) lnk.push("🐙 GitHub");
      if (proj.demo_url)   lnk.push("🌐 Demo");
      if (lnk.length>0) s.addText(lnk.join("  ·  "),{x:x+0.14,y:y+ch-0.24,w:cw-0.22,h:0.2,fontSize:7,fontFace:"Consolas",color:C.slateDeep,margin:0});
    });
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// LAST SLIDE — CONTACT
// FIX: icon diganti kotak putih terang, dot bawah dihilangkan,
//      "AVAILABLE FOR HIRE" turun (bottomY+0.5)
// ═════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = {color:C.bg};
  dots(s,22,13,0,0,0.48,0.47);

  s.addShape(pres.shapes.RECTANGLE, {x:1.1,y:0.42,w:7.8,h:4.96,fill:{color:C.bgCard},line:{color:C.cyber,width:0.5},shadow:shadow()});
  s.addShape(pres.shapes.RECTANGLE, {x:1.1,y:0.42,w:7.8,h:0.06,fill:{color:C.cyber}, line:{color:C.cyber, width:0}});
  s.addShape(pres.shapes.RECTANGLE, {x:1.1,y:5.32,w:7.8,h:0.06,fill:{color:C.purple},line:{color:C.purple,width:0}});

  chip(s,"LET'S CONNECT",4.15,0.57,1.7);
  s.addText("Got a project in mind?", {x:1.3,y:0.93,w:7.4,h:0.55,fontSize:28,fontFace:"Arial Black",color:C.white,bold:true,align:"center",margin:0});
  s.addText("Mari diskusi dan wujudkan ide kamu menjadi solusi nyata.",{x:1.3,y:1.53,w:7.4,h:0.3,fontSize:11,fontFace:"Calibri",color:C.slate,align:"center",margin:0});
  rule(s,2.5,1.92,5.0,C.cyber,60);

  // ── Contact items: simbol putih di dalam kotak warna ──
  const contactGrid = [
    ownerEmail    ? {sym:"@",    lbl:"EMAIL",     val:ownerEmail,                                    color:C.cyber } : null,
    ownerPhone    ? {sym:"☎",   lbl:"PHONE",     val:ownerPhone,                                    color:C.green } : null,
    ownerGithub   ? {sym:"< >",  lbl:"GITHUB",    val:ownerGithub.replace(/https?:\/\//,""),         color:C.purple} : null,
    ownerLinkedin ? {sym:"in",   lbl:"LINKEDIN",  val:ownerLinkedin.replace(/https?:\/\//,""),       color:C.yellow} : null,
    ownerInstagram? {sym:"◎",   lbl:"INSTAGRAM", val:ownerInstagram.replace(/https?:\/\//,""),      color:C.purple} : null,
    ownerLocation ? {sym:"▲",   lbl:"LOCATION",  val:ownerLocation,                                  color:C.cyber } : null,
  ].filter(Boolean).slice(0,6);

  const gi = contactGrid.length%2!==0&&contactGrid.length>1 ? contactGrid.slice(0,contactGrid.length-1) : contactGrid;
  const CC = gi.length>2 ? 2 : 1;
  const CW = CC===2 ? 3.4 : 5.5;
  const CXS= CC===2 ? [1.45,5.15] : [2.25];

  gi.forEach((c,i) => {
    const col=i%CC, row=Math.floor(i/CC);
    const x=CXS[col], y=2.07+row*0.73;

    // Card bg
    s.addShape(pres.shapes.RECTANGLE, {x,y,w:CW,h:0.6,fill:{color:C.bg},line:{color:c.color,width:0.3}});

    // ── Icon box: background warna, simbol putih besar ──
    s.addShape(pres.shapes.RECTANGLE, {x:x+0.06,y:y+0.07,w:0.48,h:0.46,fill:{color:c.color,transparency:75},line:{color:c.color,width:0.5}});
    s.addText(c.sym, {x:x+0.06,y:y+0.07,w:0.48,h:0.46,fontSize:11,fontFace:"Arial Black",color:C.white,align:"center",valign:"middle",bold:true,margin:0});

    s.addText(c.lbl,          {x:x+0.64,y:y+0.05,w:CW-0.74,h:0.22,fontSize:7,  fontFace:"Consolas",color:c.color,  bold:true,charSpacing:1.5,margin:0});
    s.addText(trunc(c.val,45),{x:x+0.64,y:y+0.27,w:CW-0.74,h:0.22,fontSize:8.5,fontFace:"Calibri", color:C.offWhite,margin:0});
  });

  // ── Bottom: tagline + AVAILABLE FOR HIRE (turun, tanpa dot yang overlap) ──
  const rowsUsed = Math.ceil(gi.length/CC);
  const bottomY  = 2.07 + rowsUsed*0.73 + 0.18;

  s.addText("Open to full-time roles, internships, freelance projects & collaborations.", {
    x:1.3, y:bottomY, w:7.4, h:0.28, fontSize:9, fontFace:"Consolas", color:C.slateDeep, align:"center", charSpacing:0.5, margin:0,
  });

  // "AVAILABLE FOR HIRE" turun jauh dari tagline agar tidak overlap, dot di SISI LUAR teks
  const AY = bottomY + 0.48;
  // dot kiri-kanan di luar zona teks
  s.addShape(pres.shapes.OVAL, {x:3.2, y:AY+0.1, w:0.08, h:0.08, fill:{color:C.green}, line:{color:C.green,width:0}});
  s.addShape(pres.shapes.OVAL, {x:6.7, y:AY+0.1, w:0.08, h:0.08, fill:{color:C.green}, line:{color:C.green,width:0}});
  s.addText("AVAILABLE FOR HIRE", {
    x:1.3, y:AY, w:7.4, h:0.28, fontSize:10, fontFace:"Consolas", color:C.green, align:"center", bold:true, charSpacing:2, margin:0,
  });

  // Footer
  s.addText(`Generated by ${brandName}  ·  ${generatedAt}`, {
    x:1.3, y:5.35, w:7.4, h:0.2, fontSize:7.5, fontFace:"Consolas", color:C.slateDeep, align:"center", margin:0,
  });
}

// ── Write ────────────────────────────────────────────────────────────────────
pres.writeFile({ fileName: outputPath })
  .then(()=>{ console.log("PPTX generated:", outputPath); process.exit(0); })
  .catch(err=>{ console.error("Error:", err); process.exit(1); });
