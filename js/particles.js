// ================================================================
//  NestVault — Particles (re-runnable for SPA)
// ================================================================

let _particleRafId = null;

window.__initParticles = function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  if (_particleRafId) { cancelAnimationFrame(_particleRafId); _particleRafId = null; }

  function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
  resize();

  const resizeHandler = () => {
    if (!document.getElementById('particle-canvas')) { window.removeEventListener('resize', resizeHandler); return; }
    resize();
  };
  window.removeEventListener('resize', window.__particleResizeHandler);
  window.__particleResizeHandler = resizeHandler;
  window.addEventListener('resize', resizeHandler);

  const PURPLE = [139,92,246], VIOLET = [109,40,217], WHITE = [220,210,255];
  const palettes = [PURPLE,VIOLET,WHITE,PURPLE,WHITE];
  function rand(a,b) { return a + Math.random()*(b-a); }

  class Particle {
    constructor() { this.reset(true); }
    reset(initial) {
      this.x=rand(0,canvas.width); this.y=initial?rand(0,canvas.height):canvas.height+10;
      this.radius=rand(1.2,3.8); this.speed=rand(0.15,0.55); this.drift=rand(-0.18,0.18);
      this.alpha=0; this.maxAlpha=rand(0.35,0.85); this.life=0; this.maxLife=rand(180,380);
      const col=palettes[Math.floor(Math.random()*palettes.length)];
      this.rc=col[0]; this.gc=col[1]; this.bc=col[2]; this.glowR=this.radius*rand(2.5,5);
    }
    update() {
      this.y-=this.speed; this.x+=this.drift; this.life+=1;
      const pct=this.life/this.maxLife;
      if(pct<0.15) this.alpha=(pct/0.15)*this.maxAlpha;
      else if(pct>0.80) this.alpha=((1-pct)/0.20)*this.maxAlpha;
      else this.alpha=this.maxAlpha;
      if(this.life>=this.maxLife) this.reset(false);
    }
    draw() {
      const {x,y,rc,gc,bc,alpha,glowR,radius}=this;
      const grd=ctx.createRadialGradient(x,y,0,x,y,glowR);
      grd.addColorStop(0,`rgba(${rc},${gc},${bc},${alpha*0.55})`);
      grd.addColorStop(0.4,`rgba(${rc},${gc},${bc},${alpha*0.20})`);
      grd.addColorStop(1,`rgba(${rc},${gc},${bc},0)`);
      ctx.beginPath(); ctx.arc(x,y,glowR,0,Math.PI*2); ctx.fillStyle=grd; ctx.fill();
      ctx.beginPath(); ctx.arc(x,y,radius,0,Math.PI*2);
      ctx.fillStyle=`rgba(${rc},${gc},${bc},${alpha})`; ctx.fill();
    }
  }

  const particles = Array.from({length:72}, ()=>new Particle());
  let mx=-9999, my=-9999;
  const hero=canvas.parentElement;
  hero.addEventListener('mousemove', e=>{ const r=canvas.getBoundingClientRect(); mx=e.clientX-r.left; my=e.clientY-r.top; });
  hero.addEventListener('mouseleave', ()=>{ mx=-9999; my=-9999; });

  function drawConnections() {
    for(let i=0;i<particles.length;i++) for(let j=i+1;j<particles.length;j++) {
      const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y;
      const d=Math.sqrt(dx*dx+dy*dy);
      if(d<90){ ctx.beginPath(); ctx.moveTo(particles[i].x,particles[i].y); ctx.lineTo(particles[j].x,particles[j].y);
        ctx.strokeStyle=`rgba(139,92,246,${(1-d/90)*0.12})`; ctx.lineWidth=0.6; ctx.stroke(); }
    }
  }

  function applyRepel(p) {
    if(mx<0) return;
    const dx=p.x-mx, dy=p.y-my, d=Math.sqrt(dx*dx+dy*dy);
    if(d<80&&d>0){ const f=(80-d)/80; p.x+=(dx/d)*f*1.4; p.y+=(dy/d)*f*1.4; }
  }

  function loop() {
    if(!document.getElementById('particle-canvas')) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawConnections();
    particles.forEach(p=>{ applyRepel(p); p.update(); p.draw(); });
    _particleRafId=requestAnimationFrame(loop);
  }
  loop();
};
