// رمز سایت: "علیرضا"
const PASS = 'علیرضا';
const el = id => document.getElementById(id);

el('btnLogin').onclick = async () => {
  const v = el('pass').value;
  const res = await fetch('/api/site-login', {
    method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({pass:v})
  });
  const j = await res.json();
  if (j.ok) {
    el('login').style.display='none';
    el('panel').style.display='block';
    if (j.oauth) el('btnLoad').style.display='inline-block';
  } else el('msg').textContent = 'رمز اشتباه';
};

el('btnConnect').onclick = () => { // آغاز OAuth
  window.location.href = '/api/auth/google';
};

el('btnLoad').onclick = async () => {
  el('list').innerHTML = '<li>در حال بارگذاری...</li>';
  const r = await fetch('/api/emails');
  if (r.status===401) { el('list').innerHTML=''; alert('ابتدا اتصال گوگل را انجام بده'); return; }
  const j = await r.json();
  el('list').innerHTML = '';
  if (!j.messages || j.messages.length===0) el('list').innerHTML = '<li>پیامی نیست</li>';
  j.messages.forEach(m=>{
    const li = document.createElement('li');
    li.innerHTML = `<b>${m.subject||'(بدون موضوع)'}</b><div>${m.from} — ${m.date}</div>`;
    el('list').appendChild(li);
  });
};

el('btnLogout').onclick = async ()=> { await fetch('/api/site-logout',{method:'POST'}); el('panel').style.display='none'; el('login').style.display='block'; }
