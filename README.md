# Ankurah — AI-Powered Women's Safety Platform

Ankurah is a dual-interface safety system designed for extreme discretion and rapid police response.

## Architecture

- **Victim App ("FlashLite")**: A PWA disguised as a utility flashlight. Hidden SOS triggers (Triple-tap, Shake, Long-press) capture high-accuracy location and alert the police silently. Features offline queueing via IndexedDB.
- **Police Command Center**: A dark-mode ops dashboard with live Leaflet.js map tracking, AI-calculated threat scoring, and Socket.io broadcasts for sub-second alert updates.

## Tech Stack

- **Backend**: FastAPI (Python), Socket.io, SQLite (aiosqlite), JWT (python-jose).
- **Victim Frontend**: Vanilla JS, PWA (Manifest/Service Worker), IndexedDB.
- **Police Frontend**: Vanilla JS, Leaflet.js (dark mapping), Socket.io Client.

## Setup & Running

1. **Install Dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Run Backend**:
   ```bash
   cd backend
   python main.py
   ```
   *Runs on http://localhost:8000*

3. **Access Frontends**:
   - **Victim App**: Open `/frontend/victim/index.html` in a browser. On first launch, register your permanent profile.
   - **Police Dashboard**: Open `/frontend/police/login.html`. 
     - *Default Credentials: Badge `POL101`, Password `password123`*

## Persistence
All user profiles (Victims and Officers) and Alert histories are stored permanently in the `ankurah.db` SQLite file. No "fake demo" data is used.

## AI Threat Scorer
Alerts are scored 1-100 based on:
- Time of Day (+30 for late night)
- Trigger Intent (+20 for frantic shaking)
- Victim History (+25 for repeated rapid distress)
- Geographic Anomaly

---
*Safety. Silently.*
