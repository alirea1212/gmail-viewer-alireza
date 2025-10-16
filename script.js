// script.js
// نسخهٔ کامل JS برای رسم گردونه، مدیریت گزینه‌ها، چرخش و افکت کنفتی

// ----- المان‌ها -----
const wheel = document.getElementById('wheel');
const ctx = wheel.getContext('2d');
const status = document.getElementById('status');
const optionsList = document.getElementById('optionsList');
const optInput = document.getElementById('optInput');
const addBtn = document.getElementById('addBtn');
const spinBtn = document.getElementById('spinBtn');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');
const loadBtn = document.getElementById('loadBtn');
const exportBtn = document.getElementById('exportBtn');

const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalText = document.getElementById('modalText');
const closeModal = document.getElementById('closeModal');

const confettiCanvas = document.getElementById('confettiCanvas');
const cctx = confettiCanvas.getContext('2d');

// ----- داده‌ها -----
let opts = []; // آرایهٔ متن گزینه‌ها
let colors = []; // رنگ هر بخش
let currentRotation = 0; // رادیان
let spinning = false;

// رنگ‌سازی تصادفیِ شاد (برای هر بخش یک رنگ تابلو)
function makeColors(n){
  const palette = [
    '#ff6b6b','#ffd166','#6bf5d6','#8ec5ff','#c08dff','#ffb3c1','#ffe59e',
    '#9be7ff','#b6ffb3','#ff9f7a','#a3a0ff','#ffc6e7'
  ];
  const out = [];
  for(let i=0;i<n;i++) out.push(palette[i % palette.length]);
  return out;
}

// اندازه و رسم کانواس
function resizeCanvas(){
  const rect = wheel.getBoundingClientRect();
  const w = rect.width;
  wheel.width = w * devicePixelRatio;
  wheel.height = w * devicePixelRatio;
  wheel.style.width = rect.width + 'px';
  wheel.style.height = rect.height + 'px';
  // کانتکست را دوباره تنظیم میکنیم
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  drawWheel(currentRotation || 0);

  confettiCanvas.width = window.innerWidth * devicePixelRatio;
  confettiCanvas.height = window.innerHeight * devicePixelRatio;
  confettiCanvas.style.width = window.innerWidth + 'px';
  confettiCanvas.style.height = window.innerHeight + 'px';
  cctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
}
window.addEventListener('resize', resizeCanvas);
setTimeout(resizeCanvas, 50);

// رسم گردونه بر اساس opts و currentRotation
function drawWheel(rotation){
  const rect = wheel.getBoundingClientRect();
  const size = Math.min(rect.width, rect.height);
  const cx = size/2, cy = size/2, r = size*0.45;

  ctx.clearRect(0,0,wheel.width, wheel.height);
  // پس‌زمینه نرم دایره‌ای
  ctx.save();
  ctx.translate(cx,cy);
  ctx.rotate(rotation);
  const slice = (Math.PI * 2) / Math.max(opts.length,1);

  if(opts.length === 0){
    // دایرهٔ خالی با نوشته
    ctx.beginPath();
    ctx.arc(0,0,r,0,Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fill();
    ctx.fillStyle = '#ffffff88';
    ctx.font = `${Math.max(14, size*0.04)}px Vazirmatn, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('هیچ گزینه‌ای اضافه نشده',0,6);
    ctx.restore();
    return;
  }

  for(let i=0;i<opts.length;i++){
    const start = i * slice;
    const end = start + slice;
    // بدنه
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.arc(0,0,r,start,end);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();
    // مرز
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // متن داخل هر بخش
    ctx.save();
    const mid = (start + end) / 2;
    ctx.rotate(mid);
    ctx.translate(r*0.6,0);
    ctx.rotate(Math.PI/2);
    ctx.fillStyle = '#001218';
    ctx.font = `${Math.max(12, size*0.035)}px Vazirmatn, sans-serif`;
    ctx.textAlign = 'center';
    // break long text into multiple lines if needed
    const text = opts[i];
    const maxChars = 18;
    if(text.length > maxChars){
      // ساده‌شده: دو خطی
      const first = text.slice(0, maxChars);
      const second = text.slice(maxChars);
      ctx.fillText(first, 0, -8);
      ctx.fillText(second, 0, 12);
    } else {
      ctx.fillText(text, 0, 0);
    }
    ctx.restore();
  }

  // حلقهٔ بیرونی براق
  ctx.beginPath();
  ctx.arc(0,0,r+8,0,Math.PI*2);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 12;
  ctx.stroke();

  ctx.restore();
}

// ----- مدیریت گزینه‌ها (افزودن/حذف/نمایش) -----
function renderOptions(){
  optionsList.innerHTML = '';
  if(opts.length === 0){
    optionsList.innerHTML = `<div class="opt empty"><span>هیچ گزینه‌ای اضافه نشده</span></div>`;
    status.className = 'msg empty';
    status.textContent = 'گردونه خالی است';
    return;
  }
  status.className = 'msg info';
  status.textContent = 'آمادهٔ چرخش — گزینه‌ها بارگذاری شدند';
  opts.forEach((o, idx) => {
    const div = document.createElement('div');
    div.className = 'opt';
    const span = document.createElement('span');
    span.textContent = o;
    const right = document.createElement('div');
    right.style.display = 'flex';
    right.style.gap = '8px';
    const up = document.createElement('button');
    up.textContent = '▲';
    up.title = 'بالا';
    up.addEventListener('click', () => {
      if(idx === 0) return;
      const t = opts[idx-1]; opts[idx-1] = opts[idx]; opts[idx] = t;
      colors = makeColors(opts.length);
      renderOptions(); drawWheel(currentRotation);
    });
    const down = document.createElement('button');
    down.textContent = '▼';
    down.title = 'پایین';
    down.addEventListener('click', () => {
      if(idx === opts.length-1) return;
      const t = opts[idx+1]; opts[idx+1] = opts[idx]; opts[idx] = t;
      colors = makeColors(opts.length);
      renderOptions(); drawWheel(currentRotation);
    });
    const del = document.createElement('button');
    del.textContent = 'حذف';
    del.title = 'حذف';
    del.addEventListener('click', () => {
      opts.splice(idx,1);
      colors = makeColors(opts.length);
      renderOptions(); drawWheel(currentRotation);
    });
    right.appendChild(up);
    right.appendChild(down);
    right.appendChild(del);
    div.appendChild(span);
    div.appendChild(right);
    optionsList.appendChild(div);
  });
}

// افزودن گزینه
addBtn.addEventListener('click', () => {
  const v = optInput.value.trim();
  if(!v) return;
  opts.push(v);
  optInput.value = '';
  colors = makeColors(opts.length);
  renderOptions();
  drawWheel(currentRotation);
});

// کلیر
clearBtn.addEventListener('click', () => {
  if(!confirm('تمام گزینه‌ها پاک شوند؟')) return;
  opts = [];
  colors = [];
  renderOptions();
  drawWheel(0);
});

// ذخیره محلی
saveBtn.addEventListener('click', () => {
  localStorage.setItem('wheel_opts_v1', JSON.stringify(opts));
  alert('ذخیره شد');
});

// بارگذاری از محلی
loadBtn.addEventListener('click', () => {
  const data = localStorage.getItem('wheel_opts_v1');
  if(!data){ alert('چیزی در حافظه محلی یافت نشد'); return; }
  try{
    const arr = JSON.parse(data);
    if(Array.isArray(arr)){ opts = arr; colors = makeColors(opts.length); renderOptions(); drawWheel(0); }
    else alert('فرمت داده نامعتبر است');
  }catch(e){ alert('بارگذاری ناموفق'); }
});

// دریافت فایل JSON
exportBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(opts, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wheel-options.json';
  a.click();
  URL.revokeObjectURL(url);
});

// ----- چرخش گردونه -----
// محاسبهٔ ایندکس برنده از زاویه نهایی
function getWinningIndex(finalRotation){
  // finalRotation همان rotation در زمان استپ نسبت به حالت اولیه است (در رادیان)
  // ما می‌خواهیم ببینیم نشانگر در بالای صفحه به کدام اسلایس اشاره دارد.
  const slice = (Math.PI * 2) / opts.length;
  // ناحیه‌ای که نشانگر (در بالای کانواس) می‌گیرد برابر زاویه از -slice/2 تا +slice/2 نسبت به محور عمودی بالا است.
  // با توجه به اینکه ما wheel را با rotation چرخاندیم، محاسبهٔ index به شکل زیر:
  const normalized = ( (2*Math.PI) - (finalRotation % (2*Math.PI)) + (slice/2) ) % (2*Math.PI);
  let idx = Math.floor(normalized / slice);
  idx = idx % opts.length;
  return idx;
}

// انیمیشن چرخش با easing
function spinWheel(){
  if(spinning) return;
  if(opts.length === 0){
    status.className = 'msg empty';
    status.textContent = 'گردونه خالی است';
    return;
  }
  spinning = true;
  status.className = 'msg info';
  status.textContent = 'در حال چرخش...';

  // انتخاب تصادفیِ نهایی با کمی وزن یکنواخت
  const spins = Math.floor(Math.random()*3) + 6; // تعداد دور کامل
  const randomIndex = Math.floor(Math.random()*opts.length);
  // هدف: زاویه‌ای که آن ایندکس را زیر نشانگر قرار می‌دهد
  const slice = (Math.PI * 2) / opts.length;
  // زاویه‌ای که نشانگر روی index را می‌گیرد (با توجه به getWinningIndex)
  // معکوس محاسبه: ما می‌خواهیم finalRotation طوری باشد که getWinningIndex(finalRotation) === randomIndex
  const targetMidAngle = (randomIndex * slice) + slice/2;
  // محاسبهٔ finalRotation برای رسیدن به targetMidAngle
  // از فرمول getWinningIndex: normalized = (2π - finalRotation + slice/2) mod 2π
  // و idx = floor(normalized / slice) = randomIndex
  // بنابراین normalized باید در بازه [randomIndex*slice, (randomIndex+1)*slice)
  // ما قصد داریم normalized = randomIndex*slice + slice/2
  const normalizedDesired = randomIndex*slice + slice/2;
  // حل برای finalRotation (در بازه مثبت):
  let finalRotation = (2*Math.PI) - (normalizedDesired - (slice/2));
  // حالا اضافه کردن دور کامل
  finalRotation += spins * 2 * Math.PI;
  // اضافه کمی لرزش تصادفی
  finalRotation += (Math.random() - 0.5) * (slice * 0.4);

  const duration = 4200 + Math.random()*1200; // میلی‌ثانیه
  const start = performance.now();
  const startRot = currentRotation || 0;
  const delta = finalRotation - startRot;

  function easeOutCubic(t){ return 1 - Math.pow(1-t,3); }

  function frame(now){
    const t = Math.min(1, (now - start)/duration);
    const eased = easeOutCubic(t);
    currentRotation = startRot + delta * eased;
    drawWheel(currentRotation);
    if(t < 1){
      requestAnimationFrame(frame);
    } else {
      // استپ
      spinning = false;
      const winIdx = getWinningIndex(currentRotation);
      showResult(winIdx);
    }
  }
  requestAnimationFrame(frame);
}

// نمایش نتیجه و افکت کنفتی
function showResult(idx){
  const text = opts[idx] || '';
  modalTitle.textContent = 'نتیجه';
  modalText.textContent = text;
  modal.classList.add('show');

  // افکت کنفتی ساده
  runConfetti();
  status.className = 'msg info';
  status.textContent = `برنده: ${text}`;
}

// بستن مودال
closeModal.addEventListener('click', () => {
  modal.classList.remove('show');
});

// کلیک روی دکمهٔ شروع
spinBtn.addEventListener('click', spinWheel);

// ----- کنفتی ساده (بافر اپتیمایزشده) -----
let confettiPieces = [];
function makeConfetti(){
  confettiPieces = [];
  const w = window.innerWidth;
  const h = window.innerHeight;
  const count = 80;
  for(let i=0;i<count;i++){
    confettiPieces.push({
      x: Math.random() * w,
      y: Math.random() * -h * 0.5,
      vx: (Math.random()-0.5) * 4,
      vy: 2 + Math.random()*4,
      rot: Math.random()*360,
      rotSpeed: (Math.random()-0.5)*8,
      size: 6 + Math.random()*10,
      color: colors.length ? colors[i % colors.length] : ['#ff6b6b','#ffd166','#6bf5d6'][i%3]
    });
  }
}

let confettiRunning = false;
function runConfetti(){
  confettiCanvas.style.display = 'block';
  if(confettiRunning) return;
  makeConfetti();
  confettiRunning = true;
  let last = performance.now();

  function loop(now){
    const dt = (now - last) / 1000;
    last = now;
    cctx.clearRect(0,0, confettiCanvas.width, confettiCanvas.height);
    confettiPieces.forEach(p => {
      p.x += p.vx * 60 * dt;
      p.y += p.vy * 60 * dt;
      p.vy += 30 * dt; // gravity
      p.rot += p.rotSpeed * dt;
      cctx.save();
      cctx.translate(p.x, p.y);
      cctx.rotate(p.rot * Math.PI/180);
      cctx.fillStyle = p.color;
      cctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
      cctx.restore();
    });
    // فیلتر کردن قطعاتی که از صفحه خارج شدند
    confettiPieces = confettiPieces.filter(p => p.y < window.innerHeight + 50);
    if(confettiPieces.length > 0){
      requestAnimationFrame(loop);
    } else {
      confettiRunning = false;
      confettiCanvas.style.display = 'none';
    }
  }
  requestAnimationFrame(loop);
}

// ----- بارگذاری اولیه (اگر local وجود داشت) -----
(function init(){
  const data = localStorage.getItem('wheel_opts_v1');
  if(data){
    try{
      const arr = JSON.parse(data);
      if(Array.isArray(arr) && arr.length>0){ opts = arr; colors = makeColors(opts.length); }
    }catch(e){}
  }
  // render اولیه
  colors = makeColors(opts.length);
  renderOptions();
  setTimeout(()=>{ resizeCanvas(); drawWheel(0); }, 100);
})();

// امکان اضافه کردن با Enter
optInput.addEventListener('keydown', (e) => {
  if(e.key === 'Enter'){ addBtn.click(); }
});
