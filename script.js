const DISCORD_ID = "826362723792977950";

const $ = id => document.getElementById(id);

const DOM = {
avatar: $("discord-avatar"),
cardAvatar: $("card-avatar"),
decoration: $("discord-decoration"),
name: $("display-name"),
cardName: $("card-name"),
username: $("card-username"),
note: $("discord-note"),
noteSection: $("note-section"),
status: $("status-dot"),
views: $("view-count"),
music: $("bg-music"),
overlay: $("overlay"),
favicon: $("dynamic-favicon")
};

/* ---------- ENTER ---------- */
DOM.overlay.addEventListener("click", () => {
DOM.overlay.style.display = "none";
startMusic();
connectLanyard();
updateViews();
});

/* ---------- MUSIC ---------- */
function startMusic(){
DOM.music.volume = 0;
DOM.music.play().catch(()=>{});
let v = 0;
let fade = setInterval(()=>{
v += 0.03;
DOM.music.volume = v;
if(v >= 0.2) clearInterval(fade);
},80);
}

/* ---------- TYPING FIX ---------- */
let lastName = "";
let typingTimeout;

function typeText(el, text, speed = 25){
clearTimeout(typingTimeout);
el.innerText = "";
let i = 0;

function type(){
if(i < text.length){
el.innerText += text[i++];
typingTimeout = setTimeout(type, speed);
}
}
type();
}

/* ---------- VIEWS ---------- */
async function updateViews(){
try{
const res = await fetch("https://api.counterapi.dev/v1/dre_site/views/up");
const data = await res.json();
DOM.views.innerText = data.value.toLocaleString();
}catch{
DOM.views.innerText = "1";
}
}

/* ---------- UI UPDATE ---------- */
function updateUI(d){
if(!d || !d.discord_user) return;
const u = d.discord_user;

/* avatar */
if(u.avatar){
const url = `https://cdn.discordapp.com/avatars/${DISCORD_ID}/${u.avatar}.${u.avatar.startsWith("a_")?"gif":"png"}`;
DOM.avatar.src = url;
DOM.cardAvatar.src = url;
DOM.favicon.href = url;
}

/* ✅ NAME (FIXED - NO LOOP TYPING) */
const name = u.global_name || u.username || "dwep";

if(name !== lastName){
typeText(DOM.name, name, 25);
typeText(DOM.cardName, name, 20);
lastName = name;
}

DOM.username.innerText = "@"+u.username;

/* status */
DOM.status.className = "status-dot "+(d.discord_status || "offline");

/* decoration */
if(u.avatar_decoration_data){
const asset = u.avatar_decoration_data.asset;
const url1 = `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?${Date.now()}`;
const url2 = `https://cdn.discordapp.com/avatar-decorations/${asset}.png?${Date.now()}`;

DOM.decoration.onerror = ()=>DOM.decoration.src = url2;
DOM.decoration.src = url1;
DOM.decoration.style.display = "block";
}else{
DOM.decoration.style.display = "none";
}

/* note */
const custom = d.activities?.find(a=>a.type===4);
if(custom){
DOM.note.innerText = custom.state;
DOM.noteSection.style.display = "block";
}else{
DOM.noteSection.style.display = "none";
}
}

/* ---------- LANYARD ---------- */
function connectLanyard(){
const ws = new WebSocket("wss://api.lanyard.rest/socket");

ws.onopen = ()=>{
ws.send(JSON.stringify({
op:2,
d:{subscribe_to_id:DISCORD_ID}
}));
};

ws.onmessage = (e)=>{
const msg = JSON.parse(e.data);
if(msg.t==="INIT_STATE"||msg.t==="PRESENCE_UPDATE"){
updateUI(msg.d);
}
};

ws.onclose = ()=>setTimeout(connectLanyard,5000);
}
