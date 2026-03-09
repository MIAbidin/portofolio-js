// app/game/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';

interface LeaderboardEntry { score: number; level: number; date: string; }

export default function GamePage() {
  const { isLight } = useTheme();
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const [started, setStarted] = useState(false);

  // Sidebar reactive state
  const [sideScore,  setSideScore]  = useState('000000');
  const [sideHigh,   setSideHigh]   = useState('000000');
  const [sideLevel,  setSideLevel]  = useState(1);
  const [sideLives,  setSideLives]  = useState('♥ ♥ ♥');
  const [integrity,  setIntegrity]  = useState(1);
  const [lb, setLb] = useState<LeaderboardEntry[]>([]);

  const gameRef = useRef<{
    start:   () => void;
    restart: () => void;
    pause:   () => void;
  } | null>(null);

  useEffect(() => {
    setLb(JSON.parse(localStorage.getItem('cmd_lb') || '[]'));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const BASE_W = 480, BASE_H = 360;
    let scale = 1;

    function resize() {
      const c = canvas!.parentElement!;
      scale = Math.min(c.clientWidth / BASE_W, c.clientHeight / BASE_H);
      canvas!.width  = BASE_W;
      canvas!.height = BASE_H;
      canvas!.style.width  = BASE_W * scale + 'px';
      canvas!.style.height = BASE_H * scale + 'px';
    }
    resize();
    window.addEventListener('resize', resize);

    const ctx = canvas.getContext('2d')!;

    const STATE = { MENU:0, PLAYING:1, PAUSED:2, GAMEOVER:3, WIN:4 };
    let state = STATE.MENU;

    let score = 0, highScore = parseInt(localStorage.getItem('cmd_hi') || '0');
    let lives = 3, level = 1;
    let frame = 0;

    const C = {
      bg:'#050811', grid:'rgba(0,217,255,0.03)',
      cyan:'#00d9ff', purple:'#7c3aed', green:'#10b981',
      red:'#ef4444', yellow:'#f59e0b',
      white:'#e2e8f0', dimWhite:'#475569',
    };

    // ── Player ──
    const player = {
      x: BASE_W/2, y: BASE_H-28, w:28, h:14,
      speed: 3.2, bullets: [] as any[],
      cooldown:0, invincible:0,
      draw() {
        if (this.invincible > 0 && Math.floor(this.invincible/4)%2) return;
        const x=this.x, y=this.y;
        ctx.save();
        ctx.fillStyle = C.cyan;
        ctx.fillRect(x-10,y+4,20,8); ctx.fillRect(x-4,y,8,8);
        ctx.fillRect(x-14,y+8,6,4); ctx.fillRect(x+8,y+8,6,4);
        ctx.fillRect(x-2,y-4,4,6);
        ctx.shadowColor=C.cyan; ctx.shadowBlur=8;
        ctx.fillStyle='rgba(0,217,255,0.3)';
        ctx.fillRect(x-10,y+4,20,8);
        ctx.restore();
      }
    };

    function createBullet(x:number,y:number,vy:number) {
      return { x, y, vy, w:2, h:10 };
    }

    let enemyBullets: any[] = [];

    // ── Enemies ──
    const ENEMY_ROWS=4, ENEMY_COLS=10;
    let enemies:any[]=[], enemyDir=1, enemySpeed=0.4;
    let enemyShootTimer=0, enemyShootInterval=90;

    function initEnemies() {
      enemies=[];
      const types=[
        {tier:2,color:C.red,pts:30},
        {tier:2,color:C.red,pts:30},
        {tier:1,color:C.yellow,pts:20},
        {tier:0,color:C.green,pts:10},
      ];
      for (let r=0;r<ENEMY_ROWS;r++) {
        for (let c=0;c<ENEMY_COLS;c++) {
          const t=types[r];
          enemies.push({x:40+c*38,y:50+r*28,w:22,h:16,tier:t.tier,color:t.color,pts:t.pts,alive:true,anim:Math.random()*100|0});
        }
      }
      enemyDir=1;
      enemySpeed=0.4+(level-1)*0.08;
      enemyShootInterval=Math.max(40,90-(level-1)*8);
    }

    function drawEnemy(e:any) {
      if (!e.alive) return;
      const a=(frame+e.anim)%30<15;
      ctx.save();
      ctx.fillStyle=e.color; ctx.shadowColor=e.color; ctx.shadowBlur=6;
      if (e.tier===2) {
        ctx.fillRect(e.x-8,e.y-3,16,10); ctx.fillRect(e.x-5,e.y-7,10,5);
        if(a){ctx.fillRect(e.x-10,e.y+3,4,4);ctx.fillRect(e.x+6,e.y+3,4,4);}
        else {ctx.fillRect(e.x-11,e.y+5,4,3);ctx.fillRect(e.x+7,e.y+5,4,3);}
        ctx.fillRect(e.x-2,e.y-9,4,4);
      } else if (e.tier===1) {
        ctx.fillRect(e.x-9,e.y-2,18,9);
        if(a){ctx.fillRect(e.x-12,e.y-5,4,8);ctx.fillRect(e.x+8,e.y-5,4,8);}
        else {ctx.fillRect(e.x-12,e.y-2,4,8);ctx.fillRect(e.x+8,e.y-2,4,8);}
        ctx.fillRect(e.x-5,e.y-6,10,5); ctx.fillRect(e.x-3,e.y+6,6,4);
      } else {
        ctx.fillRect(e.x-7,e.y-4,14,10);
        ctx.fillRect(e.x-9,e.y-1,3,5); ctx.fillRect(e.x+6,e.y-1,3,5);
        if(a){ctx.fillRect(e.x-6,e.y+5,3,5);ctx.fillRect(e.x,e.y+5,3,5);ctx.fillRect(e.x+3,e.y+5,3,5);}
        else {ctx.fillRect(e.x-7,e.y+6,3,4);ctx.fillRect(e.x-1,e.y+6,3,4);ctx.fillRect(e.x+5,e.y+6,3,4);}
        ctx.fillRect(e.x-4,e.y-7,3,4); ctx.fillRect(e.x+1,e.y-7,3,4);
      }
      ctx.fillStyle='#000'; ctx.shadowBlur=0;
      ctx.fillRect(e.x-4,e.y-1,2,2); ctx.fillRect(e.x+2,e.y-1,2,2);
      ctx.restore();
    }

    // ── UFO ──
    let ufo:any=null, ufoTimer=0;
    const UFO_INTERVAL=600;
    function spawnUFO(){ufo={x:-30,y:22,speed:1.2,alive:true,pts:50+(Math.random()*200|0)};}
    function drawUFO() {
      if(!ufo) return;
      ctx.save();
      ctx.fillStyle=C.cyan; ctx.shadowColor=C.cyan; ctx.shadowBlur=12;
      ctx.beginPath(); ctx.ellipse(ufo.x,ufo.y,18,7,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(ufo.x,ufo.y-5,9,6,0,0,Math.PI*2); ctx.fill();
      ctx.shadowBlur=0;
      [-8,0,8].forEach(dx=>{
        ctx.fillStyle=frame%20<10?C.yellow:'#000';
        ctx.beginPath(); ctx.arc(ufo.x+dx,ufo.y+2,2,0,Math.PI*2); ctx.fill();
      });
      ctx.restore();
    }

    // ── Barriers ──
    let barriers:any[][]=[];
    const BLOCK_SIZE=4, BARRIER_W=10, BARRIER_H=7;
    function initBarriers() {
      barriers=[];
      const spacing=BASE_W/5;
      for(let b=0;b<4;b++){
        const bx=spacing*(b+1)-(BARRIER_W*BLOCK_SIZE)/2;
        const by=BASE_H-65;
        const blocks:any[]=[];
        for(let r=0;r<BARRIER_H;r++) for(let c=0;c<BARRIER_W;c++){
          if(r===0&&(c<2||c>=BARRIER_W-2)) continue;
          if(r<=1&&(c<1||c>=BARRIER_W-1)) continue;
          if(r>=BARRIER_H-2&&(c>=3&&c<7)) continue;
          blocks.push({bx,by,c,r,hp:3});
        }
        barriers.push(blocks);
      }
    }
    function drawBarriers(){
      barriers.forEach(bb=>bb.forEach(bl=>{
        const x=bl.bx+bl.c*BLOCK_SIZE,y=bl.by+bl.r*BLOCK_SIZE;
        ctx.fillStyle=`rgba(16,185,129,${bl.hp/3*0.8+0.1})`;
        ctx.fillRect(x,y,BLOCK_SIZE-1,BLOCK_SIZE-1);
      }));
    }

    // ── Particles ──
    let particles:any[]=[];
    function explode(x:number,y:number,color:string,count=8){
      for(let i=0;i<count;i++){
        const angle=(Math.PI*2*i)/count+Math.random()*0.5;
        const spd=1+Math.random()*2.5;
        particles.push({x,y,vx:Math.cos(angle)*spd,vy:Math.sin(angle)*spd,life:30+Math.random()*20|0,maxLife:50,color,size:2+Math.random()*2});
      }
    }
    function updateParticles(){particles=particles.filter(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=0.05;p.life--;return p.life>0;});}
    function drawParticles(){particles.forEach(p=>{ctx.save();ctx.globalAlpha=p.life/p.maxLife;ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=4;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);ctx.restore();});}

    let floaters:any[]=[];
    function floatScore(x:number,y:number,txt:string,color:string){floaters.push({x,y,txt,color,life:60});}
    function updateFloaters(){floaters=floaters.filter(f=>{f.y-=0.5;f.life--;return f.life>0;});}
    function drawFloaters(){floaters.forEach(f=>{ctx.save();ctx.globalAlpha=f.life/60;ctx.fillStyle=f.color;ctx.font='bold 9px "DM Mono"';ctx.textAlign='center';ctx.fillText(f.txt,f.x,f.y);ctx.restore();});}

    const stars=Array.from({length:60},()=>({x:Math.random()*BASE_W,y:Math.random()*BASE_H,s:Math.random()*1.5+0.3,b:Math.random()}));
    function drawStars(){stars.forEach(s=>{ctx.fillStyle=`rgba(148,163,184,${0.3+Math.sin(frame*0.02+s.b*10)*0.2})`;ctx.fillRect(s.x,s.y,s.s,s.s);});}
    function drawGrid(){ctx.fillStyle=C.bg;ctx.fillRect(0,0,BASE_W,BASE_H);ctx.strokeStyle=C.grid;ctx.lineWidth=0.5;for(let x=0;x<BASE_W;x+=20){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,BASE_H);ctx.stroke();}for(let y=0;y<BASE_H;y+=20){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(BASE_W,y);ctx.stroke();}}

    function drawHUD(){
      ctx.fillStyle=C.dimWhite;ctx.font='7px "DM Mono"';ctx.textAlign='left';ctx.fillText('SCORE',8,14);
      ctx.fillStyle=C.white;ctx.font='bold 10px "DM Mono"';ctx.fillText(score.toString().padStart(6,'0'),8,24);
      ctx.fillStyle=C.dimWhite;ctx.font='7px "DM Mono"';ctx.textAlign='center';ctx.fillText('LEVEL',BASE_W/2,14);
      ctx.fillStyle=C.purple;ctx.font='bold 10px "DM Mono"';ctx.fillText(String(level),BASE_W/2,24);
      ctx.fillStyle=C.dimWhite;ctx.font='7px "DM Mono"';ctx.textAlign='right';ctx.fillText('HI-SCORE',BASE_W-8,14);
      ctx.fillStyle=C.cyan;ctx.font='bold 10px "DM Mono"';ctx.fillText(Math.max(score,highScore).toString().padStart(6,'0'),BASE_W-8,24);
      ctx.textAlign='left';ctx.fillStyle=C.red;ctx.font='bold 9px "DM Mono"';
      for(let i=0;i<lives;i++) ctx.fillText('♥',8+i*14,BASE_H-6);
      ctx.strokeStyle='rgba(0,217,255,0.15)';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(0,30);ctx.lineTo(BASE_W,30);ctx.stroke();
      ctx.beginPath();ctx.moveTo(0,BASE_H-16);ctx.lineTo(BASE_W,BASE_H-16);ctx.stroke();
    }

    function drawOverlay(title:string, lines:{text:string;color?:string;bold?:boolean;size?:number}[], blink=false){
      ctx.fillStyle='rgba(5,8,17,0.85)';ctx.fillRect(0,0,BASE_W,BASE_H);
      ctx.save();ctx.textAlign='center';
      ctx.fillStyle=C.cyan;ctx.shadowColor=C.cyan;ctx.shadowBlur=16;
      ctx.font='bold 18px "DM Mono"';ctx.fillText(title,BASE_W/2,BASE_H/2-40);ctx.shadowBlur=0;
      lines.forEach((l,i)=>{
        ctx.fillStyle=l.color||C.white;
        ctx.font=(l.bold?'bold ':'')+((l.size||9))+'px "DM Mono"';
        ctx.fillText(l.text,BASE_W/2,BASE_H/2-10+i*(l.size?l.size+8:16));
      });
      if(blink&&frame%40<25){ctx.fillStyle=C.cyan;ctx.font='8px "DM Mono"';ctx.fillText('[ PRESS SPACE OR CLICK TO START ]',BASE_W/2,BASE_H/2+70);}
      ctx.restore();
    }

    // ── Input ──
    const keys: Record<string,boolean>={};
    let touchLeft=false,touchRight=false;

    function handleKeyDown(e:KeyboardEvent){
      keys[e.code]=true;
      if(e.code==='Space'){e.preventDefault();if(state===STATE.MENU||state===STATE.GAMEOVER||state===STATE.WIN)startGame();else handleFire();}
      if(e.code==='KeyP') togglePause();
      if(e.code==='KeyR') restartGame();
    }
    function handleKeyUp(e:KeyboardEvent){keys[e.code]=false;}
    document.addEventListener('keydown',handleKeyDown);
    document.addEventListener('keyup',handleKeyUp);

    function rectHit(ax:number,ay:number,aw:number,ah:number,bx:number,by:number,bw:number,bh:number){return ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;}

    function handleFire(){
      if(state!==STATE.PLAYING) return;
      if(player.cooldown<=0){player.bullets.push(createBullet(player.x,player.y-10,-7));player.cooldown=14;}
    }
    function togglePause(){if(state===STATE.PLAYING)state=STATE.PAUSED;else if(state===STATE.PAUSED)state=STATE.PLAYING;}

    function updateSidebar(){
      setSideScore(score.toString().padStart(6,'0'));
      setSideHigh(Math.max(score,highScore).toString().padStart(6,'0'));
      setSideLevel(level);
      setSideLives(lives>0?Array(lives).fill('♥').join(' '):'☠');
      const alive=enemies.filter(e=>e.alive).length;
      setIntegrity(alive/Math.max(enemies.length,1));
    }

    function saveLb(){
      if(score===0) return;
      let data:LeaderboardEntry[]=JSON.parse(localStorage.getItem('cmd_lb')||'[]');
      data.push({score,level,date:new Date().toLocaleDateString('id')});
      data.sort((a,b)=>b.score-a.score);
      data=data.slice(0,5);
      localStorage.setItem('cmd_lb',JSON.stringify(data));
      setLb(data);
    }

    function startGame(){
      score=0;lives=3;level=1;
      player.x=BASE_W/2;player.bullets=[];enemyBullets=[];
      particles=[];floaters=[];ufo=null;ufoTimer=0;
      initEnemies();initBarriers();state=STATE.PLAYING;
      setStarted(true);updateSidebar();
    }

    function restartGame(){
      if(score>highScore){highScore=score;localStorage.setItem('cmd_hi',String(highScore));}
      saveLb();startGame();
    }

    function nextLevel(){
      level++;player.bullets=[];enemyBullets=[];ufo=null;ufoTimer=0;particles=[];floaters=[];
      initEnemies();initBarriers();state=STATE.PLAYING;updateSidebar();
    }

    gameRef.current={start:startGame,restart:restartGame,pause:togglePause};

    canvas.addEventListener('click',()=>{if(state===STATE.MENU||state===STATE.GAMEOVER||state===STATE.WIN)startGame();});

    // Mobile touch
    const btnLeft  = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const btnFire  = document.getElementById('btn-fire');
    function addHold(el:HTMLElement|null,setFn:(v:boolean)=>void){
      if(!el) return;
      el.addEventListener('touchstart',e=>{e.preventDefault();setFn(true);},{passive:false});
      el.addEventListener('touchend',  e=>{e.preventDefault();setFn(false);},{passive:false});
      el.addEventListener('mousedown', ()=>setFn(true));
      el.addEventListener('mouseup',   ()=>setFn(false));
    }
    addHold(btnLeft, v=>touchLeft=v);
    addHold(btnRight,v=>touchRight=v);
    btnFire?.addEventListener('touchstart',e=>{e.preventDefault();handleFire();},{passive:false});
    btnFire?.addEventListener('click',handleFire);

    // ── Update ──
    function update(){
      if(state!==STATE.PLAYING) return;
      frame++;
      if((keys['ArrowLeft']||keys['KeyA']||touchLeft)&&player.x>14) player.x-=player.speed;
      if((keys['ArrowRight']||keys['KeyD']||touchRight)&&player.x<BASE_W-14) player.x+=player.speed;
      if(player.cooldown>0) player.cooldown--;
      if(player.invincible>0) player.invincible--;
      player.bullets=player.bullets.filter(b=>{b.y+=b.vy;return b.y>0;});
      const alive=enemies.filter(e=>e.alive);
      let edge=false;
      alive.forEach(e=>{e.x+=enemyDir*enemySpeed;});
      alive.forEach(e=>{if(e.x>BASE_W-18||e.x<18)edge=true;});
      if(edge){enemyDir*=-1;alive.forEach(e=>{e.y+=10;});}
      enemyShootTimer++;
      if(enemyShootTimer>=enemyShootInterval&&alive.length>0){
        enemyShootTimer=0;
        const cols:Record<number,any>={};
        alive.forEach(e=>{if(!cols[e.x]||e.y>cols[e.x].y)cols[e.x]=e;});
        const shooters=Object.values(cols);
        const s=shooters[Math.random()*shooters.length|0];
        if(s)enemyBullets.push({x:s.x,y:s.y+10,vy:2.5+level*0.2,w:2,h:8});
      }
      ufoTimer++;
      if(!ufo&&ufoTimer>=UFO_INTERVAL){ufoTimer=0;spawnUFO();}
      if(ufo){ufo.x+=ufo.speed;if(ufo.x>BASE_W+30)ufo=null;}
      enemyBullets=enemyBullets.filter(b=>{b.y+=b.vy;return b.y<BASE_H;});
      alive.forEach(e=>{if(e.y>BASE_H-20){state=STATE.GAMEOVER;saveLb();}});
      // bullets vs enemies
      player.bullets=player.bullets.filter(pb=>{
        let hit=false;
        enemies.forEach(e=>{
          if(!e.alive) return;
          if(rectHit(pb.x-1,pb.y,pb.w,pb.h,e.x-e.w/2,e.y-e.h/2,e.w,e.h)){
            e.alive=false;score+=e.pts;explode(e.x,e.y,e.color,10);floatScore(e.x,e.y-10,'+'+e.pts,e.color);hit=true;
          }
        });
        if(ufo&&rectHit(pb.x-1,pb.y,pb.w,pb.h,ufo.x-18,ufo.y-7,36,14)){
          score+=ufo.pts;explode(ufo.x,ufo.y,C.cyan,16);floatScore(ufo.x,ufo.y-10,'+'+ufo.pts+'!',C.cyan);ufo=null;hit=true;
        }
        barriers.forEach(bb=>bb.forEach((bl,i)=>{
          const bx=bl.bx+bl.c*BLOCK_SIZE,by=bl.by+bl.r*BLOCK_SIZE;
          if(rectHit(pb.x-1,pb.y,pb.w,pb.h,bx,by,BLOCK_SIZE,BLOCK_SIZE)){bl.hp--;if(bl.hp<=0)bb.splice(i,1);hit=true;}
        }));
        return !hit;
      });
      // enemy bullets vs player
      if(player.invincible<=0){
        enemyBullets=enemyBullets.filter(eb=>{
          if(rectHit(eb.x-1,eb.y,eb.w,eb.h,player.x-12,player.y,24,14)){
            lives--;player.invincible=120;explode(player.x,player.y,C.cyan,12);
            if(lives<=0){state=STATE.GAMEOVER;saveLb();}
            updateSidebar();return false;
          }
          let hit=false;
          barriers.forEach(bb=>bb.forEach((bl,i)=>{
            const bx=bl.bx+bl.c*BLOCK_SIZE,by=bl.by+bl.r*BLOCK_SIZE;
            if(rectHit(eb.x-1,eb.y,eb.w,eb.h,bx,by,BLOCK_SIZE,BLOCK_SIZE)){bl.hp--;if(bl.hp<=0)bb.splice(i,1);hit=true;}
          }));
          return !hit;
        });
      }
      if(alive.length===0){explode(BASE_W/2,BASE_H/2,C.cyan,30);setTimeout(nextLevel,1200);state=STATE.WIN;}
      updateParticles();updateFloaters();
      if(frame%10===0){updateSidebar();if(score>highScore)highScore=score;}
    }

    function draw(){
      drawGrid();drawStars();
      if(state===STATE.MENU){
        drawOverlay('CMD_INVADERS',[
          {text:'Defend the system from malware!',size:8},
          {text:''},
          {text:'✦ Ransomware  = 30 pts',color:C.red,size:8},
          {text:'◈ Trojan      = 20 pts',color:C.yellow,size:8},
          {text:'◆ Malware     = 10 pts',color:C.green,size:8},
          {text:'◎ UFO Hacker  = ??? pts',color:C.cyan,size:8},
        ],true);
        return;
      }
      drawBarriers();enemies.forEach(drawEnemy);drawUFO();
      enemyBullets.forEach(b=>{ctx.fillStyle=C.red;ctx.shadowColor=C.red;ctx.shadowBlur=6;ctx.fillRect(b.x-b.w/2,b.y,b.w,b.h);});
      ctx.shadowBlur=0;
      player.bullets.forEach(b=>{ctx.fillStyle=C.cyan;ctx.shadowColor=C.cyan;ctx.shadowBlur=8;ctx.fillRect(b.x-b.w/2,b.y,b.w,b.h);});
      ctx.shadowBlur=0;
      player.draw();drawParticles();drawFloaters();drawHUD();
      if(state===STATE.PAUSED) drawOverlay('PAUSED',[{text:'Press P to resume',size:9}]);
      if(state===STATE.GAMEOVER) drawOverlay('GAME OVER',[
        {text:'SCORE: '+score.toString().padStart(6,'0'),size:12,bold:true,color:C.cyan},
        {text:'Level reached: '+level,size:9,color:C.dimWhite},
        {text:''},
        {text:'Press SPACE or CLICK to play again',size:8,color:C.dimWhite},
      ]);
      if(state===STATE.WIN) drawOverlay('LEVEL '+level+' CLEAR!',[{text:'Preparing next wave...',size:9,color:C.green}]);
    }

    let rafId: number;
    function tick(){update();draw();rafId=requestAnimationFrame(tick);}
    tick();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize',resize);
      document.removeEventListener('keydown',handleKeyDown);
      document.removeEventListener('keyup',handleKeyUp);
    };
  }, []);

  const t = isLight;
  const cyber = t ? '#0077aa' : '#00d9ff';
  const textSec = t ? '#334155' : '#94a3b8';
  const textMut = t ? '#64748b' : '#475569';
  const bgCard  = t ? '#ffffff' : '#151b3b';
  const borderSub = t ? 'rgba(0,140,180,0.12)' : 'rgba(0,217,255,0.1)';
  const green = '#10b981';
  const purple = '#7c3aed';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .game-scanline{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px);pointer-events:none;z-index:2;border-radius:8px;}
        .game-crt{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 60%,rgba(0,0,0,0.4) 100%);pointer-events:none;z-index:3;border-radius:8px;}
        .pixel-border{box-shadow:0 0 0 1px rgba(0,217,255,0.3),0 0 20px rgba(0,217,255,0.1),inset 0 0 20px rgba(0,0,0,0.5);}
        .glitch-text{position:relative;}
        .glitch-text::before,.glitch-text::after{content:attr(data-text);position:absolute;top:0;left:0;width:100%;overflow:hidden;}
        .glitch-text::before{color:#ff00ff;animation:glitch1 3s infinite;clip-path:polygon(0 20%,100% 20%,100% 40%,0 40%);}
        .glitch-text::after{color:#00ffff;animation:glitch2 3s infinite;clip-path:polygon(0 60%,100% 60%,100% 80%,0 80%);}
        @keyframes glitch1{0%,90%,100%{transform:translateX(0)}92%{transform:translateX(-3px)}94%{transform:translateX(3px)}96%{transform:translateX(-2px)}}
        @keyframes glitch2{0%,90%,100%{transform:translateX(0)}93%{transform:translateX(3px)}95%{transform:translateX(-3px)}97%{transform:translateX(2px)}}
        .lb-entry:hover{background:rgba(0,217,255,0.05);}
        .key-badge{display:inline-flex;align-items:center;justify-content:center;min-width:28px;height:24px;padding:0 6px;background:${bgCard};border:1px solid ${borderSub};border-bottom:3px solid rgba(0,217,255,0.3);border-radius:4px;font-family:'DM Mono',monospace;font-size:0.65rem;color:${textSec};}
        #btn-left,#btn-right,#btn-fire{-webkit-tap-highlight-color:transparent;user-select:none;}
      `}</style>

      <div style={{ minHeight:'100vh', paddingTop:96, paddingBottom:64, fontFamily:'DM Mono,monospace' }}>
        <div style={{ maxWidth:1152, margin:'0 auto', padding:'0 clamp(16px,4vw,32px)' }}>

          {/* Header */}
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <div style={{ fontFamily:'DM Mono,monospace', fontSize:'0.7rem', letterSpacing:'0.2em', textTransform:'uppercase', color:cyber, display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:12 }}>
              <span style={{ width:24, height:1, background:cyber, display:'inline-block' }} />
              Mini Game
              <span style={{ width:24, height:1, background:cyber, display:'inline-block' }} />
            </div>
            <h1 className="glitch-text" data-text="CMD_INVADERS"
              style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'clamp(2rem,6vw,3.5rem)', color:'#fff', marginBottom:8, display:'inline-block', position:'relative' }}>
              CMD_INVADERS
            </h1>
            <p style={{ fontFamily:'DM Mono,monospace', fontSize:'0.7rem', color:textMut, letterSpacing:'0.2em', textTransform:'uppercase' }}>
              Defend the system against malware intrusion
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:24 }} className="game-layout">
            <style>{`@media(min-width:1024px){.game-layout{grid-template-columns:2fr 1fr!important;}}`}</style>

            {/* Canvas area */}
            <div>
              <div style={{ position:'relative', background:'#000', borderRadius:8, aspectRatio:'4/3', overflow:'hidden' }} className="pixel-border">
                <div className="game-scanline" />
                <div className="game-crt" />
                <canvas ref={canvasRef} style={{ width:'100%', height:'100%', display:'block', cursor:'crosshair', imageRendering:'pixelated' }} />
              </div>

              {/* Mobile controls */}
              <div style={{ marginTop:16, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }} className="mobile-controls">
                <style>{`@media(min-width:1024px){.mobile-controls{display:none!important;}}`}</style>
                <button id="btn-left"
                  style={{ background:bgCard, border:`1px solid ${borderSub}`, color:cyber, borderRadius:6, padding:'16px 0', fontSize:20, cursor:'pointer' }}>◀</button>
                <button id="btn-fire"
                  style={{ background:bgCard, border:`1px solid ${borderSub}`, color:cyber, borderRadius:6, padding:'16px 0', fontSize:11, fontFamily:'DM Mono,monospace', cursor:'pointer' }}>FIRE</button>
                <button id="btn-right"
                  style={{ background:bgCard, border:`1px solid ${borderSub}`, color:cyber, borderRadius:6, padding:'16px 0', fontSize:20, cursor:'pointer' }}>▶</button>
              </div>

              {/* KB controls legend */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:24, marginTop:12, flexWrap:'wrap' }} className="kb-legend">
                <style>{`@media(max-width:1023px){.kb-legend{display:none!important;}}`}</style>
                {[['←','→','Move'],['SPACE','','Fire'],['P','','Pause'],['R','','Restart']].map(([k1,k2,label])=>(
                  <div key={label} style={{ display:'flex', alignItems:'center', gap:6, fontFamily:'DM Mono,monospace', fontSize:11, color:textMut }}>
                    <span className="key-badge">{k1}</span>
                    {k2 && <span className="key-badge">{k2}</span>}
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

              {/* Stats */}
              <div style={{ background:bgCard, border:`1px solid ${borderSub}`, padding:16 }}>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:cyber, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ width:6, height:6, background:green, borderRadius:'50%', animation:'pulse 2s infinite', display:'inline-block' }} />
                  System Status
                </div>
                {[
                  ['SCORE', sideScore, '#fff'],
                  ['HIGH SCORE', sideHigh, cyber],
                  ['LEVEL', String(sideLevel), purple],
                  ['LIVES', sideLives, '#ef4444'],
                ].map(([label,val,color])=>(
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', fontFamily:'DM Mono,monospace', fontSize:13, marginBottom:8 }}>
                    <span style={{ color:textMut }}>{label}</span>
                    <span style={{ color, fontWeight:700 }}>{val}</span>
                  </div>
                ))}
                <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${borderSub}` }}>
                  <div style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:textMut, marginBottom:6 }}>Integrity</div>
                  <div style={{ height:6, background:'rgba(0,217,255,0.1)', borderRadius:3, overflow:'hidden' }}>
                    <div style={{ height:'100%', background:`linear-gradient(90deg,${green},${cyber})`, transform:`scaleX(${integrity})`, transformOrigin:'left', transition:'transform 0.3s', borderRadius:3 }} />
                  </div>
                </div>
              </div>

              {/* Threat index */}
              <div style={{ background:bgCard, border:`1px solid ${borderSub}`, padding:16 }}>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:cyber, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:12 }}>Threat Index</div>
                {[['✦','Ransomware','#ef4444','30 pts'],['◈','Trojan','#f59e0b','20 pts'],['◆','Malware','#10b981','10 pts'],['◎','UFO Hacker',cyber,'???']].map(([icon,name,color,pts])=>(
                  <div key={name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8, fontFamily:'DM Mono,monospace', fontSize:11 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ color, fontSize:14 }}>{icon}</span>
                      <span style={{ color:textSec }}>{name}</span>
                    </div>
                    <span style={{ color:cyber }}>{pts}</span>
                  </div>
                ))}
              </div>

              {/* Leaderboard */}
              <div style={{ background:bgCard, border:`1px solid ${borderSub}`, padding:16 }}>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:cyber, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:12 }}>Top Defenders</div>
                {lb.length===0
                  ? <div style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:textMut, textAlign:'center', padding:'8px 0' }}>No data yet — play to rank!</div>
                  : lb.map((e,i)=>(
                    <div key={i} className="lb-entry" style={{ display:'flex', justifyContent:'space-between', fontFamily:'DM Mono,monospace', fontSize:11, padding:'4px 8px', borderRadius:4 }}>
                      <span style={{ color:i===0?'#f59e0b':i===1?'#cbd5e1':i===2?'#b45309':textMut }}>#{i+1}</span>
                      <span style={{ color:'#fff', fontWeight:700 }}>{e.score.toString().padStart(6,'0')}</span>
                      <span style={{ color:cyber }}>LVL {e.level}</span>
                      <span style={{ color:textMut }}>{e.date}</span>
                    </div>
                  ))
                }
              </div>

              {/* Buttons */}
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={()=>gameRef.current?.start()}
                  style={{ flex:1, background:`linear-gradient(135deg,rgba(0,217,255,0.13),rgba(124,58,237,0.13))`, border:`1px solid ${cyber}`, color:cyber, fontFamily:'DM Mono,monospace', fontSize:12, letterSpacing:'0.1em', textTransform:'uppercase', padding:'10px 0', cursor:'pointer', transition:'all 0.3s' }}>
                  ▶ START
                </button>
                <button onClick={()=>gameRef.current?.restart()}
                  style={{ flex:1, background:bgCard, border:`1px solid ${borderSub}`, color:textSec, fontFamily:'DM Mono,monospace', fontSize:12, letterSpacing:'0.1em', textTransform:'uppercase', padding:'10px 0', cursor:'pointer', transition:'all 0.3s' }}>
                  ↺ RESET
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}