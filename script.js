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

// typing effect (fixed, no spam)
let typingTimeout;
function typeText(element, text){
clearTimeout(typingTimeout);
element.innerText="";
let i=0;

function type(){
if(i<text.length){
element.innerText+=text[i++];
typingTimeout=setTimeout(type,40);
}
}
type();
}

// enter
function enterSite(){
DOM.overlay.classList.add("hidden");

DOM.music.volume=0;
DOM.music.play().catch(()=>{});

let v=0;
let fade=setInterval(()=>{
v+=0.02;
DOM.music.volume=v;
if(v>=0.2) clearInterval(fade);
},100);

connectLanyard();
handleViews();
}

// update UI
function updateUI(d){
if(!d || !d.discord_user) return;

const u=d.discord_user;

// avatar
if(u.avatar){
const url=`https://cdn.discordapp.com/avatars/${DISCORD_ID}/${u.avatar}.${u.avatar.startsWith("a_")?"gif":"png"}`;
DOM.avatar.src=url;
DOM.cardAvatar.src=url;
DOM.favicon.href=url;
}

// name
const name=u.global_name||u.username||"dwep";
typeText(DOM.name,name);
typeText(DOM.cardName,name);

DOM.username.innerText="@"+(u.username||"dwep");

// status
DOM.status.className="status-dot "+(d.discord_status||"offline");

// decoration FIX (real working)
if(u.avatar_decoration_data && u.avatar_decoration_data.asset){
const asset=u.avatar_decoration_data.asset;

const url1=`https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?size=160&v=${Date.now()}`;
const url2=`https://cdn.discordapp.com/avatar-decorations/${asset}.png?size=160&v=${Date.now()}`;

DOM.decoration.onload=()=>{
DOM.decoration.style.display="block";
};
DOM.decoration.onerror=()=>{
DOM.decoration.src=url2;
};

DOM.decoration.src=url1;
}else{
DOM.decoration.style.display="none";
}

// custom status
const custom=d.activities?.find(a=>a.type===4);
if(custom && custom.state){
DOM.note.innerText=custom.state;
DOM.noteSection.style.display="block";
}else{
DOM.noteSection.style.display="none";
}
}

// websocket
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

// views
async function handleViews(){
try{
const res=await fetch(`https://api.counterapi.dev/v1/dre_${DISCORD_ID}/visits`);
const data=await res.json();
DOM.views.innerText=data.value;
}catch{
DOM.views.innerText="—";
}
}
