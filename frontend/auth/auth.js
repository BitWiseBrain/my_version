const BACKEND_URL = "http://localhost:8000";

function showForm(type) {
    document.getElementById('selection').style.display = 'none';
    document.getElementById('back-btn').style.display = 'inline-block';
    if(type === 'police') {
        document.getElementById('police-form').classList.add('active');
    }
}

function startVictimFlow() {
    document.getElementById('selection').style.display = 'none';
    document.getElementById('back-btn').style.display = 'inline-block';
    document.getElementById('victim-phone-step').classList.add('active');
}

function sendOTP() {
    const phone = document.getElementById('v-phone').value.trim();
    if(!phone) return;

    document.getElementById('victim-phone-step').classList.remove('active');
    document.getElementById('otp-spinner').classList.add('show');

    // MOCK OTP logic
    setTimeout(() => {
        document.getElementById('otp-spinner').classList.remove('show');
        document.getElementById('victim-otp-step').classList.add('active');
    }, 1500);
}

function resetForms() {
    document.querySelectorAll('.form-section').forEach(el => el.classList.remove('active'));
    document.getElementById('otp-spinner').classList.remove('show');
    document.getElementById('selection').style.display = '';
    document.getElementById('back-btn').style.display = 'none';
    document.getElementById('error').style.display = 'none';
}

async function login(type) {
    const errorEl = document.getElementById('error');
    const loadingBtn = document.querySelector('.active button');
    const origText = loadingBtn.innerText;
    
    errorEl.style.display = 'none';
    loadingBtn.innerText = "Verifying...";
    loadingBtn.disabled = true;

    let url = "";
    let payload = {};

    if(type === 'victim') {
        url = `${BACKEND_URL}/auth/victim`;
        payload = {
            phone: document.getElementById('v-phone').value,
            otp: document.getElementById('v-otp').value
        };
    } else {
        url = `${BACKEND_URL}/auth/police`;
        payload = {
            badge_id: document.getElementById('p-badge').value,
            password: document.getElementById('p-pass').value
        };
    }

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if(res.ok) {
            localStorage.setItem("ankurah_token", data.token);
            if(type === 'victim') {
                localStorage.setItem("ankurah_phone", payload.phone);
                // First-time or existing? Check if name exists
                const pRes = await fetch(`${BACKEND_URL}/api/victims/${payload.phone}`, {
                    headers: { 'Authorization': `Bearer ${data.token}` }
                });
                if(pRes.status === 404) {
                    window.location.href = "/victim/setup.html"; // Profile setup
                } else {
                    window.location.href = "/victim/home.html"; // Disguised companion screen
                }
            } else {
                window.location.href = "/police/dashboard.html";
            }
        } else {
            errorEl.innerText = data.detail || "Login failed";
            errorEl.style.display = 'block';
            loadingBtn.innerText = origText;
            loadingBtn.disabled = false;
        }
    } catch(e) {
        errorEl.innerText = "Network Error";
        errorEl.style.display = 'block';
        loadingBtn.innerText = origText;
        loadingBtn.disabled = false;
    }
}
