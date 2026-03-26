export async function fireAlert(coords, triggerType = "stealth-long-press") {
  try {
    // Generate/retrieve a persistent victim ID for the hackathon session
    let victimId = localStorage.getItem("ankurah_victim_id");
    if (!victimId) {
      victimId = `anonymous-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("ankurah_victim_id", victimId);
    }

    const payload = {
      user_id: victimId,
      lat: coords?.lat || 12.9716, // Mock GPS (Bengaluru)
      lng: coords?.lng || 77.5946,
      timestamp: new Date().toISOString(),
      trigger: triggerType
    };

    // The backend endpoint created in Step 411
    const endpoint = "/api/distress";
    
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(() => {}); // Ssh... it's a silent alert

    console.log(`[ANKURAH] Silent SOS sent via ${triggerType}`);
  } catch (err) {
    // Never crash the "Flashlight"
  }
}
