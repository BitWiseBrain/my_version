const BACKEND_URL = "http://localhost:8000";
const token = localStorage.getItem("ankurah_token");
if (!token) window.location.href = "/auth/login.html";

let allAlerts = {}; 
let markers = {};
let selectedAlertId = null;
let heatmapMode = false;
let heatmapLayer = null;

const map = L.map('map').setView([12.9716, 77.5946], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// ── WebSocket with Auto-Reconnect ──────────────────────────────────────────
const socket = io(BACKEND_URL, {
    query: { token },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000
});

socket.on('connect', () => {
    document.getElementById('error-banner').style.display = 'none';
    document.getElementById('health-dot').classList.remove('error');
    document.getElementById('loading-overlay').style.display = 'none';
    refreshData(); // Re-hydrate on reconnect
});

socket.on('disconnect', () => {
    document.getElementById('error-banner').style.display = 'block';
    document.getElementById('health-dot').classList.add('error');
});

socket.on('distress_alert', (a) => { addAlertUI(a); playBeep(); updateStats(); });
socket.on('distress_status_update', (u) => { 
    if(allAlerts[u.id]) {
        allAlerts[u.id].status = u.status;
        updateItemUI(u.id);
        updateStats();
    }
});

// ── Data Management ─────────────────────────────────────────────────────────
async function refreshData() {
    try {
        const res = await fetch(`${BACKEND_URL}/api/distress/live`, { headers: {'Authorization': `Bearer ${token}`}});
        const data = await res.json();
        data.forEach(a => addAlertUI(a));
        updateStats();
    } catch(e) { showToast("Sync failed"); }
}

async function updateStats() {
    try {
        const res = await fetch(`${BACKEND_URL}/api/stats`);
        const s = await res.json();
        document.getElementById('stat-active').innerText = Object.values(allAlerts).filter(a => a.status === 'active').length;
        document.getElementById('stat-responding').innerText = Object.values(allAlerts).filter(a => a.status === 'responding').length;
        document.getElementById('stat-resolved').innerText = s.resolved;
        document.getElementById('stat-impact').innerText = s.success_rate;
    } catch(e) {}
}

async function getAddress(lat, lng) {
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`);
        const data = await res.json();
        return data.display_name.split(',').slice(0, 2).join(',');
    } catch(e) { return `${lat.toFixed(3)}, ${lng.toFixed(3)}`; }
}

async function addAlertUI(a) {
    if(!allAlerts[a.id]) {
        allAlerts[a.id] = a;
        a.address = await getAddress(a.lat, a.lng);
        const m = L.circleMarker([a.lat, a.lng], { radius: 8, color: '#fff', weight: 2, fillOpacity: 0.9, fillColor: getStatusColor(a.status) }).addTo(map);
        m.on('click', () => showPanel(a.id));
        markers[a.id] = m;
        renderTimeline();
    }
}

function updateItemUI(id) {
    const a = allAlerts[id];
    if(markers[id]) markers[id].setStyle({ fillColor: getStatusColor(a.status) });
    renderTimeline();
    if(selectedAlertId === id) showPanel(id);
}

function getStatusColor(s) {
    return s === 'resolved' ? '#22c55e' : (s === 'responding' ? '#3b82f6' : '#ef4444');
}

function getThreatTooltip(level, score) {
    if(level === 'High') return "Late night + isolated location + rapid trigger sequence";
    if(level === 'Medium') return "Repeat trigger within 10 min from known location";
    return "Single trigger, user within safe zone";
}

function renderTimeline() {
    const list = document.getElementById('timeline-list');
    const sorted = Object.values(allAlerts).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 20);
    list.innerHTML = sorted.map(a => `
        <div class="timeline-item ${selectedAlertId === a.id ? 'active' : ''}" onclick="showPanel('${a.id}')">
            <div class="tm-title">${a.victim_name || 'Camera'}</div>
            <div style="font-size:11px; color:#888;">${new Date(a.timestamp).toLocaleTimeString()} • ${a.address}</div>
            <div class="threat-badge threat-${(a.threat_level||'Medium').toLowerCase()}" style="margin-top:6px;">
                ${a.threat_level || 'Medium'}
                <div class="tooltip">${getThreatTooltip(a.threat_level)}</div>
            </div>
            ${a.in_safe_zone ? '<span style="font-size:10px; color:#d97706; margin-left:8px; font-weight:700;">⚠️ SAFE ZONE</span>' : ''}
        </div>
    `).join('');
}

function showPanel(id) {
    selectedAlertId = id;
    const a = allAlerts[id];
    document.getElementById('victim-panel').classList.add('show');
    document.getElementById('vp-name').innerText = a.victim_name || a.victim_id;
    document.getElementById('vp-threat').innerHTML = `<div class="threat-badge threat-${(a.threat_level||'Medium').toLowerCase()}">${a.threat_level}<div class="tooltip">${getThreatTooltip(a.threat_level)}</div></div>`;
    document.getElementById('vp-status').value = a.status;
    document.getElementById('vp-contacts').innerHTML = a.contacts.map(c => `<div style="font-size:13px; color:#555;">👤 ${c.name}: ${c.phone}</div>`).join('');
    map.flyTo([a.lat, a.lng], 16);
    renderTimeline();
}

async function updateStatusFromPanel() {
    const status = document.getElementById('vp-status').value;
    try {
        await fetch(`${BACKEND_URL}/api/distress/${selectedAlertId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status })
        });
    } catch(e) { showToast("Update failed"); }
}

// ── Heatmap ──────────────────────────────────────────────────────────────────
function toggleLayer(type) {
    if(type === 'heatmap') {
        heatmapMode = true;
        document.getElementById('btn-heatmap').classList.add('active');
        document.getElementById('btn-distress').classList.remove('active');
        Object.values(markers).forEach(m => m.remove());
        const points = Object.values(allAlerts).map(a => [a.lat, a.lng, 1]);
        heatmapLayer = L.heatLayer(points, {radius: 25}).addTo(map);
    } else {
        heatmapMode = false;
        document.getElementById('btn-distress').classList.add('active');
        document.getElementById('btn-heatmap').classList.remove('active');
        if(heatmapLayer) map.removeLayer(heatmapLayer);
        Object.values(markers).forEach(m => m.addTo(map));
    }
}

// ── Health Check ─────────────────────────────────────────────────────────────
setInterval(async () => {
    try {
        const res = await fetch(`${BACKEND_URL}/health`);
        const data = await res.json();
        document.getElementById('health-dot').className = data.db === 'connected' ? 'health-dot' : 'health-dot error';
    } catch(e) { document.getElementById('health-dot').className = 'health-dot error'; }
}, 60000);

function playBeep() { /* Web Audio implementation if needed */ }
function showToast(m) { console.warn(m); }
function logout() { localStorage.clear(); window.location.href = "/auth/login.html"; }
function exportToCSV() { /* Generate CSV from allAlerts */ }
