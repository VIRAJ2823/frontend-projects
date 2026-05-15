/* ── STATE ── */
const S = { currentUser:null, users:[], friends:[], rooms:[], daresAccepted:0 };
const AVS = ['😊','🌸','🔥','⚡','🎨','🌊','🌿','🎭','🏄','🦋'];
const RCV  = ['rc-1','rc-2','rc-3','rc-4'];
const REMS = ['🎤','🌊','🎨','🧘','🏆','🔥','⚡','🌿'];
let activeTab = 'live';
let currentScreen = 's-landing';

/* ── NAV ── */
function go(id) {
  document.getElementById(currentScreen)?.classList.remove('active');
  document.getElementById(id)?.classList.add('active');
  currentScreen = id;
  window.scrollTo(0,0);
}

function switchTab(id, el, label) {
  if (id === currentScreen) return;
  document.getElementById(currentScreen)?.classList.remove('active');
  document.getElementById(id)?.classList.add('active');
  currentScreen = id;
  window.scrollTo(0,0);
  // Sync bottom nav in new screen
  const scr = document.getElementById(id);
  if (scr) {
    scr.querySelectorAll('.nav-item').forEach(n => {
      const lbl = n.querySelector('.nav-label')?.textContent;
      n.classList.toggle('active', lbl === label);
    });
  }
  if (id === 's-profile') renderProfile();
  if (id === 's-admin')   renderAdmin();
  // update avatar in all topbars
  updateAvatars();
}

function updateAvatars() {
  const av = S.currentUser?.avatar || '😊';
  document.querySelectorAll('.topbar-avatar').forEach(el => el.textContent = av);
  const homeAv = document.getElementById('home-av');
  if (homeAv) homeAv.textContent = av;
}

/* ── AUTH ── */
function adminLogin(e) {
  ripple(e);
  const em = v('al-email'), pw = v('al-pass'), cd = v('al-code');
  if (!em||!pw||!cd) { showToast('Please fill all fields'); return; }
  showToast('Verifying…');
  setTimeout(() => { go('s-admin'); renderAdmin(); }, 700);
}

function userLogin(e) {
  ripple(e);
  const em = v('ul-email'), pw = v('ul-pass');
  if (!em||!pw) { showToast('Please enter email and password'); return; }
  let user = S.users.find(u => u.email === em);
  if (!user) {
    user = { name: em.split('@')[0], handle:'@'+em.split('@')[0].replace(/\W/g,'').toLowerCase(), email:em, avatar:AVS[Math.floor(Math.random()*AVS.length)], joinedAt:new Date().toLocaleDateString() };
    S.users.push(user);
  }
  S.currentUser = user;
  showToast('Welcome back! 🌸');
  setTimeout(() => { go('s-home'); updateHomeGreeting(); updateAvatars(); }, 700);
}

function signupDone(e) {
  ripple(e);
  const fn=v('su-fn'), ln=v('su-ln'), un=v('su-un'), em=v('su-em'), pw=v('su-pw');
  if (!fn||!un||!em||!pw) { showToast('Please fill all required fields'); return; }
  const user = { name:`${fn} ${ln}`.trim(), handle:un.startsWith('@')?un:'@'+un, email:em, avatar:AVS[Math.floor(Math.random()*AVS.length)], joinedAt:new Date().toLocaleDateString() };
  S.users.push(user);
  S.currentUser = user;
  showToast('Account created! Welcome 🎉');
  setTimeout(() => { go('s-home'); updateHomeGreeting(); updateAvatars(); }, 800);
}

function logOut() {
  S.currentUser = null;
  showToast('Signed out. See you soon!');
  setTimeout(() => go('s-landing'), 700);
}

/* ── HOME ── */
function updateHomeGreeting() {
  const u = S.currentUser; if(!u) return;
  const hr = new Date().getHours();
  const g = hr<12?'Good morning':hr<17?'Good afternoon':'Good evening';
  const el = document.getElementById('home-greet');
  if (el) el.innerHTML = `${g}, ${u.name} 🌸`;
  const sub = document.getElementById('home-sub');
  if (sub) sub.textContent = 'Your dares are waiting for you';
  updateAvatars();
  renderHomeDares();
}

/* ── FRIENDS ── */
function addFriend(e) {
  ripple(e);
  const inp = document.getElementById('af-input');
  const val = inp.value.trim();
  if (!val) { showToast('Enter a username or email'); return; }
  if (S.friends.find(f=>f.handle===val||f.name===val)) { showToast('Already in your list'); return; }
  const h = val.startsWith('@')?val:'@'+val.replace('@','');
  S.friends.push({ name:val.replace('@',''), handle:h, status:'pending', avatar:AVS[Math.floor(Math.random()*AVS.length)] });
  inp.value = '';
  renderFriends();
  updateStories();
  showToast('Friend request sent! 📩');
}

function filterFriends() {
  renderFriends(document.getElementById('f-search').value.toLowerCase());
}

function toggleFollow(h) {
  const f = S.friends.find(x=>x.handle===h); if(!f) return;
  f.status = f.status==='following'?'pending':'following';
  renderFriends();
  updateStories();
  showToast(f.status==='following'?'Now following 🌸':'Unfollowed');
}

function renderFriends(q='') {
  const following = S.friends.filter(f=>f.status==='following'&&f.name.toLowerCase().includes(q));
  const pending   = S.friends.filter(f=>f.status==='pending'&&f.name.toLowerCase().includes(q));
  const cnt = document.getElementById('f-count');
  if (cnt) cnt.textContent = following.length+' friend'+(following.length!==1?'s':'');

  const fl = document.getElementById('friends-list');
  fl.innerHTML = following.length===0
    ? `<div class="empty-state"><div class="empty-icon">👥</div><div class="empty-title">No friends yet</div><div class="empty-sub">Add friends using the form above.</div></div>`
    : following.map(f=>`
      <div class="friend-row">
        <div class="friend-av">${f.avatar}</div>
        <div class="friend-info"><div class="friend-name">${f.name}</div><div class="friend-handle">${f.handle}</div></div>
        <button class="f-btn f-following" onclick="toggleFollow('${f.handle}')">Following</button>
      </div>`).join('');

  const pl = document.getElementById('pending-list');
  pl.innerHTML = pending.length===0
    ? `<div class="empty-state" style="padding:24px;"><div class="empty-sub" style="font-size:0.83rem;">No pending requests.</div></div>`
    : pending.map(f=>`
      <div class="friend-row">
        <div class="friend-av">${f.avatar}</div>
        <div class="friend-info"><div class="friend-name">${f.name}</div><div class="friend-handle">${f.handle} · Request sent</div></div>
        <button class="f-btn f-follow" onclick="toggleFollow('${f.handle}')">Accept</button>
      </div>`).join('');
}

function updateStories() {
  const row  = document.getElementById('stories-row');
  const hint = document.getElementById('stories-hint');
  const following = S.friends.filter(f=>f.status==='following');
  // keep "Your Story" item
  const base = `<div class="story-item" onclick="showToast('Share your story!')">
    <div class="story-ring" style="background:linear-gradient(135deg,#ddd,#bbb);"><div class="story-inner" style="font-size:1.6rem;">➕</div></div>
    <div class="story-label">Your Story</div></div>`;
  const items = following.map(f=>`
    <div class="story-item">
      <div class="story-ring"><div class="story-inner">${f.avatar}</div></div>
      <div class="story-label">${f.name.split(' ')[0]}</div>
    </div>`).join('');
  row.innerHTML = base + items;
  if (hint) hint.style.display = following.length===0?'block':'none';
}

/* ── ROOMS ── */
function createRoom(e) {
  ripple(e);
  const name=v('r-name'); if(!name){showToast('Room name is required');return;}
  const room = {
    id:Date.now(), name, desc:v('r-desc'), cat:v('r-cat'),
    max:v('r-max')||'∞', owner:S.currentUser?.name||'You',
    createdAt:new Date().toLocaleDateString(), live:true, participants:1,
    emoji:REMS[Math.floor(Math.random()*REMS.length)]
  };
  S.rooms.push(room);
  ['r-name','r-desc','r-cat','r-max'].forEach(id=>{ const el=document.getElementById(id); if(el)el.value=''; });
  renderRooms(); renderAdmin();
  showToast('Room created! 🚪 Go live!');
}

function roomTab(el, tab) {
  document.querySelectorAll('#s-rooms .room-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active'); activeTab=tab; renderRooms();
}

function joinRoom(id) {
  const r=S.rooms.find(x=>x.id===id); if(r) r.participants=(r.participants||1)+1;
  S.daresAccepted++; renderRooms(); renderProfile(); renderAdmin();
  showToast('Joined room! 🚪');
}

function renderRooms() {
  const grid=document.getElementById('rooms-grid'); if(!grid) return;
  let list = S.rooms;
  if (activeTab==='live')     list=S.rooms.filter(r=>r.live);
  if (activeTab==='upcoming') list=S.rooms.filter(r=>!r.live);
  if (activeTab==='mine')     list=S.rooms.filter(r=>r.owner===S.currentUser?.name);

  if (list.length===0) {
    grid.innerHTML=`<div class="empty-state" style="grid-column:1/-1;"><div class="empty-icon">🚪</div><div class="empty-title">No rooms here</div><div class="empty-sub">Create a room above to get started.</div></div>`;
    return;
  }
  grid.innerHTML=list.map((r,i)=>`
    <div class="room-card">
      <div class="room-cover ${RCV[i%4]}">${r.emoji}</div>
      <div class="room-body">
        <div class="room-name">${r.name}</div>
        <div class="room-desc">${r.desc||'No description.'}</div>
        <div class="room-foot">
          <div>${r.live?`<span class="live-pill"><span class="live-dot"></span>LIVE</span>`:
            `<span class="badge badge-warm">Upcoming</span>`}
            ${r.cat?`<span style="color:var(--text3);font-size:0.72rem;margin-left:8px;">${r.cat}</span>`:''}</div>
          <span class="room-cnt">👤 ${r.participants}/${r.max}</span>
        </div>
        <button class="btn btn-primary btn-sm btn-full" onclick="joinRoom(${r.id})">Join Room</button>
      </div>
    </div>`).join('');
}

/* ── PROFILE ── */
function renderProfile() {
  const u=S.currentUser; if(!u) return;
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  set('p-av', u.avatar||'😊');
  set('p-name', u.name||'Your Name');
  set('p-handle', u.handle||'@yourhandle');
  set('ps-dares', S.daresAccepted);
  set('ps-followers', S.friends.filter(f=>f.status==='following').length);
  set('ps-following', S.friends.filter(f=>f.status==='following').length);
  const en=document.getElementById('e-name'); if(en&&!en.value) en.value=u.name||'';

  const bw=document.getElementById('badges-wrap');
  const badges=[];
  if(S.daresAccepted>=1)  badges.push({i:'⚡',l:'First Dare',c:'badge-coral'});
  if(S.daresAccepted>=5)  badges.push({i:'🔥',l:'Dare Streak ×5',c:'badge-coral'});
  if(S.friends.filter(f=>f.status==='following').length>=1) badges.push({i:'🌸',l:'Connected',c:'badge-peach'});
  if(S.rooms.filter(r=>r.owner===u.name).length>=1) badges.push({i:'🚪',l:'Room Creator',c:'badge-warm'});
  bw.innerHTML=badges.length
    ? badges.map(b=>`<span class="badge ${b.c}">${b.i} ${b.l}</span>`).join('')
    : `<span style="color:var(--text3);font-size:0.85rem;font-weight:300;">Complete dares to earn badges. Your first badge is one dare away! ⚡</span>`;
}

function saveProfile(e) {
  ripple(e);
  const name=document.getElementById('e-name')?.value.trim();
  if(!name){showToast('Name cannot be empty');return;}
  if(S.currentUser){ S.currentUser.name=name; renderProfile(); updateHomeGreeting(); updateAvatars(); showToast('Profile saved ✓'); }
}

/* ── ADMIN ── */
function renderAdmin() {
  const s=(id,val)=>{const el=document.getElementById(id);if(el)el.textContent=val;};
  s('kpi-u',S.users.length); s('kpi-r',S.rooms.length);
  s('kpi-d',S.daresAccepted); s('kpi-c',S.friends.filter(f=>f.status==='following').length);

  // populate Send To dropdown
  const sdTo = document.getElementById('sd-to');
  if (sdTo) {
    const prev = sdTo.value;
    sdTo.innerHTML = `<option value="all">📢 All Users</option>` +
      S.users.map(u=>`<option value="${u.email}">${u.avatar} ${u.name} (${u.handle})</option>`).join('');
    sdTo.value = prev || 'all';
  }

  const ub=document.getElementById('a-users');
  ub.innerHTML=S.users.length===0
    ? `<div style="padding:40px;text-align:center;color:var(--text3);font-size:0.85rem;">No users yet.</div>`
    : S.users.map(u=>`<div class="t-row"><div><div class="t-name">${u.avatar} ${u.name}</div></div><div><div class="t-cell">${u.email}</div></div><div><div class="t-cell">${u.joinedAt||'—'}</div></div><div><span class="badge badge-green">Active</span></div></div>`).join('');

  const rb=document.getElementById('a-rooms');
  rb.innerHTML=S.rooms.length===0
    ? `<div style="padding:40px;text-align:center;color:var(--text3);font-size:0.85rem;">No rooms yet.</div>`
    : S.rooms.map(r=>`<div class="t-row"><div><div class="t-name">${r.emoji} ${r.name}</div></div><div><div class="t-cell">${r.cat||'General'}</div></div><div><div class="t-cell">${r.max}</div></div><div><span class="badge ${r.live?'badge-green':'badge-warm'}">${r.live?'Live':'Upcoming'}</span></div></div>`).join('');
}

/* ── SEND DARE ── */
const S_dares = []; // sent dares log

function sendDare(e) {
  ripple(e);
  const title = v('sd-title');
  const desc  = v('sd-desc');
  const cat   = v('sd-cat');
  const diff  = v('sd-diff');
  const to    = document.getElementById('sd-to')?.value || 'all';

  if (!title) { showToast('Please enter a dare title'); return; }

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) + ' · ' + now.toLocaleDateString();

  const dare = { id: Date.now(), title, desc, cat, diff, to, sentAt: timeStr };
  S_dares.unshift(dare);

  // Inject dare into the matching user's home screen
  const targets = to === 'all' ? S.users : S.users.filter(u => u.email === to);
  targets.forEach(u => {
    if (!u.inboxDares) u.inboxDares = [];
    u.inboxDares.unshift({ ...dare });
  });

  // If logged-in user is one of the targets, show dare on Home instantly
  if (S.currentUser) {
    const isTarget = to === 'all' || S.currentUser.email === to;
    if (isTarget) renderHomeDares();
  }

  // Clear fields
  ['sd-title','sd-desc','sd-cat','sd-diff'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});

  renderDareLog();
  const toLabel = to === 'all' ? 'all users' : targets[0]?.name || to;
  showToast(`Dare sent to ${toLabel}! ⚡`);
}

function renderDareLog() {
  const log = document.getElementById('sd-log-list');
  if (!log) return;
  if (S_dares.length === 0) {
    log.innerHTML = `<div style="color:var(--text3);font-size:0.83rem;font-weight:300;text-align:center;padding:24px 0;">No dares sent yet.</div>`;
    return;
  }
  const diffColor = { 'Easy 🟢':'#40a060', 'Medium 🟡':'#c07020', 'Hard 🔴':'#c03030', 'Legendary 🔥':'var(--c1)' };
  log.innerHTML = S_dares.map(d => `
    <div class="dare-log-item">
      <div class="dli-head">
        <div class="dli-title">${d.title}</div>
        ${d.cat ? `<span class="dli-cat">${d.cat}</span>` : ''}
      </div>
      ${d.desc ? `<div class="dli-desc">${d.desc}</div>` : ''}
      ${d.diff ? `<div class="dli-diff" style="color:${diffColor[d.diff]||'var(--text3)'};">● ${d.diff}</div>` : ''}
      <div class="dli-foot" style="margin-top:8px;">
        <span class="dli-to">→ ${d.to === 'all' ? '📢 All Users' : '👤 '+( S.users.find(u=>u.email===d.to)?.name || d.to )}</span>
        <span class="dli-time">${d.sentAt}</span>
      </div>
    </div>`).join('');
}

function renderHomeDares() {
  const grid = document.getElementById('dare-grid');
  if (!grid || !S.currentUser) return;
  const inbox = S.currentUser.inboxDares || [];
  if (inbox.length === 0) {
    grid.innerHTML = `<div class="dare-empty"><div class="de-i">⚡</div><div class="de-t">No dares yet.<br/>Join a room or get challenged by a friend to see dares here.</div></div>`;
    return;
  }
  const covers = ['dc-1','dc-2','dc-3'];
  const emojis = ['⚡','🔥','🎯','🌊','🎨','🏆'];
  grid.innerHTML = inbox.map((d,i) => `
    <div class="dare-card">
      <div class="dare-cover ${covers[i%3]}">${emojis[i%emojis.length]}
        ${d.cat ? `<div class="dare-pill">${d.cat}</div>` : ''}
      </div>
      <div class="dare-body">
        <div class="dare-title">${d.title}</div>
        <div class="dare-meta">${d.desc || 'From Admin · Accept the challenge!'} ${d.diff?'· '+d.diff:''}</div>
        <div class="dare-btns">
          <button class="dare-accept" onclick="acceptDare(${d.id},this)">I Dare ⚡</button>
          <button class="dare-skip"   onclick="skipDare(${d.id},this)">Skip</button>
        </div>
      </div>
    </div>`).join('');
}

function acceptDare(id, btn) {
  S.daresAccepted++;
  // Remove from inbox
  if (S.currentUser?.inboxDares) S.currentUser.inboxDares = S.currentUser.inboxDares.filter(d=>d.id!==id);
  renderHomeDares();
  renderAdmin();
  showToast('Dare accepted! 🔥 You got this!');
}

function skipDare(id, btn) {
  if (S.currentUser?.inboxDares) S.currentUser.inboxDares = S.currentUser.inboxDares.filter(d=>d.id!==id);
  renderHomeDares();
  showToast('Dare skipped.');
}

/* ── UTILS ── */
function v(id) { return document.getElementById(id)?.value.trim()||''; }

function showToast(msg) {
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('show'),2400);
}

function ripple(e) {
  const btn=e.currentTarget;
  const r=document.createElement('div'); r.className='rip';
  const rect=btn.getBoundingClientRect(), sz=Math.max(rect.width,rect.height)*2;
  r.style.cssText=`width:${sz}px;height:${sz}px;left:${e.clientX-rect.left-sz/2}px;top:${e.clientY-rect.top-sz/2}px;position:absolute;`;
  btn.style.position='relative'; btn.appendChild(r);
  setTimeout(()=>r.remove(),600);
}

document.querySelectorAll('.btn').forEach(b=>b.addEventListener('click',e=>ripple(e)));