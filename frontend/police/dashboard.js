const BACKEND_URL = "http://localhost:8000";

// --- State ---
let alerts = [];
let markers = {};
let map;
let heatmapLayer;
let showHeatmap = false;
let currentFilter = 'All';

// --- Auth ---
const token = localStorage.getItem("ankurah_p_token");
if (!token) window.location.href = "login.html";

// --- Maps Init ---
function initMap() {
    map = L.map('map', {
        zoomControl: false,
        attributionControl: false
    }).setView([12.9716, 77.5946], 12);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
}

const getMarkerIcon = (threat, status) => {
    let color = '#238636'; // Green
    if (status === 'active') {
        color = threat > 70 ? '#da3633' : (threat > 40 ? '#d29922' : '#238636');
    }
    
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color:${color}; width:16px; height:16px; border-radius:50%; border:2px solid #fff; ${status === 'active' ? 'box-shadow: 0 0 15px ' + color : ''}" class="${status === 'active' ? 'pulse-red' : ''}"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });
};

// --- Feed Rendering ---
function renderFeed() {
    const list = document.getElementById('alert-feed');
    list.innerHTML = "";

    const filtered = alerts.filter(a => {
        if (currentFilter === 'All') return true;
        if (currentFilter === 'Active') return a.status === 'active';
        if (currentFilter === 'Resolved') return a.status === 'resolved';
        if (currentFilter === 'High Threat') return a.threat_score >= 70;
        return true;
    });

    filtered.forEach(alert => {
        const threatClass = alert.threat_score >= 70 ? 'high' : (alert.threat_score >= 40 ? 'medium' : 'low');
        const card = document.createElement('div');
        card.className = `alert-card ${threatClass}`;
        card.innerHTML = `
            <div class="ac-header">
                <span class="ac-name">${alert.victim_id}</span>
                <span class="ac-time">${new Date(alert.timestamp).toLocaleTimeString()}</span>
            </div>
            <div class="ac-threat ${threatClass}">SCORE: ${alert.threat_score}</div>
            <div class="ac-info">
                <span>📱 ${alert.trigger_type}</span>
                <span>📍 ACTIVE</span>
            </div>
            <div class="ac-addr">${alert.address}</div>
        `;
        card.onclick = () => {
            map.flyTo([alert.lat, alert.lng], 16);
            markers[alert.id].openPopup();
        };
        list.appendChild(card);
    });
}

function updateStats() {
    fetch(`${BACKEND_URL}/api/stats`)
        .then(r => r.json())
        .then(data => {
            document.getElementById('stat-active').innerText = data.active_count;
            document.getElementById('stat-resolved').innerText = data.resolved_today;
            document.getElementById('stat-avg').innerText = data.avg_response_time_minutes + "m";
            document.getElementById('stat-zone').innerText = data.top_zone;
        });
}

// --- Map Markers ---
function updateMarkers() {
    // Clear old markers if needed or just update
    alerts.forEach(alert => {
        if (!markers[alert.id]) {
            const marker = L.marker([alert.lat, alert.lng], { icon: getMarkerIcon(alert.threat_score, alert.status) }).addTo(map);
            
            const content = `
                <div class="p-detail">
                    <h4 style="color:var(--accent-cyan); margin-bottom:10px;">ALERT: ${alert.victim_id}</h4>
                    <div class="p-row"><span class="p-label">Trigger</span><span class="p-val">${alert.trigger_type}</span></div>
                    <div class="p-row"><span class="p-label">Threat Level</span><span class="p-val" style="color:${getStatusColor(alert.threat_score)}">${alert.threat_score}</span></div>
                    <div class="p-row"><span class="p-label">Time</span><span class="p-val">${new Date(alert.timestamp).toLocaleTimeString()}</span></div>
                    <p style="font-size:10px; color:var(--text-muted); margin-top:5px;">${alert.address}</p>
                    <div class="p-btn-row">
                        <button class="p-dispatch">Dispatch</button>
                        ${alert.status === 'active' ? `<button class="p-resolve" onclick="resolveAlert('${alert.id}')">Resolve</button>` : ''}
                    </div>
                </div>
            `;
            marker.bindPopup(content);
            markers[alert.id] = marker;
        } else {
            markers[alert.id].setIcon(getMarkerIcon(alert.threat_score, alert.status));
        }
    });
}

function getStatusColor(score) {
    return score >= 70 ? '#da3633' : (score >= 40 ? '#d29922' : '#238636');
}

async function resolveAlert(id) {
    const res = await fetch(`${BACKEND_URL}/api/alerts/${id}/resolve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
        map.closePopup();
        fetchAlerts(); // Refresh
    }
}

async function fetchAlerts() {
    const res = await fetch(`${BACKEND_URL}/api/alerts`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
        alerts = await res.json();
        renderFeed();
        updateMarkers();
        updateStats();
    }
}

// --- Heatmap ---
function toggleHeatmap() {
    showHeatmap = !showHeatmap;
    document.getElementById('btn-heat').classList.toggle('active', showHeatmap);
    if (showHeatmap) {
        const heatData = alerts.map(a => [a.lat, a.lng, a.threat_score / 100]);
        heatmapLayer = L.heatLayer(heatData, { radius: 25, blur: 15 }).addTo(map);
    } else {
        if (heatmapLayer) map.removeLayer(heatmapLayer);
    }
}

function setFilter(f, btn) {
    currentFilter = f;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderFeed();
}

// --- Socket integration ---
const socket = io(BACKEND_URL);

socket.on('new_alert', (newAlert) => {
    // Add to state
    alerts.unshift(newAlert);
    renderFeed();
    updateMarkers();
    updateStats();
    // Audible cue (very subtle)
    // new Audio('alert.mp3').play();
});

socket.on('alert_resolved', (data) => {
    const a = alerts.find(x => x.id === data.id);
    if (a) {
        a.status = 'resolved';
        renderFeed();
        updateMarkers();
        updateStats();
    }
});

function centerOnCommand() {
    map.flyTo([12.9716, 77.5946], 13);
}

function logout() {
    localStorage.removeItem("ankurah_p_token");
    window.location.href = "login.html";
}

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    fetchAlerts();
    setInterval(updateStats, 30000); // Polling fallback for stats
});
