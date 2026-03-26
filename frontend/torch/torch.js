const BACKEND_URL = "http://localhost:8000";

let isOn = false;
let wakeLock = null;
let sosCooldownActive = false;
let timeoutTimer = null;
const SOS_COOLDOWN_MS = 30000;

function toggleTorch() {
    isOn = !isOn;
    document.body.classList.toggle('on', isOn);
    document.getElementById('torch-btn').classList.toggle('on', isOn);
    document.getElementById('subtext').innerText = isOn ? "Brightness: Max" : "Brightness: Low";
    handleTap();
    resetTimeout();
}

function resetTimeout() {
    document.getElementById('timeout-overlay').style.display = 'none';
    clearTimeout(timeoutTimer);
    timeoutTimer = setTimeout(() => { if(!isOn) document.getElementById('timeout-overlay').style.display = 'flex'; }, 300000); 
}
resetTimeout();

// ── TAP SOS DETECTOR ────────────────────────────────────────────────────────
let tapCount = 0;
let lastTapTime = 0;
function handleTap() {
    const now = Date.now();
    if(now - lastTapTime > 3000) tapCount = 1;
    else tapCount++;
    lastTapTime = now;
    if(tapCount >= 5) { tapCount = 0; sosTrigger('button'); }
}

// ── SHAKE SOS DETECTOR ──────────────────────────────────────────────────────
let shakeTimes = [];
window.addEventListener('devicemotion', (e) => {
    const { x, y, z } = e.accelerationIncludingGravity || {};
    if(!x) return;
    const mag = Math.sqrt(x*x + y*y + z*z);
    if(mag > 20) {
        const now = Date.now();
        shakeTimes = shakeTimes.filter(t => now - t < 1500);
        if(shakeTimes.length === 0 || now - shakeTimes[shakeTimes.length-1] > 300) shakeTimes.push(now);
        if(shakeTimes.length >= 3) { shakeTimes = []; sosTrigger('shake'); }
    }
});

// ── SOS TRIGGER & OFFLINE QUEUE ─────────────────────────────────────────────
async function sosTrigger(type) {
    if(sosCooldownActive) return;
    sosCooldownActive = true;
    setTimeout(() => { sosCooldownActive = false; }, SOS_COOLDOWN_MS);

    if(navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
    
    // Show confirmation for victim (multilingual 3s overlay)
    showSosConfirmation();

    const token = localStorage.getItem("ankurah_token");
    const loc = await new Promise((res) => {
        navigator.geolocation.getCurrentPosition(
            pos => res({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => res({ lat: 12.9716, lng: 77.5946 }),
            { enableHighAccuracy: true, timeout: 5000 }
        );
    });

    const payload = {
        lat: loc.lat,
        lng: loc.lng,
        timestamp: new Date().toISOString(),
        trigger_type: type,
        contacts_json: localStorage.getItem("ankurah_contacts") || "[]"
    };

    sendDistress(payload, token);
}

function showSosConfirmation() {
    const overlay = document.getElementById('sos-confirmation');
    if(!overlay) return;
    overlay.style.display = 'flex';
    let count = 3;
    const countEl = document.getElementById('sos-count');
    countEl.innerText = count;
    const itv = setInterval(() => {
        count--;
        if(count <= 0) { clearInterval(itv); overlay.style.display = 'none'; }
        else countEl.innerText = count;
    }, 1000);
}

async function sendDistress(payload, token) {
    try {
        const res = await fetch(`${BACKEND_URL}/api/distress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload)
        });
        if(!res.ok) throw new Error("Server error");
        showToast("Signal Sent ✓");
    } catch(e) {
        // Queue it!
        const queue = JSON.parse(localStorage.getItem("ankurah_sos_queue") || "[]");
        queue.push({ payload, token, time: Date.now() });
        localStorage.setItem("ankurah_sos_queue", JSON.stringify(queue));
        showToast("Signal Queued (Offline) ⚠️");
    }
}

// ── Flush Queue ──────────────────────────────────────────────────────────────
async function flushQueue() {
    const queue = JSON.parse(localStorage.getItem("ankurah_sos_queue") || "[]");
    if(queue.length === 0) return;
    
    const remaining = [];
    for(const item of queue) {
        try {
            await fetch(`${BACKEND_URL}/api/distress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${item.token}` },
                body: JSON.stringify(item.payload)
            });
        } catch(e) { remaining.push(item); }
    }
    localStorage.setItem("ankurah_sos_queue", JSON.stringify(remaining));
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
}

// Auto-flush on load and every minute
window.addEventListener('load', flushQueue);
setInterval(flushQueue, 60000);
