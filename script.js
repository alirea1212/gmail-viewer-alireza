// ساده، تمیز، قابلِ فهم و عملکردی شبیه piliapp
const area = document.getElementById('itemsArea');
const applyBtn = document.getElementById('applyBtn');
const spinBtn = document.getElementById('spinBtn');
const wheel = document.getElementById('wheel');
const ctx = wheel.getContext('2d');
const status = document.getElementById('status');
const modal = document.getElementById('modal');
const modalText = document.getElementById('modalText');
const closeModal = document.getElementById('closeModal') || document.getElementById('closeModal');
const repeatSpin = document.getElementById('repeatSpin');
const presetSelect = document.getElementById('presetSelect');
const fullBtn = document.getElementById('fullBtn');

let items = [];
let colors = [];
let spinning = false;

// helpers
const clamp = (v,min,max)=> Math.max(min, Math.min(max,v));
function secureRandom(){ // عدد تصادفی امن بین 0 و 1
  const arr = new Uint32Array(1); crypto.getRandomValues(arr); return arr[0] / 0xffffffff;
}

// خواندن textarea -> آرایه (حداکثر 100)
function parseItems(){
  const lines = area.value.split('\n').map(s=>s.trim()).filter(Boolean);
  return lines.slice(0,100);
}

// رنگ‌ها (هشدار: قالب HSL برای تنوع)
function genColors(n){
  const out = [];
  for(let i=0;i<n;i++){
    out.push(`hsl(${Math.round((i*360)/n)},70%,60%)`);
  }
  return out;
}

// رسم wheel
function drawWheel(rotationDeg=0){
  const w = wheel.width = wheel.clientWidth;
  const h = wheel.height = wheel.clientHeight;
  ctx.clearRect(0,0,w,h);
  ctx.save();
  ctx.translate(w/2, h/2);
  ctx.rotate(rotationDeg * Math.PI/180);
  const r = Math.min(w,h)/2 * 0.95;
  const slice = (2*Math.PI) / Math.max(items.length,1);

  if(items.length===0){
    ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.fillStyle='#ffffff22'; ctx.fill();
    ctx.fillStyle='#111'; ctx.font='18px Vazirmatn'; ctx.textAlign='center'; ctx.fillText('هیچ موردی اضافه نشده',0,6);
    ctx.restore(); return;
  }

  for(let i=0;i<items.length;i++){
    const a = i*slice;
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.arc(0,0,r,a,a+slice);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,0.12)'; ctx.stroke();

    // نوشته
    ctx.save();
    const mid = a + slice/2;
    ctx.rotate(mid);
    ctx.translate(r*0.6,0);
    ctx.rotate(Math.PI/2);
    ctx.fillStyle = '#012';
    ctx.font = `${Math.max(12, r*0.09)}px Vazirmatn`;
    ctx.textAlign='center';
    const text = items[i];
    // wrap در صورت نیاز
    const max = 20;
    if(text.length > max){
      ctx.fillText(text.slice(0,max),0,-10);
      ctx.fillText(text.slice(max,max*2),0,12);
    } else {
      ctx.fillText(text,0,0);
    }
    ctx.restore();
  }
  ctx.restore();
}

// اعمال محتوا به چرخ
applyBtn.onclick = ()=>{
  items = parseItems();
  colors = genColors(items.length);
  drawWheel(0);
  status.textContent = items.length ? `آماده — ${items.length} مورد` : 'گردونه خالی است';
};

// پاک کردن
document.getElementById('clearBtn').onclick = ()=>{
  if(!confirm('پاک شود؟')) return;
  area.value=''; items=[]; colors=[]; drawWheel(0); status.textContent='خالی';
};

// ذخیره محلی / بارگذاری / صادرات / ورود
document.getElementById('saveBtn').onclick = ()=> {
  localStorage.setItem('wheel_items_v1', area.value);
  alert('ذخیره شد (localStorage)');
};
document.getElementById('loadBtn').onclick = ()=> {
  const d = localStorage.getItem('wheel_items_v1');
  if(!d){ alert('چیزی ذخیره نشده'); return; }
  area.value = d; applyBtn.click();
};
document.getElementById('exportBtn').onclick = ()=> {
  const blob = new Blob([JSON.stringify(parseItems(),null,2)],{type:'application/json'});
  const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='wheel.json'; a.click(); URL.revokeObjectURL(a.href);
};
document.getElementById('importBtn').onclick = async ()=> {
  const txt = prompt('لطفا JSON آرایه را وارد کن (["آ","ب",...])');
  if(!txt) return;
  try{
    const arr = JSON.parse(txt);
    if(Array.isArray(arr)){ area.value = arr.join('\n'); applyBtn.click(); }
    else alert('فرمت اشتباه');
  }catch(e){ alert('JSON نامعتبر'); }
};

// پیش‌تنظیم
presetSelect.onchange = ()=>{
  const v = presetSelect.value;
  if(!v) return;
  area.value = v;
  applyBtn.click();
  presetSelect.selectedIndex = 0;
};

// عملکرد چرخش: با CSS transform و transition، زاویه هدف از crypto/random
let currentDeg = 0;
spinBtn.onclick = spin;
function spin(){
  if(spinning) return;
  if(items.length===0){
    status.textContent = 'گردونه خالی است هوشنگ';
    status.style.color = 'red';
    return;
  }
  spinning = true;
  status.style.color=''; status.textContent = 'در حال چرخش...';
  // انتخاب تصادفی ایندکس
  const winnerIndex = Math.floor(secureRandom() * items.length);
  // محاسبه زاویه: هر اسلایس اندازه sDeg دارد
  const sDeg = 360 / items.length;
  // زاویه میانیِ برنده (نسبت به جهت اولیه)
  const targetMid = winnerIndex * sDeg + sDeg/2;
  // ما می‌خواهیم در پایان، نشانگر (بالای صفحه) روی آن میانی باشد.
  // بنابراین باید چرخ را بچرخانیم تا آن میانی به بالا بیاید: یعنی rotation so that that angle aligns to 270deg (pointer top).
  // ساده‌تر: targetRotation = 360*spins + (270 - targetMid) + smallRandom
  const spins = 6 + Math.floor(secureRandom()*4);
  const jitter = (secureRandom()-0.5) * (sDeg * 0.6);
  const target = spins*360 + (270 - targetMid) + jitter;
  currentDeg = (currentDeg + target) % 3600;
  // اعمال با transition طولی مبتنی بر spins
  wheel.style.transition = `transform ${3.8 + spins*0.1}s cubic-bezier(.12,.85,.2,1)`;
  wheel.style.transform = `rotate(${currentDeg}deg)`;

  // پایان با timeout تقریبی (کمتر از مدیریت دقیق transitionend برای سازگاری)
  const totalTime = (3800 + spins*100);
  setTimeout(()=>{
    spinning = false;
    const chosen = items[winnerIndex];
    status.textContent = `برنده: ${chosen}`;
    showModal(chosen);
  }, totalTime);
}

// modal
function showModal(text){
  modalText.textContent = text;
  modal.classList.add('show'); modal.setAttribute('aria-hidden','false');
}
closeModal && closeModal.addEventListener('click', ()=>{ modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); });
repeatSpin && repeatSpin.addEventListener('click', ()=>{ modal.classList.remove('show'); spin(); });

// keyboard shortcuts
window.addEventListener('keydown',(e)=>{
  if(e.code === 'Space'){ e.preventDefault(); spin(); }
  if(e.key === 'r' || e.key === 'R'){ area.value=''; applyBtn.click(); status.textContent='بازنشانی'; }
  if(e.key === 'e' || e.key === 'E'){ area.focus(); }
  if(e.key === 'f' || e.key === 'F'){ toggleFull(); }
});

// full screen
fullBtn.onclick = toggleFull;
function toggleFull(){
  const el = document.documentElement;
  if(!document.fullscreenElement) el.requestFullscreen?.();
  else document.exitFullscreen?.();
}

// initial
(function init(){
  const saved = localStorage.getItem('wheel_items_v1');
  if(saved){ area.value = saved; applyBtn.click(); }
  drawWheel(0);
})();
