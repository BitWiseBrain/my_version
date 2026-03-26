export async function fireAlert(coords) {
  try {
    const payload = {
      camera_id: "VICTIM-APP",
      confidence: 1.0,
      timestamp: new Date().toISOString(),
      lat: coords.lat,
      lng: coords.lng,
      location_name: "Victim App — Live GPS"
    };

    fetch(`${import.meta.env.VITE_BACKEND_URL}/alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {}); // Swallow fetch errors silently

    console.log("[ANKURAH] Silent alert fired");
  } catch (err) {
    // Swallow all errors — never crash torch UI
  }
}
