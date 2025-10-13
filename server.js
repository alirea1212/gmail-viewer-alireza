require('dotenv').config();
const express = require('express');
const session = require('express-session');
const { google } = require('googleapis');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

app.post('/api/site-login', (req,res) => {
  const pass=req.body.pass;
  if(pass==='علیرضا'){ req.session.loggedIn=true; res.json({ok:true, oauth:!!req.session.tokens}); }
  else res.json({ok:false});
});

app.post('/api/site-logout', (req,res) => { req.session.destroy(); res.json({ok:true}); });
app.get('/api/session-status', (req,res)=>{ res.json({loggedIn:!!req.session.loggedIn, oauth:!!req.session.tokens}); });

app.get('/api/auth/google',(req,res)=>{
  if(!req.session.loggedIn) return res.status(401).send('ابتدا وارد شوید');
  const scopes=['https://www.googleapis.com/auth/gmail.readonly'];
  const url=oAuth2Client.generateAuthUrl({access_type:'offline', scope:scopes});
  res.redirect(url);
});

app.get('/oauth2callback', async (req,res)=>{
  const code=req.query.code;
  if(!code) return res.send('کد OAuth نیامده');
  const {tokens}=await oAuth2Client.getToken(code);
  req.session.tokens=tokens;
  oAuth2Client.setCredentials(tokens);
  res.redirect('/');
});

app.get('/api/emails', async (req,res)=>{
  if(!req.session.loggedIn || !req.session.tokens) return res.status(401).send('Not authorized');
  oAuth2Client.setCredentials(req.session.tokens);
  const gmail=google.gmail({version:'v1', auth:oAuth2Client});
  try {
    const list=await gmail.users.messages.list({userId:'me', maxResults:10});
    const messages=[];
    if(!list.data.messages) return res.json({messages:[]});
    for(let m of list.data.messages){
      const msg=await gmail.users.messages.get({userId:'me', id:m.id, format:'metadata', metadataHeaders:['Subject','From','Date']});
      const headers=msg.data.payload.headers;
      const subject=headers.find(h=>h.name==='Subject')?.value||'';
      const from=headers.find(h=>h.name==='From')?.value||'';
      const date=headers.find(h=>h.name==='Date')?.value||'';
      messages.push({subject,from,date});
    }
    res.json({messages});
  } catch(e){ console.error(e); res.status(500).send('خطا در دریافت ایمیل‌ها'); }
});

app.listen(PORT,()=>console.log(`Server running at http://localhost:${PORT}`));
