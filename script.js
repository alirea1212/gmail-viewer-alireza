// static/script.js
(() => {
  const PASS = 'علیرضا'; // رمز سایت (همونی که خواستی)
  const loginBlock = document.getElementById('login-block');
  const panel = document.getElementById('panel');
  const sitePassInput = document.getElementById('sitePass');
  const siteLoginBtn = document.getElementById('siteLoginBtn');
  const loginMsg = document.getElementById('loginMsg');
  const connectGoogleBtn = document.getElementById('connectGoogle');
  const loadEmailsBtn = document.getElementById('loadEmails');
  const emailsList = document.getElementById('emailsList');
  const logoutBtn = document.getElementById('logoutBtn');
  const calcBtn = document.getElementById('calcBtn');

  function showPanel() {
    loginBlock.classList.add('hidden');
    panel.classList.remove('hidden');
  }

  function showLogin() {
    loginBlock.classList.remove('hidden');
    panel.classList.add('hidden');
  }

  siteLoginBtn.addEventListener('click', () => {
    const v = sitePassInput.value;
    if (v === PASS) {
      // call server to set session
      fetch('/api/site-login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({pass:v}) })
        .then(r => r.json())
        .then(j => {
          if (j.ok) showPanel();
          else loginMsg.textContent = 'خطا در ورود';
        }).catch(e => loginMsg.textContent = 'خطا در ارتباط با سرور');
    } else {
      loginMsg.textContent = 'رمز اشتباه است';
    }
  });

  connectGoogleBtn.addEventListener('click', () => {
    // redirect user to server OAuth start
    window.location.href = '/api/auth/google';
  });

  loadEmailsBtn.addEventListener('click', () => {
    emailsList.innerHTML = '...در حال بارگذاری';
    fetch('/api/emails').then(r => {
      if (r.status === 401) {
        emailsList.innerHTML = '';
        alert('ابتدا به سایت با گوگل متصل شوید یا session شما معتبر نیست.');
        return;
      }
      return r.json();
    }).then(j => {
      if (!j) return;
      emailsList.innerHTML = '';
      if (!j.messages || j.messages.length === 0) {
        emailsList.innerHTML = '<li>ایمیلی برای نمایش وجود ندارد</li>';
        return;
      }
      j.messages.forEach(m => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${escapeHtml(m.subject|| '(بدون موضوع)')}</strong><div class="muted">${escapeHtml(m.from||'')} — ${escapeHtml(m.date||'')}</div>`;
        emailsList.appendChild(li);
      });
    }).catch(e => {
      emailsList.innerHTML = '';
      alert('خطا هنگام دریافت ایمیل‌ها');
    });
  });

  logoutBtn.addEventListener('click', () => {
    fetch('/api/site-logout', {method:'POST'}).then(()=> showLogin());
  });

  // show loadEmails button if server says oauth done
  fetch('/api/session-status').then(r=>r.json()).then(j=>{
    if (j.loggedIn) showPanel();
    if (j.oauth) loadEmailsBtn.classList.remove('hidden');
  });

  // simple calc
  calcBtn.addEventListener('click', () => {
    const a = parseFloat(prompt('عدد اول را وارد کنید:'));
    const b = parseFloat(prompt('عدد دوم را وارد کنید:'));
    if (!isNaN(a) && !isNaN(b)) alert('جمع: ' + (a+b));
    else alert('عدد معتبر وارد کنید');
  });

  function escapeHtml(s){ if(!s) return ''; return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }
})();
