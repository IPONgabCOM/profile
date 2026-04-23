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
  startMusic();
  connectLanyard();
  updateViews();
});

/* MUSIC */
function startMusic() {
  DOM.music.volume = 0;
  DOM.music.play().catch(()=>{});
  let v = 0;
  let fade = setInterval(() => {
    v += 0.03;
    DOM.music.volume = v;
    if (v >= 0.2) clearInterval(fade);
  }, 80);
}

/* 🔥 LOOP TYPE (EVERY 5 SEC) */
function typeLoop(el, text, speed = 30, delay = 5000) {
  function run() {
    el.innerText = "";
    let i = 0;

    function typing() {
      if (i < text.length) {
        el.innerText += text[i++];
        setTimeout(typing, speed);
      } else {
        setTimeout(run, delay);
      }
    }

    typing();
  }

  run();
}

/* VIEWS */
async function updateViews() {
  try {
    const res = await fetch("https://api.counterapi.dev/v1/dre_site/views/up");
    const data = await res.json();
    DOM.views.innerText = data.value.toLocaleString();
  } catch {
    DOM.views.innerText = "1";
  }
}

/* STATUS */
function getStatus(s) {
  switch (s) {
    case "online": return ["Online","online"];
    case "idle": return ["Idle","idle"];
    case "dnd": return ["Do Not Disturb","dnd"];
    default: return ["Offline","offline"];
  }
}

/* UI */
function updateUI(d) {
  if (!d?.discord_user) return;
  const u = d.discord_user;

  if (u.avatar) {
    const url = `https://cdn.discordapp.com/avatars/${DISCORD_ID}/${u.avatar}.${u.avatar.startsWith("a_")?"gif":"png"}`;
    DOM.avatar.src = url;
    DOM.cardAvatar.src = url;
    DOM.favicon.href = url;
  }

  const name = u.global_name || u.username || "dwep";

  typeLoop(DOM.name, name);
  typeLoop(DOM.cardName, name);

  DOM.username.innerText = "@" + u.username;

  const status = d.discord_status || "offline";
  DOM.status.className = "status-dot " + status;

  const [txt, cls] = getStatus(status);
  DOM.statusText.innerText = txt;
  DOM.statusText.className = "status-text " + cls;

  const custom = d.activities?.find(a => a.type === 4);
  if (custom) {
    DOM.note.innerText = custom.state;
    DOM.noteSection.style.display = "block";
  } else {
    DOM.noteSection.style.display = "none";
  }
}

/* LANYARD */
function connectLanyard() {
  const ws = new WebSocket("wss://api.lanyard.rest/socket");

  ws.onopen = () => {
    ws.send(JSON.stringify({
      op: 2,
      d: { subscribe_to_id: DISCORD_ID }
    }));
  };

  ws.onmessage = e => {
    const msg = JSON.parse(e.data);
    if (msg.t === "INIT_STATE" || msg.t === "PRESENCE_UPDATE") {
      updateUI(msg.d);
    }
  };

  ws.onclose = () => setTimeout(connectLanyard, 5000);
}
