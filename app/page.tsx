'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';

// ── Types ──────────────────────────────────────────────
interface Project { _id: string; title: string; slug: string; techStack: string[]; githubUrl?: string; demoUrl?: string; isFeatured: boolean; imagePath: string; shortDescription?: string; }
interface Skill { _id: string; name: string; icon?: string; category: 'hard' | 'soft'; }
interface Experience { _id: string; title: string; company: string; startDate: string; endDate?: string | null; description: string; location?: string; }
interface Settings { [key: string]: string; }

const DEFAULT_SETTINGS: Settings = {
  hero_title: 'Loading...',
  hero_subtitle: 'Initializing system...',
  about_title: 'Tentang',
  about_text: '...',
  brand_initials: 'SYS',
  brand_suffix: '.INIT'
};

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

export default function HomePage() {
  // ── Context (tema & game dari ThemeProvider) ────────
  const { isLight, gameUnlocked, setGameUnlocked } = useTheme();

  // ── Data States ─────────────────────────────────────
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // ── UI States ────────────────────────────────────────
  const [typedText, setTypedText] = useState('');
  const [visibleCount, setVisibleCount] = useState(3);
  const [termLines, setTermLines] = useState<{ text: string; type: string }[]>([
    { text: '<span class="term-dim">// Initializing system connection...</span>', type: 'dim' },
    { text: '<span class="term-dim">// Fetching data from mainframe...</span>', type: 'dim' },
  ]);
  const [termInput, setTermInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIndex, setHistIndex] = useState(-1);
  const [showMatrix, setShowMatrix] = useState(false);
  const [showPuzzle, setShowPuzzle] = useState(false);
  const [showJumpscare, setShowJumpscare] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [puzzleStep, setPuzzleStep] = useState(0);
  const [puzzleInput, setPuzzleInput] = useState('');
  const [puzzleFeedback, setPuzzleFeedback] = useState('');
  const [puzzleHints, setPuzzleHints] = useState(0);
  const [toast, setToast] = useState<{ msg: string; color: string } | null>(null);
  const [trailDots, setTrailDots] = useState<{ x: number; y: number; id: number }[]>([]);
  const [logoClicks, setLogoClicks] = useState(0);
  const [globalBuffer, setGlobalBuffer] = useState('');

  const termBodyRef = useRef<HTMLDivElement>(null);
  const termInputRef = useRef<HTMLInputElement>(null);
  const matrixRef = useRef<HTMLCanvasElement>(null);
  const confettiRef = useRef<HTMLDivElement>(null);
  const logoClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trailIdRef = useRef(0);

  // ── Fetch Data ──────────────────────────────────────
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [projRes, skillRes, expRes, setRes] = await Promise.all([
          fetch('/api/projects?featured=true').then(r => r.json()),
          fetch('/api/skills').then(r => r.json()),
          fetch('/api/experiences').then(r => r.json()),
          fetch('/api/settings').then(r => r.json()),
        ]);

        console.log('📦 Projects Response:', projRes); // TAMBAHKAN INI
        console.log('📊 Projects Data:', projRes.data);
        
        if (projRes.data) setProjects(projRes.data);
        if (skillRes.data) setSkills(skillRes.data);
        if (expRes.data) setExperiences(expRes.data);
        if (setRes.data) {
          const obj = setRes.data.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {});
          setSettings(prev => ({ ...prev, ...obj }));
        }
        setIsDataLoaded(true);
      } catch (err) {
        console.error('Fetch error:', err);
        setTermLines(prev => [...prev, { text: '<span class="term-error">ERR: Database connection failed.</span>', type: '' }]);
      }
    };
    fetchAllData();
  }, []);

  // ── Terminal Awal ───────────────────────────────────
  useEffect(() => {
    if (!isDataLoaded) return;
    setTermLines([
      { text: '<span class="term-success">✓ Connected. Data loaded.</span>', type: '' },
      { text: '<span class="term-cyber">$</span> whoami', type: '' },
      { text: settings.hero_title || 'Operator', type: '' },
      { text: '<span class="term-cyber">$</span> cat skills.txt', type: '' },
      ...skills.slice(0, 4).map(s => ({ text: `  <span style="color:#7c3aed">▸</span> ${s.name}`, type: '' })),
      { text: '<span class="term-cyber">$</span> git log --oneline -3', type: '' },
      ...projects.slice(0, 3).map((p, i) => ({ text: `<span style="color:#f59e0b">${String(i+1).padStart(7,'0')}</span> ${p.title}`, type: '' })),
    ]);
  }, [isDataLoaded, skills, projects, settings.hero_title]);

  // ── Terminal Commands ───────────────────────────────
  const TERMINAL_COMMANDS: Record<string, (args: string[]) => string | string[]> = useMemo(() => ({
    help: () => ['<span class="term-cyber">Available commands:</span>',
      '  <span class="term-info">whoami</span>    — identify operator',
      '  <span class="term-info">skills</span>    — list capabilities',
      '  <span class="term-info">projects</span>  — display project log',
      '  <span class="term-info">contact</span>   — reach out',
      '  <span class="term-info">clear</span>     — wipe terminal',
      '  <span class="term-info">matrix</span>    — enter the simulation',
      '  <span class="term-warn">// There are hidden commands...</span>'],
    whoami: () => [`<span class="term-white">${settings.hero_title || 'Operator'}</span>`, '<span class="term-dim">uid=1000(operator) groups=1000(admin)</span>'],
    skills: () => skills.length > 0 ? skills.slice(0,6).map(s => `  <span class="term-purple">▸</span> ${s.name}`) : ['<span class="term-dim">No skills found.</span>'],
    projects: () => projects.length > 0 ? projects.slice(0,4).map((p,i) => `<span class="term-yellow">${String(i+1).padStart(7,'0')}</span> ${p.title}`) : ['<span class="term-dim">No projects found.</span>'],
    contact: () => [`<span class="term-success">→ ${settings.contact_email || 'No email'}</span>`, `<span class="term-success">→ ${settings.contact_phone || 'No phone'}</span>`],
    ls: () => ['<span class="term-info">portfolio/</span>  <span class="term-info">skills/</span>  <span class="term-success">README.md</span>  <span class="term-error">.secrets</span>  <span class="term-warn">.easter_egg</span>'],
    date: () => [new Date().toString()],
    uname: () => ['MIA.Dev v2.0.0 Portfolio-OS x86_64 Next.js'],
    pwd: () => ['/home/operator/portfolio'],
    coffee: () => ['<span class="term-warn">☕ Brewing...</span>', '  ████████░░ 80%', '<span class="term-success">Coffee ready. Productivity +200%.</span>'],
    sudo: (args) => args.join(' ').includes('rm -rf') ? ['<span class="term-error">Nice try.</span>'] : ['<span class="term-error">Access denied — not in sudoers file.</span>'],
    neofetch: () => ['<span class="term-cyber">  ███╗   ███╗██╗ █████╗ </span>', '<span class="term-cyber">  ████╗ ████║██║██╔══██╗</span>', '  OS: Portfolio-OS 2.0', '  Stack: Next.js + MongoDB'],
    '42': () => ['<span class="term-warn">The answer to life, the universe, and everything.</span>'],
    vim: () => ['<span class="term-warn">Entering vim... good luck escaping.</span>'],
    exit: () => ['<span class="term-warn">There is no escape from this portfolio. 😈</span>'],
    '.easter_egg': () => ['<span class="term-warn">🥚 EASTER EGG FOUND!</span>', 'Have you tried the Konami Code? ↑↑↓↓←→←→BA'],
    echo: (args) => [args.join(' ') || ''],
    clear: () => [],
  }), [skills, projects, settings]);

  // ── Typing Effect ───────────────────────────────────
  useEffect(() => {
    const phrases = ['Full Stack Developer', 'Problem Solver', 'AI Engineer Enthusiast', 'Easter Egg Hunter 🥚'];
    let pi = 0, ci = 0, deleting = false;
    const tick = () => {
      const cur = phrases[pi];
      setTypedText(deleting ? cur.slice(0, ci--) : cur.slice(0, ci++));
      let delay = deleting ? 50 : 100;
      if (!deleting && ci === cur.length + 1) { delay = 2000; deleting = true; }
      if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; delay = 300; }
      setTimeout(tick, delay);
    };
    const t = setTimeout(tick, 500);
    return () => clearTimeout(t);
  }, []);

  // ── Cursor Trail (desktop only) ─────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth <= 1024) return;
    let last = 0;
    const handler = (e: MouseEvent) => {
      const now = Date.now();
      if (now - last < 50) return;
      last = now;
      const id = trailIdRef.current++;
      setTrailDots(d => [...d.slice(-12), { x: e.clientX, y: e.clientY, id }]);
      setTimeout(() => setTrailDots(d => d.filter(dot => dot.id !== id)), 600);
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  // ── Konami ──────────────────────────────────────────
  useEffect(() => {
    let idx = 0;
    const handler = (e: KeyboardEvent) => {
      if (document.activeElement === termInputRef.current) return;
      if (e.key === KONAMI[idx]) {
        idx++;
        if (idx === KONAMI.length) { idx = 0; setTimeout(() => setShowJumpscare(true), 300); }
      } else { idx = 0; }
      if (e.key.length === 1) {
        setGlobalBuffer(b => {
          const next = (b + e.key.toLowerCase()).slice(-10);
          if (next.includes('iddqd')) showToast('💀 GOD MODE activated. (not really)', '#f87171');
          return next;
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Matrix Canvas ────────────────────────────────────
  useEffect(() => {
    if (!showMatrix || !matrixRef.current) return;
    const canvas = matrixRef.current;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const chars = 'アイウエオカキクケコ0123456789ABCDEF<>{}[]';
    const cols = Math.floor(canvas.width / 16);
    const drops = Array(cols).fill(1);
    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00ff41'; ctx.font = '14px monospace';
      drops.forEach((y, i) => {
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 16, y * 16);
        if (y * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    };
    const anim = setInterval(draw, 50);
    return () => clearInterval(anim);
  }, [showMatrix]);

  // ── Terminal Logic ───────────────────────────────────
  const addLines = (lines: string[]) => {
    setTermLines(prev => [...prev, ...lines.map(t => ({ text: t, type: '' }))]);
    setTimeout(() => { if (termBodyRef.current) termBodyRef.current.scrollTop = termBodyRef.current.scrollHeight; }, 50);
  };

  const runCommand = (raw: string) => {
    const trimmed = raw.trim().toLowerCase();
    if (!trimmed) return;
    setCmdHistory(h => [raw, ...h]);
    setHistIndex(-1);
    addLines([`<span style="color:#00d9ff">$</span> ${raw}`]);
    if (trimmed === 'clear') { setTermLines([]); return; }
    if (trimmed === 'matrix') { setShowMatrix(true); addLines(['<span style="color:#34d399">Entering the Matrix...</span>']); return; }
    if (trimmed === 'open sesame') { setTimeout(() => setShowPuzzle(true), 400); addLines(['<span style="color:#fbbf24">⚡ ENCRYPTED SEQUENCE DETECTED</span>']); return; }
    if (trimmed === 'hack') { runHackMode(); return; }
    const key = trimmed.split(' ')[0];
    const args = trimmed.split(' ').slice(1);
    const handler = TERMINAL_COMMANDS[trimmed] || TERMINAL_COMMANDS[key];
    if (handler) {
      const result = handler(args);
      const lines = Array.isArray(result) ? result : [result];
      if (lines.length > 0) addLines(lines);
    } else {
      addLines([`<span style="color:#f87171">command not found: ${raw.split(' ')[0]}</span>`, `<span style="color:#475569">// type 'help' for commands</span>`]);
    }
  };

  const runHackMode = () => {
    setTermLines([]);
    const lines = ['INITIATING BREACH SEQUENCE...','Scanning topology...','Bypassing firewall... [DONE]','Injecting payload... [DONE]','Accessing mainframe... [DONE]','sudo su -','root@mainframe:~#','','🥚 EASTER EGG: You are now root.','// This is purely theatrical.','// type "clear" to exit'];
    lines.forEach((l, i) => setTimeout(() => addLines([
      l.includes('DONE') ? `<span style="color:#34d399">${l}</span>` :
      l.startsWith('//') ? `<span style="color:#475569">${l}</span>` :
      l.startsWith('root') || l.startsWith('sudo') ? `<span style="color:#fbbf24">${l}</span>` :
      l.includes('INITIATING') ? `<span style="color:#f87171">${l}</span>` : l
    ]), i * 200));
  };

  const handleTermKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { runCommand(termInput); setTermInput(''); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); const next = Math.min(histIndex + 1, cmdHistory.length - 1); setHistIndex(next); setTermInput(cmdHistory[next] || ''); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); const next = Math.max(histIndex - 1, -1); setHistIndex(next); setTermInput(next === -1 ? '' : cmdHistory[next]); }
    else if (e.key === 'Tab') { e.preventDefault(); const partial = termInput.toLowerCase(); const match = Object.keys(TERMINAL_COMMANDS).find(k => k.startsWith(partial) && k !== partial); if (match) setTermInput(match); }
  };

  // ── Puzzle ───────────────────────────────────────────
  const PUZZLES = [
    { q: 'I am always in front of you but cannot be seen.\nI can be given but never taken.\nDevelopers use me every day.\n\nWhat am I?', a: ['time','waktu'], hints: ['Developers are always chasing it...', 'It flies when coding at 2am.'] },
    { q: 'I have keys but no locks.\nI have space but no room.\nYou enter me but cannot go inside.\n\nWhat am I?', a: ['keyboard','papan ketik'], hints: ['You\'re using one right now.', 'QWERTY?'] },
    { q: 'The version control system created by Linus Torvalds.\nUsed by millions of developers worldwide.\n\nWhat is it?', a: ['git'], hints: ['commit, push, pull...', 'Linus made it.'] },
  ];

  const checkPuzzle = () => {
    if (PUZZLES[puzzleStep].a.includes(puzzleInput.trim().toLowerCase())) {
      setPuzzleFeedback('✓ CORRECT — Access sequence accepted.');
      const next = puzzleStep + 1;
      if (next >= PUZZLES.length) { setTimeout(() => { setShowPuzzle(false); unlockGame(); }, 800); }
      else { setTimeout(() => { setPuzzleStep(next); setPuzzleInput(''); setPuzzleFeedback(''); setPuzzleHints(0); }, 900); }
    } else { setPuzzleFeedback('✗ DENIED — Try again.'); }
  };

  const unlockGame = () => {
    // setGameUnlocked dari ThemeProvider sudah handle localStorage
    setGameUnlocked(true);
    setShowUnlock(true);
    spawnConfetti();
  };

  const spawnConfetti = () => {
    if (!confettiRef.current) return;
    const colors = ['#00d9ff','#7c3aed','#ec4899','#10b981','#f59e0b'];
    for (let i = 0; i < 80; i++) {
      const p = document.createElement('div');
      p.style.cssText = `position:absolute;left:${Math.random()*100}%;width:${4+Math.random()*8}px;height:${4+Math.random()*8}px;border-radius:${Math.random()>.5?'50%':'2px'};background:${colors[Math.floor(Math.random()*colors.length)]};animation:confettiFall ${1.5+Math.random()*2}s ${Math.random()*.5}s linear forwards;`;
      confettiRef.current.appendChild(p);
    }
  };

  const showToast = (msg: string, color = '#00d9ff') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    const next = logoClicks + 1;
    setLogoClicks(next);
    if (logoClickTimerRef.current) clearTimeout(logoClickTimerRef.current);
    logoClickTimerRef.current = setTimeout(() => setLogoClicks(0), 600);
    if (next >= 5) { e.preventDefault(); setLogoClicks(0); showToast('🥚 Easter Egg: You clicked the logo 5 times!', '#7c3aed'); }
  };

  // ── Theme Tokens ─────────────────────────────────────
  const t = isLight;
  const cyber   = t ? '#0077aa' : '#00d9ff';
  const bg      = t ? '#f0f4ff' : '#0a0e27';
  const bgCard  = t ? '#ffffff' : '#151b3b';
  const textPri = t ? '#0f172a' : '#e2e8f0';
  const textSec = t ? '#334155' : '#94a3b8';
  const textMut = t ? '#64748b' : '#475569';
  const borderSub = t ? 'rgba(0,140,180,0.12)' : 'rgba(0,217,255,0.1)';
  const borderMed = t ? 'rgba(0,140,180,0.25)' : 'rgba(0,217,255,0.2)';
  const purple  = '#7c3aed';
  const green   = '#10b981';
  const s       = settings;
  const visibleProjects = projects.slice(0, visibleCount);
  const perRow  = 3;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500&family=Outfit:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; font-family: 'Outfit', sans-serif; }
        body { background: ${bg}; color: ${textPri}; overflow-x: hidden; transition: background 0.4s, color 0.4s; }
        body::before { content:''; position:fixed; inset:0; background-image:linear-gradient(${t?'rgba(0,140,180,0.06)':'rgba(0,217,255,0.04)'} 1px,transparent 1px),linear-gradient(90deg,${t?'rgba(0,140,180,0.06)':'rgba(0,217,255,0.04)'} 1px,transparent 1px); background-size:40px 40px; pointer-events:none; z-index:0; }

        /* Utilities */
        .section-tag { font-family:'DM Mono',monospace; font-size:0.7rem; letter-spacing:0.2em; text-transform:uppercase; color:${cyber}; display:flex; align-items:center; gap:8px; }
        .section-tag::before { content:''; width:24px; height:1px; background:${cyber}; }
        .btn-primary { display:inline-flex; align-items:center; gap:8px; padding:10px 24px; background:linear-gradient(135deg,rgba(0,217,255,0.13),rgba(124,58,237,0.13)); border:1px solid ${cyber}; color:${cyber}; font-family:'DM Mono',monospace; font-size:0.8rem; letter-spacing:0.1em; text-transform:uppercase; transition:all 0.3s; cursor:pointer; text-decoration:none; white-space:nowrap; }
        .btn-primary:hover { background:${cyber}; color:#0a0e27; box-shadow:0 0 30px ${cyber}40; }
        .btn-ghost { display:inline-flex; align-items:center; gap:8px; padding:10px 20px; border:1px solid rgba(124,58,237,0.4); background:rgba(124,58,237,0.05); color:${purple}; font-family:'DM Mono',monospace; font-size:0.75rem; letter-spacing:0.1em; text-transform:uppercase; transition:all 0.3s; text-decoration:none; white-space:nowrap; }
        .btn-ghost:hover { border-color:${purple}; background:rgba(124,58,237,0.12); }
        .btn-muted { display:inline-flex; align-items:center; gap:8px; padding:10px 24px; border:1px solid ${t?'#cbd5e1':'#334155'}; color:${textSec}; font-family:'DM Mono',monospace; font-size:0.75rem; letter-spacing:0.1em; text-transform:uppercase; transition:all 0.3s; text-decoration:none; white-space:nowrap; }
        .btn-muted:hover { border-color:rgba(0,217,255,0.5); color:#fff; }
        .card { background:${bgCard}; border:1px solid ${borderSub}; transition:all 0.3s; }
        .card:hover { border-color:${t?'rgba(0,140,180,0.5)':'rgba(0,217,255,0.4)'}; transform:translateY(-4px); box-shadow:0 20px 40px rgba(0,0,0,0.4),0 0 20px ${cyber}1a; }
        .cursor-blink { display:inline-block; width:2px; height:1.1em; background:${cyber}; margin-left:2px; vertical-align:text-bottom; animation:blink 1s step-end infinite; }

        /* Terminal colours */
        .term-cyber { color:${cyber}; }
        .term-error { color:#f87171; }
        .term-success { color:#34d399; }
        .term-info { color:#60a5fa; }
        .term-warn { color:#fbbf24; }
        .term-dim { color:#475569; }
        .term-white { color:#e2e8f0; }
        .term-purple { color:${purple}; }
        .term-yellow { color:#f59e0b; }
        .term-line { animation:fadein 0.15s ease-out; }
        #term-body::-webkit-scrollbar { width:4px; }
        #term-body::-webkit-scrollbar-thumb { background:rgba(0,217,255,0.3); }

        /* Keyframes */
        @keyframes blink { 0%,100%{opacity:1}50%{opacity:0} }
        @keyframes float { 0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)} }
        @keyframes scanLine { 0%{top:-2px}100%{top:100%} }
        @keyframes confettiFall { 0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0} }
        @keyframes unlockPop { 0%{transform:scale(0) rotate(-20deg)}60%{transform:scale(1.2) rotate(5deg)}100%{transform:scale(1) rotate(0deg)} }
        @keyframes jumpscareShake { 0%,100%{transform:translate(0,0)}25%{transform:translate(-8px,6px)}50%{transform:translate(8px,-4px)}75%{transform:translate(-4px,8px)} }
        @keyframes flickerText { 0%,100%{opacity:1}50%{opacity:0.3} }
        @keyframes ping { 0%{transform:scale(1);opacity:1}75%,100%{transform:scale(2);opacity:0} }
        @keyframes fadein { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none} }
        @keyframes gameNavGlow { from{text-shadow:0 0 6px ${cyber}}to{text-shadow:0 0 20px ${purple}} }

        /* Decorative animation classes */
        .animate-float { animation:float 6s ease-in-out infinite; }
        .animate-float-delay { animation:float 6s ease-in-out infinite; animation-delay:1s; }
        .jumpscare-shake { animation:jumpscareShake 0.1s infinite; }
        .flicker { animation:flickerText 0.15s infinite; }
        .game-glow { animation:gameNavGlow 2s ease-in-out infinite alternate; }

        /* ── Responsive Layout ── */

        /* Section padding */
        .section-pad { padding: clamp(48px, 10vh, 96px) clamp(16px, 5vw, 48px); }

        /* Hero grid */
        .hero-grid { display:grid; grid-template-columns:1fr; gap:clamp(32px,8vw,64px); align-items:center; }
        @media (min-width:1024px) { .hero-grid { grid-template-columns:1fr 1fr; } }

        /* About grid */
        .about-grid { display:grid; grid-template-columns:1fr; gap:clamp(24px,5vw,40px); align-items:start; }
        @media (min-width:1024px) { .about-grid { grid-template-columns:3fr 2fr; } }

        /* Projects grid */
        .projects-grid { display:grid; grid-template-columns:1fr; gap:clamp(14px,3vw,20px); }
        @media (min-width:640px) { .projects-grid { grid-template-columns:repeat(2,1fr); } }
        @media (min-width:1024px) { .projects-grid { grid-template-columns:repeat(3,1fr); } }

        /* Skills grid */
        .skills-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:clamp(8px,2vw,12px); }
        @media (min-width:480px) { .skills-grid { grid-template-columns:repeat(3,1fr); } }
        @media (min-width:768px) { .skills-grid { grid-template-columns:repeat(4,1fr); } }
        @media (min-width:1024px) { .skills-grid { grid-template-columns:repeat(6,1fr); } }

        /* Stats grid */
        .stats-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:clamp(8px,2vw,12px); }
        @media (min-width:640px) { .stats-grid { grid-template-columns:repeat(4,1fr); } }

        /* Hide terminal on mobile */
        @media (max-width:1023px) { #terminal-container { display:none !important; } }

        /* Hero headings */
        .hero-h1 { font-family:'Syne',sans-serif; font-weight:800; font-size:clamp(2rem,7vw,4rem); line-height:1; letter-spacing:-0.02em; color:${t?'#0f172a':'#fff'}; margin-bottom:clamp(10px,2.5vw,16px); }
        .hero-typed { font-family:'DM Mono',monospace; font-size:clamp(1rem,3vw,1.5rem); color:${cyber}; margin-bottom:clamp(12px,3vw,24px); height:clamp(28px,5vw,40px); display:flex; align-items:center; }
        .hero-sub { color:${textSec}; font-size:clamp(14px,2.5vw,18px); line-height:1.7; margin-bottom:clamp(20px,5vw,32px); max-width:512px; }
        .hero-actions { display:flex; flex-wrap:wrap; gap:clamp(8px,2vw,16px); align-items:center; }

        /* Section headings */
        .section-h2 { font-family:'Syne',sans-serif; font-size:clamp(1.5rem,4vw,2.5rem); font-weight:700; color:${t?'#0f172a':'#fff'}; }

        /* Timeline */
        .timeline-wrap { position:relative; padding-left:clamp(16px,4vw,32px); }
        .timeline-line { position:absolute; left:0; top:0; bottom:0; width:1px; background:linear-gradient(to bottom,transparent,rgba(0,217,255,0.25),rgba(124,58,237,0.25),transparent); }
        .timeline-dot-wrap { position:absolute; left:clamp(-26px,-4.5vw,-26px); top:20px; display:flex; align-items:center; justify-content:center; }
        @media (max-width:639px) { .timeline-wrap { padding-left:0; } .timeline-line { display:none; } .timeline-dot-wrap { display:none; } }

        /* Profile JSON card */
        .profile-card { display:block; }
        @media (max-width:1023px) { .profile-card { display:none; } }

        /* CTA */
        .cta-wrap { max-width:768px; margin:0 auto; text-align:center; padding:0 clamp(16px,5vw,24px); }
      `}</style>

      {/* Cursor Trail (desktop) */}
      {trailDots.map(dot => (
        <div key={dot.id} style={{ position:'fixed', left:dot.x, top:dot.y, width:4, height:4, borderRadius:'50%', background:'rgba(0,217,255,0.4)', pointerEvents:'none', zIndex:9999, transform:'translate(-50%,-50%)', opacity:0, transition:'all 0.6s ease' }} />
      ))}

      {/* ── JUMPSCARE ── */}
      <AnimatePresence>
        {showJumpscare && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => { setShowJumpscare(false); setShowPuzzle(true); }}
            style={{ position:'fixed', inset:0, zIndex:99999, background:'#000', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', padding:'20px' }}>
            <div className="jumpscare-shake" style={{ textAlign:'center' }}>
              <div style={{ fontSize:'clamp(80px,25vw,200px)', lineHeight:1, filter:'drop-shadow(0 0 60px #ff0000)' }}>👁️</div>
              <div className="flicker" style={{ fontFamily:'DM Mono,monospace', color:'#ff0000', fontSize:'clamp(24px,7vw,48px)', fontWeight:'bold', letterSpacing:'0.3em', marginTop:20 }}>FOUND YOU</div>
              <div style={{ fontFamily:'DM Mono,monospace', color:'#ff4444', fontSize:'clamp(11px,2.5vw,14px)', marginTop:16, opacity:0.7 }}>[ click anywhere to continue ]</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MATRIX ── */}
      <AnimatePresence>
        {showMatrix && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setShowMatrix(false)}
            style={{ position:'fixed', inset:0, zIndex:9998, background:'rgba(0,0,0,0.97)', cursor:'pointer' }}>
            <canvas ref={matrixRef} style={{ width:'100%', height:'100%' }} />
            <div style={{ position:'absolute', bottom:40, left:'50%', transform:'translateX(-50%)', fontFamily:'DM Mono,monospace', color:'#00ff41', fontSize:12, opacity:0.5 }}>[ click to exit ]</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PUZZLE ── */}
      <AnimatePresence>
        {showPuzzle && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, zIndex:9997, background:'rgba(0,0,0,0.92)', display:'flex', alignItems:'center', justifyContent:'center', padding:'clamp(16px,4vw,20px)', backdropFilter:'blur(4px)' }}>
            <div style={{ maxWidth:480, width:'100%', background:'#0a0e27', border:'1px solid rgba(0,217,255,0.3)', padding:'clamp(20px,5vw,32px)', fontFamily:'DM Mono,monospace', position:'relative' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#00d9ff,transparent)' }} />
              <div style={{ color:cyber, fontSize:11, letterSpacing:'0.2em', marginBottom:20 }}>// ENCRYPTED SEQUENCE DETECTED</div>
              <div style={{ color:'#fff', fontSize:'clamp(15px,4vw,18px)', fontWeight:'bold', marginBottom:8 }}>🔐 ACCESS PUZZLE</div>
              <div style={{ color:'#94a3b8', fontSize:'clamp(12px,3vw,13px)', lineHeight:1.8, marginBottom:24 }}>
                <div style={{ color:'#fbbf24', fontSize:11, marginBottom:12 }}>CHALLENGE {puzzleStep+1}/{PUZZLES.length}</div>
                {PUZZLES[puzzleStep].q.split('\n').map((l, i) => <div key={i}>{l || <br />}</div>)}
              </div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                <input value={puzzleInput} onChange={e => setPuzzleInput(e.target.value)} onKeyDown={e => e.key==='Enter' && checkPuzzle()}
                  style={{ flex:'1 1 160px', background:'#111633', border:'1px solid rgba(0,217,255,0.3)', color:cyber, fontFamily:'DM Mono,monospace', fontSize:'clamp(12px,3vw,14px)', padding:'10px 14px', outline:'none' }}
                  placeholder="your answer..." autoComplete="off" />
                <button onClick={checkPuzzle} style={{ flex:'0 0 auto', background:'rgba(0,217,255,0.13)', border:`1px solid ${cyber}`, color:cyber, fontFamily:'DM Mono,monospace', fontSize:12, padding:'10px 16px', cursor:'pointer' }}>SUBMIT</button>
              </div>
              {puzzleFeedback && <div style={{ marginTop:12, fontSize:12, color: puzzleFeedback.startsWith('✓') ? '#34d399' : '#f87171' }}>{puzzleFeedback}</div>}
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:20, fontSize:11 }}>
                <span onClick={() => { const h = PUZZLES[puzzleStep].hints[puzzleHints % PUZZLES[puzzleStep].hints.length]; setPuzzleFeedback(`💡 ${h}`); setPuzzleHints(n => n+1); }} style={{ color:'#475569', cursor:'pointer', textDecoration:'underline' }}>need a hint?</span>
                <span onClick={() => setShowPuzzle(false)} style={{ color:'#334155', cursor:'pointer', textDecoration:'underline' }}>abandon mission</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── UNLOCK ── */}
      <AnimatePresence>
        {showUnlock && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.9)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
            <div ref={confettiRef} style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }} />
            <div style={{ textAlign:'center', fontFamily:'DM Mono,monospace', position:'relative', zIndex:1 }}>
              <div style={{ fontSize:'clamp(56px,15vw,80px)', marginBottom:24, animation:'unlockPop 0.5s ease-out' }}>🏆</div>
              <div style={{ color:cyber, fontSize:'clamp(18px,5vw,28px)', fontWeight:'bold', letterSpacing:'0.2em', marginBottom:12 }}>ACCESS GRANTED</div>
              <div style={{ color:green, fontSize:'clamp(12px,3vw,14px)', marginBottom:8 }}>// GAME MODULE UNLOCKED</div>
              <div style={{ color:'#475569', fontSize:12, marginBottom:32 }}>The nav bar has been updated. Check it out.</div>
              <button onClick={() => setShowUnlock(false)}
                style={{ border:`1px solid ${cyber}`, color:cyber, padding:'10px 28px', fontSize:12, letterSpacing:'0.15em', cursor:'pointer', background:'transparent', fontFamily:'DM Mono,monospace' }}>
                ENTER COMMAND CENTER
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOAST ── */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ x:120, opacity:0 }} animate={{ x:0, opacity:1 }} exit={{ x:120, opacity:0 }}
            style={{ position:'fixed', bottom:24, right:24, background:'#0a0e27', border:`1px solid ${toast.color}`, color:toast.color, fontFamily:'DM Mono,monospace', fontSize:12, padding:'12px 18px', zIndex:99998, maxWidth:'calc(100vw - 48px)', boxShadow:`0 0 20px ${toast.color}40` }}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ position:'relative', minHeight:'100vh', zIndex:1 }}>

        {/* ══════════ HERO ══════════ */}
        <section style={{ 
          position:'relative', 
          minHeight:'100vh', 
          display:'flex', 
          alignItems:'center', 
          justifyContent:'center', 
          overflow:'hidden', 
          padding:'15px clamp(16px,5vw,48px) clamp(40px,8vh,64px)' 
        }}>
          {/* Glows */}
          <div style={{ position:'absolute', top:'25%', left:'25%', width:'clamp(200px,40vw,384px)', height:'clamp(200px,40vw,384px)', background:'rgba(0,217,255,0.05)', borderRadius:'50%', filter:'blur(60px)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:'25%', right:'25%', width:'clamp(160px,30vw,320px)', height:'clamp(160px,30vw,320px)', background:'rgba(124,58,237,0.08)', borderRadius:'50%', filter:'blur(60px)', pointerEvents:'none' }} />
          {/* Scan line */}
          <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', opacity:0.2 }}>
            <div style={{ position:'absolute', width:'100%', height:1, background:`linear-gradient(90deg,transparent,${cyber},transparent)`, animation:'scanLine 4s linear infinite' }} />
          </div>

          <div style={{ maxWidth:1280, margin:'0 auto', width:'100%' }}>
            <div className="hero-grid">
              {/* Left */}
              <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:8, border:'1px solid rgba(16,185,129,0.3)', background:'rgba(16,185,129,0.05)', padding:'6px 12px', marginBottom:'clamp(16px,4vw,24px)', fontFamily:'DM Mono,monospace', fontSize:'clamp(10px,2.5vw,12px)', color:green }}>
                  <span style={{ width:6, height:6, background:green, borderRadius:'50%', animation:'blink 1s step-end infinite' }} />
                  AVAILABLE FOR HIRE
                </div>

                <h1 className="hero-h1">{s.hero_title}</h1>

                <div className="hero-typed">
                  <span>{typedText}</span>
                  <span className="cursor-blink" />
                </div>

                <p className="hero-sub">{s.hero_subtitle}</p>

                <div className="hero-actions">
                  <a href="/api/cv/download" className="btn-primary">
                    <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download CV
                  </a>
                  <a href="/api/portfolio/download/pptx" className="btn-ghost">
                    <svg width={13} height={13} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Portfolio PPT
                  </a>
                  <a href="/portfolio" className="btn-muted">Lihat Portfolio →</a>
                </div>
              </motion.div>

              {/* Right: Terminal */}
              <motion.div initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.6, delay:0.2 }}
                id="terminal-container" style={{ position:'relative' }}>
                <div className="animate-float-delay" style={{ position:'absolute', top:-24, right:-24, width:96, height:96, border:'1px solid rgba(124,58,237,0.3)', transform:'rotate(12deg)', pointerEvents:'none' }} />
                <div className="animate-float" style={{ position:'absolute', bottom:-16, left:-16, width:64, height:64, border:'1px solid rgba(0,217,255,0.3)', transform:'rotate(-6deg)', pointerEvents:'none' }} />
                <div style={{ background: t?'#f8faff':'#111633', border:`1px solid ${borderMed}`, borderRadius:8, overflow:'hidden', boxShadow:'0 25px 50px rgba(0,0,0,0.5)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 16px', background: t?'#edf1fb':'#0a0e27', borderBottom:`1px solid ${borderSub}` }}>
                    <button onClick={() => { setTermLines([]); addLines(['🥚 Classic. You clicked the close button.', '// (terminal cannot be closed — you are trapped)']); }}
                      style={{ width:12, height:12, borderRadius:'50%', background:'rgba(239,68,68,0.7)', border:'none', cursor:'pointer' }} title="Click me..." />
                    <div style={{ width:12, height:12, borderRadius:'50%', background:'rgba(234,179,8,0.7)' }} />
                    <div style={{ width:12, height:12, borderRadius:'50%', background:'rgba(34,197,94,0.7)' }} />
                    <span style={{ marginLeft:16, fontFamily:'DM Mono,monospace', fontSize:12, color:textMut }}>portfolio.sh</span>
                    <span style={{ marginLeft:'auto', fontFamily:'DM Mono,monospace', fontSize:12, color:'rgba(0,217,255,0.4)' }}>type 'help'</span>
                  </div>
                  <div ref={termBodyRef} id="term-body" style={{ padding:16, fontFamily:'DM Mono,monospace', fontSize:13, minHeight:280, maxHeight:320, overflowY:'auto', lineHeight:1.6 }}>
                    {termLines.map((line, i) => (
                      <div key={i} className="term-line" dangerouslySetInnerHTML={{ __html: line.text }} style={{ marginBottom:2, color: line.type==='dim'?'#475569':textPri }} />
                    ))}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 16px', borderTop:`1px solid ${borderSub}`, background: t?'rgba(237,241,251,0.5)':'rgba(10,14,39,0.5)' }}>
                    <span style={{ color:cyber, fontFamily:'DM Mono,monospace', fontSize:14, flexShrink:0 }}>$</span>
                    <input ref={termInputRef} value={termInput} onChange={e => setTermInput(e.target.value)} onKeyDown={handleTermKey}
                      style={{ flex:1, background:'transparent', fontFamily:'DM Mono,monospace', fontSize:13, color: t?'#0f172a':'#fff', outline:'none', caretColor:cyber, border:'none' }}
                      placeholder="enter command..." autoComplete="off" spellCheck={false} />
                  </div>
                </div>
                <p style={{ textAlign:'center', fontFamily:'DM Mono,monospace', fontSize:12, color:textMut, marginTop:8 }}>// interactive terminal — try something</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══════════ ABOUT ══════════ */}
        {s.about_text && (
          <section id="about" className="section-pad" style={{ background: t?'rgba(228,234,248,0.4)':'rgba(10,14,39,0.4)' }}>
            <div style={{ maxWidth:1280, margin:'0 auto' }}>
              <div style={{ marginBottom:'clamp(28px,6vh,56px)' }}>
                <div className="section-tag" style={{ marginBottom:12 }}>About Me</div>
                <h2 className="section-h2">{s.about_title} <span style={{ color:cyber }}>Saya</span></h2>
              </div>

              <div className="about-grid">
                {/* Left: text + stats + socials */}
                <div style={{ display:'flex', flexDirection:'column', gap:'clamp(20px,4vw,28px)' }}>
                  <div style={{ color:textSec, lineHeight:1.7, fontSize:'clamp(14px,2.5vw,16px)' }}>
                    {s.about_text?.split('\n').filter(Boolean).map((p, i) => <p key={i} style={{ marginBottom:16 }}>{p}</p>)}
                  </div>

                  {/* Contact links */}
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {s.contact_email && (
                      <a href={`mailto:${s.contact_email}`} style={{ display:'inline-flex', alignItems:'center', gap:6, fontFamily:'DM Mono,monospace', fontSize:'clamp(10px,2vw,12px)', color:textSec, border:`1px solid ${t?'#cbd5e1':'#334155'}`, padding:'7px 12px', textDecoration:'none', transition:'color 0.3s' }}
                        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color=cyber}
                        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color=textSec}>
                        ✉ {s.contact_email}
                      </a>
                    )}
                    {s.contact_phone && (
                      <a href={`tel:${s.contact_phone}`} style={{ display:'inline-flex', alignItems:'center', gap:6, fontFamily:'DM Mono,monospace', fontSize:'clamp(10px,2vw,12px)', color:textSec, border:`1px solid ${t?'#cbd5e1':'#334155'}`, padding:'7px 12px', textDecoration:'none' }}>
                        📞 {s.contact_phone}
                      </a>
                    )}
                    {s.contact_location && (
                      <span style={{ display:'inline-flex', alignItems:'center', gap:6, fontFamily:'DM Mono,monospace', fontSize:'clamp(10px,2vw,12px)', color:textMut, border:`1px solid ${t?'#e2e8f0':'rgba(51,65,85,0.5)'}`, padding:'7px 12px' }}>
                        📍 {s.contact_location}
                      </span>
                    )}
                  </div>

                  {/* Socials */}
                  <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:12 }}>
                    <span style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:textMut, textTransform:'uppercase', letterSpacing:'0.2em' }}>Find me on</span>
                    <div style={{ display:'flex', gap:8 }}>
                      {[{ url:s.social_github, label:'GitHub', icon:'⌥' },{ url:s.social_linkedin, label:'LinkedIn', icon:'in' },{ url:s.social_instagram, label:'Instagram', icon:'📷' }]
                        .filter(x => x.url).map(x => (
                        <a key={x.label} href={x.url} target="_blank" rel="noreferrer"
                          style={{ width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${t?'#cbd5e1':'#334155'}`, color:textMut, fontSize:12, fontFamily:'DM Mono,monospace', transition:'all 0.3s', textDecoration:'none' }}
                          onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor=cyber; (e.currentTarget as HTMLElement).style.color=cyber; }}
                          onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor=t?'#cbd5e1':'#334155'; (e.currentTarget as HTMLElement).style.color=textMut; }}
                          title={x.label}>{x.icon}</a>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="stats-grid">
                    {[
                      { value:`${projects.length}+`, label:'Projects',  color:cyber,    bg:'rgba(0,217,255,0.05)',   border:'rgba(0,217,255,0.2)' },
                      { value:'2+',                  label:'Yrs Exp',   color:purple,   bg:'rgba(124,58,237,0.05)', border:'rgba(124,58,237,0.2)' },
                      { value:'3.83',                label:'GPA',       color:green,    bg:'rgba(16,185,129,0.05)', border:'rgba(16,185,129,0.2)' },
                      { value:'4+',                  label:'Certs',     color:'#f59e0b',bg:'rgba(245,158,11,0.05)', border:'rgba(245,158,11,0.2)' },
                    ].map(st => (
                      <div key={st.label} style={{ background:st.bg, border:`1px solid ${st.border}`, padding:'clamp(12px,3vw,16px)', textAlign:'center', transition:'filter 0.3s' }}
                        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.filter='brightness(1.25)'}
                        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.filter='none'}>
                        <div style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(18px,5vw,24px)', fontWeight:700, color:st.color, marginBottom:4 }}>{st.value}</div>
                        <div style={{ fontFamily:'DM Mono,monospace', fontSize:'clamp(9px,2vw,11px)', color:textMut, textTransform:'uppercase', letterSpacing:'0.1em' }}>{st.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: profile.json (hidden on mobile) */}
                <div className="profile-card" style={{ position:'relative' }}>
                  <div className="animate-float-delay" style={{ position:'absolute', top:-20, right:-20, width:64, height:64, border:'1px solid rgba(0,217,255,0.15)', transform:'rotate(12deg)', pointerEvents:'none' }} />
                  <div className="animate-float" style={{ position:'absolute', bottom:-20, left:-20, width:40, height:40, border:'1px solid rgba(124,58,237,0.2)', transform:'rotate(-6deg)', pointerEvents:'none' }} />
                  <div style={{ background: t?'#fff':'#111633', border:`1px solid ${borderMed}`, overflow:'hidden' }}>
                    <div style={{ height:2, background:`linear-gradient(90deg,transparent,${cyber},transparent)` }} />
                    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 16px', background: t?'#edf1fb':'rgba(10,14,39,0.7)', borderBottom:`1px solid ${borderSub}` }}>
                      {['rgba(239,68,68,0.6)','rgba(234,179,8,0.6)','rgba(34,197,94,0.6)'].map((c,i) => <div key={i} style={{ width:10, height:10, borderRadius:'50%', background:c }} />)}
                      <span style={{ marginLeft:12, fontFamily:'DM Mono,monospace', fontSize:12, color:textMut }}>profile.json</span>
                    </div>
                    <div style={{ padding:20, fontFamily:'DM Mono,monospace', fontSize:13 }}>
                      <div style={{ color:textMut, marginBottom:8 }}>{'{'}</div>
                      {[
                        { k:'"name"',      v:`"${s.hero_title}"`,           c:'#fcd34d' },
                        { k:'"education"', v:'"S1 Teknik Informatika"',      c:'#f9a8d4' },
                        { k:'"university"',v:'"UMS"',                        c:textSec },
                        { k:'"gpa"',       v:'3.83',                         c:green },
                        { k:'"location"',  v:`"${s.contact_location||''}"`, c:t?'#334155':'#e2e8f0' },
                        { k:'"available"', v:'true',                         c:green },
                      ].map((line, i, arr) => (
                        <div key={i} style={{ display:'flex', gap:8, padding:'6px 0', borderBottom: i<arr.length-1?`1px solid ${t?'#e2e8f0':'rgba(51,65,85,0.2)'}`:undefined }}>
                          <span style={{ color:'rgba(0,217,255,0.6)', fontSize:11, flexShrink:0 }}>{line.k}:</span>
                          <span style={{ color:line.c, fontSize:11, wordBreak:'break-all' }}>{line.v}{i<arr.length-1?',':''}</span>
                        </div>
                      ))}
                      <div style={{ color:textMut, marginTop:8 }}>{'}'}</div>
                    </div>
                    <div style={{ padding:'12px 20px', background:'rgba(16,185,129,0.05)', borderTop:'1px solid rgba(16,185,129,0.15)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ position:'relative', width:8, height:8, display:'inline-flex' }}>
                          <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:green, animation:'ping 1.5s cubic-bezier(0,0,0.2,1) infinite', opacity:0.6 }} />
                          <span style={{ position:'relative', width:8, height:8, borderRadius:'50%', background:green, display:'inline-flex' }} />
                        </span>
                        <span style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:green }}>Open to opportunities</span>
                      </div>
                      <a href="/api/cv/download" style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:textMut, textDecoration:'none', transition:'color 0.3s' }}
                        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color=cyber}
                        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color=textMut}>↓ CV</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ══════════ PROJECTS ══════════ */}
        <section id="projects" className="section-pad">
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:'clamp(28px,6vh,48px)' }}>
              <div>
                <div className="section-tag" style={{ marginBottom:12 }}>Featured Work</div>
                <h2 className="section-h2">Selected <span style={{ color:cyber }}>Projects</span></h2>
              </div>
              <a href="/portfolio" style={{ fontFamily:'DM Mono,monospace', fontSize:12, color:textMut, textDecoration:'none', transition:'color 0.3s', whiteSpace:'nowrap' }}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color=cyber}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color=textMut}>All Projects →</a>
            </div>

            <div className="projects-grid">
              <AnimatePresence>
                {visibleProjects.length === 0 && isDataLoaded && (
                  <div style={{ gridColumn:'1 / -1', textAlign:'center', color:textMut, fontFamily:'DM Mono,monospace', padding:40 }}>No featured projects found.</div>
                )}
                {visibleProjects.map((project, i) => (
                  <motion.article key={project._id} layout
                    initial={{ opacity:0, y:24, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0 }}
                    transition={{ duration:0.4, delay:(i % 3) * 0.08 }}
                    className="card" style={{ overflow:'hidden', display:'flex', flexDirection:'column' }}>
                    <div style={{ position:'relative', height:'clamp(160px,25vw,200px)', overflow:'hidden' }}>
                      <Image src={project.imagePath} alt={project.title} fill style={{ objectFit:'cover' }} />
                      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(10,14,39,0.8),transparent)' }} />
                      {project.isFeatured && (
                        <div style={{ position:'absolute', top:12, right:12, background:'rgba(0,217,255,0.15)', border:'1px solid rgba(0,217,255,0.3)', color:cyber, fontFamily:'DM Mono,monospace', fontSize:10, padding:'4px 10px', letterSpacing:'0.1em' }}>FEATURED</div>
                      )}
                    </div>
                    <div style={{ padding:'clamp(14px,3vw,20px)', flex:1, display:'flex', flexDirection:'column', gap:10 }}>
                      <div>
                        <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, color: t?'#0f172a':'#fff', fontSize:'clamp(15px,3vw,18px)', marginBottom:6 }}>{project.title}</h3>
                        {project.shortDescription && <p style={{ color:textSec, fontSize:'clamp(12px,2.5vw,13px)', lineHeight:1.6 }}>{project.shortDescription}</p>}
                      </div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                        {project.techStack?.slice(0,4).map(tech => (
                          <span key={tech} style={{ padding:'3px 10px', background:'rgba(0,217,255,0.08)', border:'1px solid rgba(0,217,255,0.15)', color:cyber, fontFamily:'DM Mono,monospace', fontSize:'clamp(9px,2vw,11px)' }}>{tech}</span>
                        ))}
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:'auto', paddingTop:8, flexWrap:'wrap' }}>
                        {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer" style={{ color:textMut, fontSize:11, fontFamily:'DM Mono,monospace', textDecoration:'none', transition:'color 0.3s' }}
                          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color=cyber}
                          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color=textMut}>⌥ GitHub</a>}
                        {project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noreferrer" style={{ color:textMut, fontSize:11, fontFamily:'DM Mono,monospace', textDecoration:'none', transition:'color 0.3s' }}
                          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color=cyber}
                          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color=textMut}>↗ Demo</a>}
                        <a href={`/portfolio/${project.slug}`} style={{ marginLeft:'auto', color:cyber, fontSize:11, fontFamily:'DM Mono,monospace', textDecoration:'none' }}>Details →</a>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>

            {/* Load more controls */}
            <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'center', marginTop:'clamp(28px,6vh,48px)', gap:12 }}>
              {visibleCount < projects.length && (
                <button onClick={() => setVisibleCount(v => Math.min(v + perRow, projects.length))}
                  style={{ padding:'10px 28px', border:'1px solid rgba(0,217,255,0.4)', background:'rgba(17,22,51,0.5)', color:textSec, fontFamily:'DM Mono,monospace', fontSize:'clamp(12px,2.5vw,14px)', cursor:'pointer', transition:'all 0.3s' }}
                  onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor=cyber; (e.currentTarget as HTMLElement).style.color=cyber; }}
                  onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor='rgba(0,217,255,0.4)'; (e.currentTarget as HTMLElement).style.color=textSec; }}>
                  ↓ Load More
                </button>
              )}
              {visibleCount > 3 && (
                <button onClick={() => setVisibleCount(3)}
                  style={{ padding:'10px 28px', border:`1px solid ${t?'#cbd5e1':'#334155'}`, background:t?'rgba(228,234,248,0.3)':'rgba(17,22,51,0.3)', color:textMut, fontFamily:'DM Mono,monospace', fontSize:'clamp(12px,2.5vw,14px)', cursor:'pointer' }}>
                  ↑ Show Less
                </button>
              )}
              <a href="/portfolio" style={{ padding:'10px 20px', border:`1px solid ${t?'#e2e8f0':'rgba(51,65,85,0.5)'}`, color:textMut, fontFamily:'DM Mono,monospace', fontSize:12, textDecoration:'none', transition:'color 0.3s' }}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color=cyber}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color=textMut}>View All ↗</a>
            </div>
          </div>
        </section>

        {/* ══════════ SKILLS ══════════ */}
        <section id="skills" className="section-pad" style={{ background: t?'rgba(221,229,245,0.5)':'rgba(10,14,39,0.5)' }}>
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            <div className="section-tag" style={{ marginBottom:12 }}>Capabilities</div>
            <h2 className="section-h2" style={{ marginBottom:'clamp(28px,6vh,48px)' }}>Technical <span style={{ color:cyber }}>Arsenal</span></h2>
            <div className="skills-grid">
              {skills.slice(0,12).map((skill, i) => (
                <motion.div key={skill._id} initial={{ opacity:0, scale:0.9 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }} transition={{ delay:(i%6)*0.06 }}
                  style={{ background: t?'rgba(228,234,248,0.7)':'rgba(30,39,73,0.5)', border:`1px solid ${borderSub}`, padding:'clamp(12px,3vw,16px)', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', cursor:'default', transition:'all 0.3s' }}
                  onMouseEnter={e=>{ const el=e.currentTarget; el.style.borderColor=t?'rgba(0,140,180,0.5)':'rgba(0,217,255,0.5)'; el.style.background=t?'rgba(228,234,248,1)':'rgba(30,39,73,1)'; }}
                  onMouseLeave={e=>{ const el=e.currentTarget; el.style.borderColor=borderSub; el.style.background=t?'rgba(228,234,248,0.7)':'rgba(30,39,73,0.5)'; }}>
                  <div style={{ fontSize:'clamp(20px,4vw,28px)', marginBottom:8 }}>
                    {skill.icon==='laravel'?'🔴':skill.icon==='python'?'🐍':skill.icon==='javascript'?'🟡':skill.icon==='mysql'?'🗄️':skill.icon==='git'?'🌿':skill.icon==='linux'?'🐧':skill.icon==='php'?'🐘':skill.icon==='react'?'⚛️':skill.icon==='puzzle'?'🧩':skill.icon==='users'?'🤝':skill.icon==='clock'?'⏰':'🧠'}
                  </div>
                  <div style={{ fontFamily:'DM Mono,monospace', fontSize:'clamp(10px,2vw,12px)', color: t?'#334155':'#cbd5e1', lineHeight:1.2 }}>{skill.name}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ EXPERIENCE ══════════ */}
        <section id="experience" className="section-pad">
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            <div className="section-tag" style={{ marginBottom:12 }}>Career</div>
            <h2 className="section-h2" style={{ marginBottom:'clamp(28px,6vh,48px)' }}>Work <span style={{ color:cyber }}>Experience</span></h2>

            <div className="timeline-wrap">
              <div className="timeline-line" />
              <div style={{ display:'flex', flexDirection:'column', gap:'clamp(20px,5vw,40px)' }}>
                {experiences.map((exp, i) => {
                  const isCurrent = !exp.endDate;
                  return (
                    <motion.div key={exp._id} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.1 }}
                      style={{ position:'relative' }}>
                      {/* Timeline dot */}
                      <div className="timeline-dot-wrap">
                        {isCurrent ? (
                          <span style={{ position:'relative', display:'inline-flex', width:12, height:12 }}>
                            <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:green, animation:'ping 1.5s cubic-bezier(0,0,0.2,1) infinite', opacity:0.6 }} />
                            <span style={{ position:'relative', width:12, height:12, borderRadius:'50%', background:green, boxShadow:`0 0 10px ${green}`, display:'inline-flex' }} />
                          </span>
                        ) : (
                          <div style={{ width:10, height:10, background:cyber, borderRadius:'50%', boxShadow:`0 0 10px ${cyber}` }} />
                        )}
                      </div>

                      <div className="card" style={{ padding:'clamp(16px,4vw,24px)', position:'relative', overflow:'hidden', ...(isCurrent?{ borderColor:'rgba(16,185,129,0.4)', background:`linear-gradient(135deg,rgba(16,185,129,0.05),${bgCard},${bgCard})` }:{}) }}>
                        {isCurrent && <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#10b981,transparent)' }} />}
                        <div style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:12 }}>
                          <div>
                            <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:8, marginBottom:4 }}>
                              <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, color: t?'#0f172a':'#fff', fontSize:'clamp(15px,3vw,18px)' }}>{exp.title}</h3>
                              {isCurrent && (
                                <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontFamily:'DM Mono,monospace', fontSize:11, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', color:green, padding:'2px 8px' }}>
                                  <span style={{ width:4, height:4, background:green, borderRadius:'50%', animation:'blink 1s step-end infinite' }} />Now
                                </span>
                              )}
                            </div>
                            <p style={{ color: isCurrent?green:cyber, fontFamily:'DM Mono,monospace', fontSize:'clamp(11px,2.5vw,13px)' }}>{exp.company}</p>
                          </div>
                          <div style={{ textAlign:'right' }}>
                            <div style={{ fontFamily:'DM Mono,monospace', fontSize:'clamp(10px,2vw,12px)', color:textMut }}>
                              {new Date(exp.startDate).toLocaleDateString('en',{ month:'short', year:'numeric' })} —{' '}
                              {isCurrent ? <span style={{ color:green }}>Present</span> : new Date(exp.endDate as string).toLocaleDateString('en',{ month:'short', year:'numeric' })}
                            </div>
                            {exp.location && <div style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:textMut, marginTop:4 }}>{exp.location}</div>}
                          </div>
                        </div>
                        <p style={{ color:textSec, fontSize:'clamp(13px,2.5vw,14px)', lineHeight:1.7 }}>{exp.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ CTA ══════════ */}
        <section className="section-pad" style={{ position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,rgba(0,217,255,0.05),transparent,rgba(124,58,237,0.05))', pointerEvents:'none' }} />
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="cta-wrap">
            <div className="section-tag" style={{ marginBottom:16, justifyContent:'center' }}>Let's Connect</div>
            <h2 className="section-h2" style={{ marginBottom:16 }}>Got a project in mind?</h2>
            <p style={{ color:textSec, marginBottom:32, lineHeight:1.7, fontSize:'clamp(14px,3vw,16px)' }}>Mari diskusi dan wujudkan ide kamu menjadi solusi nyata.</p>
            <a href="/contact" className="btn-primary" style={{ fontSize:'clamp(13px,2.5vw,15px)', padding:'12px 32px' }}>Start a Conversation</a>
          </motion.div>
        </section>

      </div>
    </>
  );
}