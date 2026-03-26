import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';

const center = { lat: 12.9716, lng: 77.5946 };

export default function AlertMap({ alerts = [] }) {
  // Safe Array normalization
  const safeAlerts = Array.isArray(alerts) ? alerts : [];

  const apiKey = import.meta.env.VITE_GMAPS_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || ""
  });

  // Handle case where apiKey is missing or Google fails to load
  if (!apiKey || loadError) {
    return (
      <div style={{ width: '100%', height: '400px', backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
        <div style={{ fontSize: '32px' }}>🗺️</div>
        <div style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '0 20px' }}>
          <strong>Map Connection Offline</strong><br/>
          Verify VITE_GMAPS_KEY in .env settings.
        </div>
        <div style={{ fontSize: '12px', color: '#475569' }}>
          {safeAlerts.length} targets tracked offline
        </div>
      </div>
    );
  }

  return isLoaded ? (
    <div style={{ width: '100%', height: '400px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={safeAlerts.length > 0 ? { lat: safeAlerts[0].lat, lng: safeAlerts[0].lng } : center}
        zoom={12}
        options={{
          styles: darkMapStyle,
          disableDefaultUI: true,
          zoomControl: true
        }}
      >
        {safeAlerts.map((alert, idx) => {
          const isVictim = alert.camera_id === 'VICTIM-APP';
          return (
            <Marker
              key={idx}
              position={{ lat: parseFloat(alert.lat), lng: parseFloat(alert.lng) }}
              icon={isVictim 
                ? 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png'
                : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
              }
            />
          );
        })}
      </GoogleMap>
    </div>
  ) : (
    <div style={{ width: '100%', height: '400px', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '14px' }}>
      Linking to Surveillance Node...
    </div>
  );
}

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] }
];
