const DISCORD_ID = "826362723792977950";

/* =========================
   DOM SHORTCUT
========================= */
const $ = (id) => document.getElementById(id);

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

/* =========================
   CLICK TO ENTER
========================= */
DOM.overlay.addEventListener("click", () => {
  DOM.overlay.style.display = "none";

  DOM.music.volume = 0;
  DOM.music.play().catch(() => {});

  fadeMusic();
  connectLanyard();
  updateViews();
});

/* =========================
   MUSIC FADE IN
========================= */
function fadeMusic() {
  let v = 0;
  const fade = setInterval(() => {
    v += 0.03;
    DOM.music.volume = v;
    if (v >= 0.2) clearInterval(fade);
  }, 80);
}

/* =========================
   VIEWS COUNTER
========================= */
async function updateViews() {
  try {
    const res = await fetch("https://api.counterapi.dev/v1/dre_site/views/up");
    const data = await res.json();
    DOM.views.innerText = data.value.toLocaleString();
  } catch {
    DOM.views.innerText = "1";
  }
}

/* =========================
   TYPEWRITER (FIXED NO BUGS)
========================= */
function typeText(el, text, speed = 30) {
  if (!el) return;

  el.innerText = "";
  let i = 0;

  const interval = setInterval(() => {
    el.innerText += text[i++];
    if (i >= text.length) clearInterval(interval);
  }, speed);
}

/* =========================
   STATUS SYSTEM
========================= */
function getStatus(status) {
  switch (status) {
    case "online": return ["Online", "online"];
    case "idle": return ["Idle", "idle"];
    case "dnd": return ["Do Not Disturb", "dnd"];
    default: return ["Offline", "offline"];
  }
}

/* =========================
   UPDATE UI FROM LANYARD
========================= */
function updateUI(data) {
  if (!data?.discord_user) return;

  const u = data.discord_user;

  /* ================= AVATAR ================= */
  if (u.avatar) {
    const url = `https://cdn.discordapp.com/avatars/${DISCORD_ID}/${u.avatar}.${u.avatar.startsWith("a_") ? "gif" : "png"}`;

    DOM.avatar.src = url;
    DOM.cardAvatar.src = url;
    DOM.favicon.href = url;
  }

  /* ================= NAME ================= */
  const name = u.global_name || u.username || "dwep";

  typeText(DOM.name, name);
  typeText(DOM.cardName, name);

  DOM.username.innerText = "@" + u.username;

  /* ================= STATUS ================= */
  const status = data.discord_status || "offline";

  DOM.status.className = "status-dot " + status;

  const [text, cls] = getStatus(status);
  DOM.statusText.innerText = text;
  DOM.statusText.className = "status-text " + cls;

  /* ================= NOTE ================= */
  const custom = data.activities?.find(a => a.type === 4);

  if (custom?.state) {
    DOM.note.innerText = custom.state;
    DOM.noteSection.style.display = "block";
  } else {
    DOM.noteSection.style.display = "none";
  }

  /* ================= DECORATION FIX ================= */
  if (u.avatar_decoration_data?.asset) {
    const asset = u.avatar_decoration_data.asset;

    DOM.decoration.src =
      `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png`;

    DOM.decoration.style.display = "block";
  } else {
    DOM.decoration.style.display = "none";
  }
}

/* =========================
   LANYARD CONNECTION
========================= */
function connectLanyard() {
  const ws = new WebSocket("wss://api.lanyard.rest/socket");

  ws.onopen = () => {
    ws.send(JSON.stringify({
      op: 2,
      d: {
        subscribe_to_id: DISCORD_ID
      }
    }));
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);

      if (msg.t === "INIT_STATE" || msg.t === "PRESENCE_UPDATE") {
        updateUI(msg.d);
      }
    } catch (err) {
      console.log("Lanyard error:", err);
    }
  };

  ws.onclose = () => {
    setTimeout(connectLanyard, 3000);
  };
}
