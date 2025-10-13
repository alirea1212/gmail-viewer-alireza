// رمز سایت: "علیرضا"
(() => {
  const PASS = 'علیرضا';
  const el = id => document.getElementById(id);
  const msg = el('msg'), list = el('list');

  function showPanel(){ el('login').classList.add('hidden'); el('panel').classList.remove('hidden'); }
  function showLogin(){ el('login').classList.remove('hidden'); el('panel').classList.add('hidden'); list.innerHTML=''; }

  el('btnLogin').onclick = () => {
    if (el('pass').value === PASS) { showPanel(); msg.textContent=''; }
    else msg.textContent = 'رمز اشتباه';
  };

  el('btnLogout').onclick = () => { el('pass').value=''; showLogin(); }

  // دکمه اتصال: فقط ریدایرکت به آدرس سرور برای OAuth (سرور نیاز است)
  el('btnConnect').onclick = () => {
    // اگر سرور OAuth داری، آدرس را بذار اینجا:
    // window.location.href = 'https://your-domain.com/api/auth/google';
    alert('این دکمه برای اتصال به گوگل است. باید سرور OAuth راه‌اندازی شود.');
  };

  // بارگذاری پیام‌ها: درخواست شبیه‌سازی به آدرس mock
  el('btnLoad').onclick = async () => {
    list.innerHTML = '<li>در حال بارگذاری...</li>';
    try {
      // برای حالا از یک endpoint شبیه‌سازی‌شده استفاده می‌کنیم.
      // در سرور واقعی باید این آدرس یک پروکسی امن باشد که با OAuth ایمیل می‌خواند.
      const res = await fetch('/api/mock-emails');
      if (!res.ok) throw new Error('خطا');
      const j = await res.json();
      list.innerHTML = '';
      if (!j.length) list.innerHTML = '<li>پیامی نیست</li>';
      j.forEach(m=>{
        const li = document.createElement('li');
        li.innerHTML = `<strong>${m.subject||'(بدون موضوع)'}</strong><div style="color: #9aa6b2;font-size:13px">${m.from} — ${m.date}</div>`;
        list.appendChild(li);
      });
    } catch (e) {
      list.innerHTML = '<li>خطا در دریافت پیام‌ها</li>';
    }
  };

})();
