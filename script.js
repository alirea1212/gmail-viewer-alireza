const tzName = 'Asia/Tehran';

const elClock = document.getElementById('clock');
const elGreg  = document.getElementById('dateGreg');
const elPers  = document.getElementById('datePersian');
const elTz    = document.getElementById('tz');
const elIso   = document.getElementById('iso');
const btnIso  = document.getElementById('copyIso');
const btnTime = document.getElementById('copyTime');
const elCopied= document.getElementById('copied');

const fmtTime = new Intl.DateTimeFormat('en-GB', {
  timeZone: tzName,
  hour12: false,
  hour: '2-digit', minute: '2-digit', second: '2-digit'
});

const fmtGreg = new Intl.DateTimeFormat('en-GB', {
  timeZone: tzName,
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

const fmtPersian = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  timeZone: tzName,
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

const fmtIso = new Intl.DateTimeFormat('en-CA', {
  timeZone: tzName,
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
});

function tzOffsetLabel(d){
  // Try to get "GMT+03:30" via timeZoneName part
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tzName,
    timeZoneName: 'shortOffset',
    hour: '2-digit'
  }).formatToParts(d);
  const tzPart = parts.find(p => p.type === 'timeZoneName');
  return tzPart ? tzPart.value.replace('GMT', 'UTC') : 'UTC+03:30';
}

function tick(){
  const now = new Date();

  elClock.textContent = fmtTime.format(now);
  elGreg.textContent  = fmtGreg.format(now);
  elPers.textContent  = fmtPersian.format(now);

  const isoParts = fmtIso.formatToParts(now);
  // Build ISO like YYYY-MM-DDTHH:mm:ss+03:30
  const y = isoParts.find(p=>p.type==='year').value;
  const m = isoParts.find(p=>p.type==='month').value;
  const d = isoParts.find(p=>p.type==='day').value;
  const hh= isoParts.find(p=>p.type==='hour').value;
  const mm= isoParts.find(p=>p.type==='minute').value;
  const ss= isoParts.find(p=>p.type==='second').value;

  const offset = tzOffsetLabel(now); // e.g., "UTC+03:30"
  elTz.textContent = `${offset} (${tzName})`;
  elIso.textContent = `${y}-${m}-${d}T${hh}:${mm}:${ss}${offset.replace('UTC','')}`;

  // Schedule next frame aligned to the next second
  const ms = now.getMilliseconds();
  setTimeout(tick, 1000 - ms + 5);
}

function copyText(text){
  navigator.clipboard.writeText(text).then(()=>{
    elCopied.textContent = 'Copied!';
    clearTimeout(copyText._t);
    copyText._t = setTimeout(()=> elCopied.textContent = '', 1200);
  }).catch(()=>{
    elCopied.textContent = 'Copy failed';
    clearTimeout(copyText._t);
    copyText._t = setTimeout(()=> elCopied.textContent = '', 1500);
  });
}

btnIso.addEventListener('click', ()=> copyText(elIso.textContent));
btnTime.addEventListener('click', ()=> copyText(elClock.textContent));

tick();
