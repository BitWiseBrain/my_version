const BACKEND_URL = "http://localhost:8000";

// --- Permanent Storage & Auth ---
const storage = {
    get: (key) => localStorage.getItem(key),
    set: (key, val) => localStorage.setItem(key, val),
    token: () => localStorage.getItem("ankurah_v_token")
};

// --- SOS Logic ---
const sos = {
    isCooldown: false,
    
    trigger: async (type) => {
        if (sos.isCooldown) return;
        sos.isCooldown = true;
        setTimeout(() => sos.isCooldown = false, 15000); // 15s cooldown to prevent spam

        // 1. Silent feedback (vibrate)
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

        // 2. Get high-acc location
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const payload = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    timestamp: new Date().toISOString(),
                    trigger_type: type
                };
                await sos.send(payload);
            },
            async (err) => {
                // Fallback / log error
                console.error("SOS location failed", err);
                const payload = { lat: 0, lng: 0, timestamp: new Date().toISOString(), trigger_type: type };
                await sos.send(payload);
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    },

    send: async (payload) => {
        const token = storage.token();
        if (!token) return;

        try {
            const res = await fetch(`${BACKEND_URL}/api/alerts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            
            if (!res.ok) throw new Error("Network send failed");
            console.log("SOS Broadcasted");
        } catch (e) {
            console.log("Pushing to Offline Queue (IndexedDB)");
            sync.queue(payload);
        }
    }
};

// --- Offline Queue (IndexedDB) ---
const sync = {
    db: null,
    init: () => {
        const req = indexedDB.open("AnkurahQueue", 1);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            db.createObjectStore("alerts", { autoIncrement: true });
        };
        req.onsuccess = (e) => sync.db = e.target.result;
    },
    queue: (payload) => {
        if (!sync.db) return;
        const tx = sync.db.transaction("alerts", "readwrite");
        tx.objectStore("alerts").add(payload);
    },
    flush: async () => {
        if (!sync.db || !storage.token()) return;
        const tx = sync.db.transaction("alerts", "readonly");
        const alerts = [];
        const req = tx.objectStore("alerts").openCursor();
        req.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
                alerts.push({ key: cursor.key, val: cursor.value });
                cursor.continue();
            } else {
                sync.performFlush(alerts);
            }
        };
    },
    performFlush: async (alerts) => {
        for (const item of alerts) {
            try {
                const res = await fetch(`${BACKEND_URL}/api/alerts`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${storage.token()}`
                    },
                    body: JSON.stringify(item.val)
                });
                if (res.ok) {
                    const tx = sync.db.transaction("alerts", "readwrite");
                    tx.objectStore("alerts").delete(item.key);
                }
            } catch (e) { break; } // Still offline
        }
    }
};

// --- Registration Flow ---
window.regFlow = {
    check: () => {
        if (!storage.token()) {
            document.getElementById('reg-modal').style.display = 'flex';
        }
    },
    submit: async () => {
        const name = document.getElementById('reg-name').value;
        const phone = document.getElementById('reg-phone').value;
        const contactEls = document.querySelectorAll('.contact-row');
        const contacts = [];
        contactEls.forEach(row => {
            const cName = row.querySelector('.c-name').value;
            const cPhone = row.querySelector('.c-phone').value;
            if (cName && cPhone) contacts.push({ name: cName, phone: cPhone });
        });

        if (!name || !phone || contacts.length === 0) {
            alert("Please complete profile");
            return;
        }

        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/victim/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, emergency_contacts: contacts })
            });
            const data = await res.json();
            if (res.ok) {
                storage.set("ankurah_v_token", data.access_token);
                document.getElementById('reg-modal').style.display = 'none';
            } else {
                alert(data.detail);
            }
        } catch (e) {
            alert("Connection error. Try later.");
        }
    }
};

// --- Gesture Detection ---
let tapCount = 0;
let lastTap = 0;
let longPressTimer;

function initGestures() {
    const btn = document.getElementById('flashlight-btn');
    
    // Triple Tap (Body or Button)
    document.body.addEventListener('click', () => {
        const now = Date.now();
        if (now - lastTap < 500) {
            tapCount++;
        } else {
            tapCount = 1;
        }
        lastTap = now;
        if (tapCount === 3) {
            sos.trigger('triple-tap');
            tapCount = 0;
        }
    });

    // Long Press (Button)
    btn.addEventListener('mousedown', () => {
        longPressTimer = setTimeout(() => {
            sos.trigger('long-press');
        }, 3000);
    });
    btn.addEventListener('mouseup', () => clearTimeout(longPressTimer));
    btn.addEventListener('touchstart', (e) => {
        longPressTimer = setTimeout(() => {
            sos.trigger('long-press');
        }, 3000);
    }, {passive: true});
    btn.addEventListener('touchend', () => clearTimeout(longPressTimer));

    // Shake
    window.addEventListener('devicemotion', (e) => {
        const acc = e.accelerationIncludingGravity;
        if (!acc) return;
        const total = Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2);
        if (total > 30) { // High intensity shake
            sos.trigger('shake');
        }
    });
}

// --- App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('flashlight-btn');
    let isOn = false;

    btn.onclick = (e) => {
        e.stopPropagation(); // don't trigger tap
        isOn = !isOn;
        btn.classList.toggle('on', isOn);
    };

    sync.init();
    regFlow.check();
    initGestures();
    
    // Auto sync on reconnection
    window.addEventListener('online', () => sync.flush());
    setInterval(() => sync.flush(), 60000); // Check every minute anyway
});
