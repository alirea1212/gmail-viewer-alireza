(() => {
  const PASS = 'علیرضا';
  const API_BASE = ''; // اگر سرور جداست، اینجا URL سرور را بگذار

  const el = id => document.getElementById(id);
  const msg = el('msg'), list = el('list');

  function showPanel(){ el('login').classList.add('hidden'); el('panel').classList.remove('hidden'); }
  function showLogin(){ el('login').classList.remove('hidden'); el('panel').classList.add('hidden'); list.innerHTML=''; }

  async function checkSession(){
    try {
      const r = await fetch(API_BASE + '/api/session-status');
      if (!r.ok) return;
      const j = await r.json();
      if (j.loggedIn) showPanel();
      if (j.oauth) el('btnLoad').style.display = 'inline-block';
    } catch (e){ console.warn('session-status failed', e); }
  }

  el('btnLogin').onclick = async () => {
    const v = el('pass').value;
    if (v !== PASS) { msg.textContent = 'رمز اشتباه'; return; }
    try {
      const r = await fetch(API_BASE + '/api/site-login', {
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({pass:v})
      });
      const j = await r.json();
      if (j.ok) {
        showPanel();
        if (j.oauth) el('btnLoad').style.display = 'inline-block';
        msg.textContent = '';
      } else msg.textContent = 'خطا در لاگین';
    } catch (e) { msg.textContent = 'ارتباط با سرور برقرار نشد'; }
  };

  el('btnLogout').onclick = async () => {
    try { await fetch(API_BASE + '/api/site-logout', {method:'POST'}); } catch(e){}
    el('pass').value = '';
    showLogin();
  };

  el('btnConnect').onclick = () => {
    window.location.href = API_BASE + '/api/auth/google';
  };

  el('btnLoad').onclick = async () => {
    list.innerHTML = '<li>در حال بارگذاری...</li>';
    try {
      const r = await fetch(API_BASE + '/api/emails');
      if (r.status === 401) { list.innerHTML=''; alert('ابتدا اتصال گوگل را انجام بده'); return; }
      if (!r.ok) throw new Error('خطا');
      const j = await r.json();
      list.innerHTML = '';
      if (!j.messages || j.messages.length === 0) { list.innerHTML='<li>پیامی نیست</li>'; return; }
      j.messages.forEach(m => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${escapeHtml(m.subject||'(بدون موضوع)')}</strong>
                        <div style="color:#9aa6b2;font-size:13px">${escapeHtml(m.from||'')} — ${escapeHtml(m.date||'')}</div>`;
        list.appendChild(li);
      });
    } catch (e) { list.innerHTML='<li>خطا در دریافت پیام‌ها</li>'; console.error(e); }
  };

  checkSession();

  function escapeHtml(s){ if(!s) return ''; return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }
})();
