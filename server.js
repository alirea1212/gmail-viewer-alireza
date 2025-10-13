// node server.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const {google} = require('googleapis');
const app = express();
app.use(express.json());
app.use(session({ secret: process.env.SESSION_SECRET||'secret', resave:false, saveUninitialized:false }));

// فایل استاتیک: index.html, style.css, script.js در روت پروژه
app.use(express.static(path.join(__dirname)));

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.REDIRECT_URI
);
const gmail = google.gmail({version:'v1', auth: oAuth2Client});

// رمز سایت ساده
app.post('/api/site-login',(req,res)=>{
  const pass = req.body?.pass;
  if (pass === 'علیرضا') { req.session.siteAuth=true; return res.json({ok:true, oauth:!!req.session.tokens}); }
  res.json({ok:false});
});
app.post('/api/site-logout',(req,res)=>{ req.session.destroy(()=>res.json({ok:true})); });

// شروع OAuth
app.get('/api/auth/google',(req,res)=>{
  if (!req.session.siteAuth) return res.status(401).send('login site first');
  const url = oAuth2Client.generateAuthUrl({ access_type:'offline', scope:['https://www.googleapis.com/auth/gmail.readonly'], prompt:'consent' });
  res.redirect(url);
});

// callback
app.get('/oauth2callback', async (req,res)=>{
  const code = req.query.code;
  if (!code) return res.send('no code');
  const {tokens} = await oAuth2Client.getToken(code);
  req.session.tokens = tokens;
  req.session.oauthDone = true;
  res.redirect('/');
});

// خواندن ایمیل‌ها
app.get('/api/emails', async (req,res)=>{
  if (!req.session.siteAuth) return res.status(401).json({error:'site auth'});
  if (!req.session.tokens) return res.status(401).json({error:'oauth missing'});
  oAuth2Client.setCredentials(req.session.tokens);
  const list = await gmail.users.messages.list({userId:'me', maxResults:10});
  const msgs = list.data.messages||[];
  const out = [];
  for (const m of msgs) {
    const msg = await gmail.users.messages.get({userId:'me', id:m.id, format:'metadata', metadataHeaders:['From','Subject','Date']});
    const headers = msg.data.payload.headers || [];
    out.push({
      subject: headers.find(h=>h.name==='Subject')?.value || '',
      from: headers.find(h=>h.name==='From')?.value || '',
      date: headers.find(h=>h.name==='Date')?.value || ''
    });
  }
  res.json({messages: out});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>console.log('http://localhost:'+PORT));
