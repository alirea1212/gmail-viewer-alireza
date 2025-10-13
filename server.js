// server.js
// اجرا: node server.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const {google} = require('googleapis');

const app = express();
app.use(express.json());

// تنظیمات session — در production نیاز به store مطمئن (redis/db) و secret قوی داره
app.use(session({
  secret: process.env.SESSION_SECRET || 'یک_راز_خیلی_قوی_اینجا',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: process.env.NODE_ENV === 'production' }
}));

// فایل استاتیک (front-end)
app.use('/static', express.static(path.join(__dirname, 'static')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// مقداردهی OAuth2 client — مقادیر را در .env قرار بده
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI; // مثلا https://your-domain.com/oauth2callback
if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
  console.warn('⚠️ CLIENT_ID, CLIENT_SECRET or REDIRECT_URI not set in .env. OAuth will not work until set.');
}
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
const gmail = google.gmail({version: 'v1', auth: oAuth2Client});

// مسیر لاگین سایت (رمز محلی)
app.post('/api/site-login', (req, res) => {
  const pass = req.body?.pass;
  if (pass === 'علیرضا') {
    req.session.siteAuth = true;
    return res.json({ok:true});
  }
  res.json({ok:false});
});
app.post('/api/site-logout', (req, res)=>{
  req.session.destroy(()=>res.json({ok:true}));
});

// وضعیت session (front-end برای نمایش پنل چک میکنه)
app.get('/api/session-status', (req, res) => {
  res.json({ loggedIn: !!req.session.siteAuth, oauth: !!req.session.oauthDone });
});

// شروع OAuth — هدایت به صفحهٔ اجازهٔ گوگل
app.get('/api/auth/google', (req, res) => {
  if (!req.session.siteAuth) return res.status(401).send('Unauthorized - login to site first');
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    prompt: 'consent'
  });
  res.redirect(authUrl);
});

// callback بعد از اجازه گوگل
app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send('No code provided');
  try {
    const {tokens} = await oAuth2Client.getToken(code);
    // ذخیره توکن در session (برای نمونه). در production ذخیره امن در DB رمزنگاری‌شده انجام شود.
    req.session.tokens = tokens;
    req.session.oauthDone = true;
    // redirect به صفحهٔ اصلی یا پنل
    res.redirect('/');
  } catch (err) {
    console.error('OAuth error', err);
    res.send('خطا در دریافت توکن');
  }
});

// خواندن ایمیل‌ها (protected)
app.get('/api/emails', async (req, res) => {
  if (!req.session.siteAuth) return res.status(401).json({error:'not site auth'});
  if (!req.session.tokens) return res.status(401).json({error:'not oauth'});

  try {
    oAuth2Client.setCredentials(req.session.tokens);

    // لیست پیام‌ها (IDs)
    const listRes = await gmail.users.messages.list({ userId: 'me', maxResults: 10 });
    const msgs = listRes.data.messages || [];

    const results = [];
    for (const m of msgs) {
      const msg = await gmail.users.messages.get({ userId: 'me', id: m.id, format: 'metadata', metadataHeaders: ['From','Subject','Date']});
      const headers = msg.data.payload.headers || [];
      const subject = headers.find(h => h.name==='Subject')?.value || '';
      const from = headers.find(h => h.name==='From')?.value || '';
      const date = headers.find(h => h.name==='Date')?.value || '';
      results.push({ id: m.id, subject, from, date });
    }
    res.json({ messages: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch emails', detail: err.message });
  }
});

// ساده: پاک کردن توکن (در صورت نیاز)
app.post('/api/revoke', (req, res) => {
  req.session.tokens = null;
  req.session.oauthDone = false;
  res.json({ok:true});
});

// اجرا
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
