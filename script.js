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

/* ENTER FIX (required for GitHub audio) */
DOM.overlay.addEventListener("click", () => {
DOM.overlay.style.display = "none";
startMusic();
connectLanyard();
updateViews();
});

/* MUSIC FIX */
function startMusic(){
DOM.music.volume = 0;
DOM.music.play().catch(()=>{});
let v = 0;
let fade = setInterval(()=>{
v += 0.02;
DOM.music.volume = v;
if(v >= 0.2) clearInterval(fade);
},100);
}

/* TYPE */
let typing;
function typeText(el, text){
clearTimeout(typing);
el.innerText="";
let i=0;
(function t(){
if(i<text.length){
el.innerText += text[i++];
typing=setTimeout(t,40);
}
})();
}

/* VIEWS (GitHub safe) */
async function updateViews(){
try{
const res = await fetch("https://api.counterapi.dev/v1/dre_site/views/up");
const data = await res.json();
DOM.views.innerText = data.value.toLocaleString();
}catch{
DOM.views.innerText = "1";
}
}

/* UI */
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

/* name */
const name = u.global_name || u.username || "dwep";
typeText(DOM.name, name);
typeText(DOM.cardName, name);
DOM.username.innerText = "@"+u.username;

/* status */
DOM.status.className = "status-dot "+(d.discord_status || "offline");

/* decoration FIX */
if(u.avatar_decoration_data){
const asset = u.avatar_decoration_data.asset;
const url1 = `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?${Date.now()}`;
const url2 = `https://cdn.discordapp.com/avatar-decorations/${asset}.png?${Date.now()}`;

DOM.decoration.onerror = ()=>DOM.decoration.src = url2;
DOM.decoration.src = url1;
DOM.decoration.style.display="block";
}else{
DOM.decoration.style.display="none";
}

/* custom status */
const custom = d.activities?.find(a=>a.type===4);
if(custom){
DOM.note.innerText = custom.state;
DOM.noteSection.style.display="block";
}else{
DOM.noteSection.style.display="none";
}
}

/* LANYARD */
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

ws.onerror = ()=>{};
ws.onclose = ()=>setTimeout(connectLanyard,5000);
}
