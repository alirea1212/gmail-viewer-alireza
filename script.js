// Time zone
const TZ = 'Asia/Tehran';

// Elements
const elDigital = document.getElementById('digital');
const elTZ = document.getElementById('tz');
const elGreg = document.getElementById('greg');
const elJalali = document.getElementById('jalali');
const elIso = document.getElementById('iso');
const elCopied = document.getElementById('copied');
const elYear = document.getElementById('year');

const handHour = document.getElementById('handHour');
const handMinute = document.getElementById('handMinute');
const handSecond = document.getElementById('handSecond');

// Formatters
const fmtTime = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ, hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
});
const fmtGreg = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});
const fmtJalali = new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn', {
  timeZone: TZ, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});
const fmtISOparts = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ, year:'numeric', month:'2-digit', day:'2-digit',
  hour12:false, hour:'2-digit', minute:'2-digit', second:'2-digit'
});
const fmtOffset = new Intl.DateTimeFormat('en-US', { timeZone: TZ, timeZoneName: 'shortOffset', hour:'2-digit' });

function offsetLabel(d){
  const p = fmtOffset.formatToParts(d).find(x=>x.type==='timeZoneName');
  return p ? p.value.replace('GMT','UTC') : 'UTC+03:30';
}

function update(){
  const now = new Date();

  // Digital
  elDigital.textContent = fmtTime.format(now);
  elGreg.textContent = fmtGreg.format(now);
  elJalali.textContent = fmtJalali.format(now);

  const parts = fmtISOparts.formatToParts(now);
  const y = parts.find(p=>p.type==='year').value;
  const m = parts.find(p=>p.type==='month').value;
  const d = parts.find(p=>p.type==='day').value;
  const hh= parts.find(p=>p.type==='hour').value;
  const mm= parts.find(p=>p.type==='minute').value;
  const ss= parts.find(p=>p.type==='second').value;
  const off = offsetLabel(now);
  elTZ.textContent = `${off} (${TZ})`;
  elIso.textContent = `${y}-${m}-${d}T${hh}:${mm}:${ss}${off.replace('UTC','')}`;

  // Hands angles
  // Convert current UTC time to Tehran by using DateTimeFormat parts for hours/minutes/seconds
  const h = Number(hh);
  const mi = Number(mm);
  const se = Number(ss);

  const secAngle = se * 6; // 360/60
  const minAngle = (mi + se/60) * 6;
  const hourAngle = ((h % 12) + mi/60 + se/3600) * 30; // 360/12

  handSecond.style.transform = `translate(-50%,-100%) rotate(${secAngle}deg)`;
  handMinute.style.transform = `translate(-50%,-100%) rotate(${minAngle}deg)`;
  handHour.style.transform = `translate(-50%,-100%) rotate(${hourAngle}deg)`;

  elYear.textContent = new Intl.DateTimeFormat('en', { timeZone: TZ, year: 'numeric' }).format(now);

  // Smooth update on the next second boundary
  const ms = now.getMilliseconds();
  setTimeout(update, 1000 - ms + 5);
}

// Copy helpers
function flash(msg){
  elCopied.textContent = msg;
  clearTimeout(flash._t);
  flash._t = setTimeout(()=> elCopied.textContent = '', 1200);
}
document.getElementById('copyIso').addEventListener('click', ()=> {
  navigator.clipboard.writeText(elIso.textContent).then(()=> flash('Copied!')).catch(()=> flash('Copy failed'));
});
document.getElementById('copyTime').addEventListener('click', ()=> {
  navigator.clipboard.writeText(elDigital.textContent).then(()=> flash('Copied!')).catch(()=> flash('Copy failed'));
});

// Animated RGB background (canvas)
const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d', { alpha: true });

let W, H, t = 0;
const dots = [];
const DOTS = 70;

function resize(){
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize); resize();

function initDots(){
  dots.length = 0;
  for(let i=0;i<DOTS;i++){
    dots.push({
      x: Math.random()*W,
      y: Math.random()*H,
      r: 1 + Math.random()*2.2,
      vx: -0.3 + Math.random()*0.6,
      vy: -0.3 + Math.random()*0.6
    });
  }
}
initDots();

function rgbGradient(time){
  const r = Math.floor(128 + 127*Math.sin(time*0.002));
  const g = Math.floor(128 + 127*Math.sin(time*0.002 + 2));
  const b = Math.floor(128 + 127*Math.sin(time*0.002 + 4));
  const grad = ctx.createRadialGradient(W*0.7, H*0.2, 50, W*0.5, H*0.8, Math.max(W,H));
  grad.addColorStop(0, `rgba(${r},${g},${b},0.55)`);
  grad.addColorStop(1, 'rgba(10,12,20,0.85)');
  return grad;
}

function animate(){
  t += 16;

  ctx.fillStyle = rgbGradient(t);
  ctx.fillRect(0,0,W,H);

  // Soft orbs
  for(let i=0;i<dots.length;i++){
    const d = dots[i];
    d.x += d.vx; d.y += d.vy;
    if(d.x < -20) d.x = W+20; if(d.x>W+20) d.x=-20;
    if(d.y < -20) d.y = H+20; if(d.y>H+20) d.y=-20;

    const grd = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, 60);
    grd.addColorStop(0, 'rgba(255,255,255,0.10)');
    grd.addColorStop(1, 'rgba(255,255,255,0.0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(d.x, d.y, 60, 0, Math.PI*2);
    ctx.fill();
  }

  requestAnimationFrame(animate);
}
animate();

// Kick things off
update();
