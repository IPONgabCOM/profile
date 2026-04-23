const DISCORD_ID = "826362723792977950"; 

// Safety: Disable Inspect Element keys
function disableInspect(e) {
    if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74)) || (e.ctrlKey && e.keyCode == 85)) {
        return false;
    }
}

async function updateLanyard() {
    try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
        const { data, success } = await response.json();

        if (success) {
            const user = data.discord_user;

            // 1. Avatar Update
            const avatarBase = `https://cdn.discordapp.com/avatars/${DISCORD_ID}/${user.avatar}`;
            const avatarUrl = user.avatar.startsWith("a_") ? `${avatarBase}.gif` : `${avatarBase}.png`;
            
            // Apply avatar to main card, hover card, AND DYNAMIC FAVICON
            document.getElementById('discord-avatar').src = avatarUrl;
            document.getElementById('card-avatar').src = avatarUrl;
            document.getElementById('dynamic-favicon').href = avatarUrl; // Sets Tab Icon

            // 2. FIXED: Decoration Logic (forces refresh)
            const decoEl = document.getElementById('discord-decoration');
            if (user.avatar_decoration_data) {
                const asset = user.avatar_decoration_data.asset;
                // Add ?v= timestamp to prevent browser from caching a broken version
                decoEl.src = `https://cdn.discordapp.com/avatar-decorations/${asset}.png?v=${Date.now()}`;
                decoEl.style.display = "block";
            } else {
                decoEl.style.display = "none";
            }

            // 3. Note Section Logic (smoother, only updates if text changed)
            const customStatus = data.activities.find(a => a.type === 4);
            const noteSection = document.getElementById('note-section');
            const noteText = document.getElementById('discord-note');

            if (customStatus && customStatus.state) {
                if (noteText.innerText !== customStatus.state) {
                    noteText.innerText = customStatus.state;
                }
                noteSection.style.display = "block";
            } else {
                noteSection.style.display = "none";
            }

            // 4. Names & Presence
            const name = user.global_name || user.username;
            document.getElementById('display-name').innerText = name;
            document.getElementById('card-name').innerText = name;
            document.getElementById('card-username').innerText = `@${user.username}`;
            document.getElementById('discord-link').href = `https://discord.com/users/${DISCORD_ID}`;

            const status = data.discord_status;
            document.getElementById('status-dot').className = `status-dot ${status}`;
            document.getElementById('card-status-dot-small').className = `status-dot-small ${status}`;
        }
    } catch (e) { console.error("Lanyard Error:", e); }
}

async function handleViews() {
    try {
        const res = await fetch(`https://api.counterapi.dev/v1/dre_bio_final_${DISCORD_ID}/update/visits`);
        const data = await res.json();
        document.getElementById('view-count').innerText = data.value.toLocaleString();
    } catch (e) { console.log("Counter offline"); }
}

function enterSite() {
    document.getElementById('overlay').classList.add('hidden');
    document.querySelector('.background-container').style.transform = "scale(1.1)";
    const music = document.getElementById('bg-music');
    music.volume = 0.2;
    music.play();
    
    updateLanyard();
    handleViews();
    setInterval(updateLanyard, 10000); // Check every 10 seconds
}
