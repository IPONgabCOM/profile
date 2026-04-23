const DISCORD_ID = "826362723792977950";

const el=id=>document.getElementById(id);

const DOM={
avatar:el("discord-avatar"),
cardAvatar:el("card-avatar"),
decoration:el("discord-decoration"),
name:el("display-name"),
cardName:el("card-name"),
username:el("card-username"),
note:el("discord-note"),
noteSection:el("note-section"),
status:el("status-dot"),
views:el("view-count"),
music:el("bg-music"),
overlay:el("overlay"),
favicon:el("dynamic-favicon")
};

/* TYPE EFFECT */
let typing;
function typeText(el,text){
clearTimeout(typing);
el.innerText="";
let i=0;
function t(){
if(i<text.length){
el.innerText+=text[i++];
typing=setTimeout(t,40);
}}
t();
}

/* ENTER */
function enterSite(){
DOM.overlay.classList.add("hidden");

/* music */
DOM.music.volume=0;
DOM.music.play().catch(()=>{});
let v=0;
let fade=setInterval(()=>{
v+=0.02;
DOM.music.volume=v;
if(v>=0.2) clearInterval(fade);
},100);

/* load systems */
connectLanyard();
updateViews();
}

/* VIEW COUNTER (REAL FIX) */
async function updateViews(){
try{
const res = await fetch(`https://api.counterapi.dev/v1/dre_profile_${DISCORD_ID}/up`);
const data = await res.json();
DOM.views.innerText = data.value.toLocaleString();
}catch{
DOM.views.innerText="0";
}
}

/* UPDATE UI */
function updateUI(d){
if(!d||!d.discord_user) return;
const u=d.discord_user;

/* avatar */
if(u.avatar){
const url=`https://cdn.discordapp.com/avatars/${DISCORD_ID}/${u.avatar}.${u.avatar.startsWith("a_")?"gif":"png"}`;
DOM.avatar.src=url;
DOM.cardAvatar.src=url;
DOM.favicon.href=url;
}

/* name */
const name=u.global_name||u.username||"dwep";
typeText(DOM.name,name);
typeText(DOM.cardName,name);
DOM.username.innerText="@"+u.username;

/* status */
DOM.status.className="status-dot "+d.discord_status;

/* decoration */
if(u.avatar_decoration_data){
const asset=u.avatar_decoration_data.asset;
const url1=`https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?${Date.now()}`;
const url2=`https://cdn.discordapp.com/avatar-decorations/${asset}.png?${Date.now()}`;

DOM.decoration.onerror=()=>DOM.decoration.src=url2;
DOM.decoration.src=url1;
DOM.decoration.style.display="block";
}else DOM.decoration.style.display="none";

/* note */
const custom=d.activities?.find(a=>a.type===4);
if(custom){
DOM.note.innerText=custom.state;
DOM.noteSection.style.display="block";
}else DOM.noteSection.style.display="none";
}

/* LANYARD */
function connectLanyard(){
const ws=new WebSocket("wss://api.lanyard.rest/socket");

ws.onopen=()=>{
ws.send(JSON.stringify({
op:2,
d:{subscribe_to_id:DISCORD_ID}
}));
};

ws.onmessage=(e)=>{
const msg=JSON.parse(e.data);
if(msg.t==="INIT_STATE"||msg.t==="PRESENCE_UPDATE"){
updateUI(msg.d);
}
};

ws.onclose=()=>setTimeout(connectLanyard,5000);
}
