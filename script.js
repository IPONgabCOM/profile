const DISCORD_ID = "826362723792977950";

const $ = id => document.getElementById(id);

const DOM = {
  avatar: $("discord-avatar"),
  cardAvatar: $("card-avatar"),
  decoration: $("discord-decoration"),
  name: $("display-name"),
  cardName: $("card-name"),
  username: $("card-username"),
  status: $("status-dot"),
  statusText: $("card-status-text"),
  note: $("discord-note"),
  noteSection: $("note-section"),
  views: $("view-count"),
  music: $("bg-music"),
  overlay: $("overlay"),
  favicon: $("dynamic-favicon")
};

/* ENTER */
DOM.overlay.addEventListener("click", () => {
  DOM.overlay.style.display = "none";
  DOM.music.play().catch(()=>{});
  connectLanyard();
  updateViews();
});

/* VIEWS */
async function updateViews(){
  try {
    const r = await fetch("https://api.counterapi.dev/v1/dre_site/views/up");
    const d = await r.json();
    DOM.views.innerText = d.value.toLocaleString();
  } catch {
    DOM.views.innerText = "1";
  }
}

/* TYPE */
function type(el,text){
  if(!el) return;
  el.innerText="";
  let i=0;
  (function go(){
    if(i<text.length){
      el.innerText+=text[i++];
      setTimeout(go,30);
    }
  })();
}

/* STATUS */
function getStatus(s){
  switch(s){
    case "online": return ["Online","online"];
    case "idle": return ["Idle","idle"];
    case "dnd": return ["Do Not Disturb","dnd"];
    default: return ["Offline","offline"];
  }
}

/* UI */
function updateUI(d){
  if(!d?.discord_user) return;

  const u=d.discord_user;

  if(u.avatar){
    const url=`https://cdn.discordapp.com/avatars/${DISCORD_ID}/${u.avatar}.${u.avatar.startsWith("a_")?"gif":"png"}`;
    DOM.avatar.src=url;
    DOM.cardAvatar.src=url;
    DOM.favicon.href=url;
  }

  const name=u.global_name||u.username||"dwep";
  type(DOM.name,name);
  type(DOM.cardName,name);

  DOM.username.innerText="@"+u.username;

  const s=d.discord_status||"offline";
  DOM.status.className="status-dot "+s;

  const [t,c]=getStatus(s);
  DOM.statusText.innerText=t;
  DOM.statusText.className="status-text "+c;

  const custom=d.activities?.find(a=>a.type===4);
  if(custom){
    DOM.note.innerText=custom.state;
    DOM.noteSection.style.display="block";
  }else{
    DOM.noteSection.style.display="none";
  }

  if(u.avatar_decoration_data?.asset){
    const asset=u.avatar_decoration_data.asset;
    DOM.decoration.src=`https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png`;
    DOM.decoration.style.display="block";
  }else{
    DOM.decoration.style.display="none";
  }
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

  ws.onmessage=e=>{
    const m=JSON.parse(e.data);
    if(m.t==="INIT_STATE"||m.t==="PRESENCE_UPDATE"){
      updateUI(m.d);
    }
  };

  ws.onclose=()=>setTimeout(connectLanyard,3000);
}
