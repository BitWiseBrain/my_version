import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';

const center = { lat: 12.9716, lng: 77.5946 };

export default function AlertMap({ alerts }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GMAPS_KEY
  });

  return isLoaded ? (
    <div style={{ width: '100%', height: '400px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={alerts.length > 0 ? { lat: alerts[0].lat, lng: alerts[0].lng } : center}
        zoom={12}
      >
        {alerts.map((alert, idx) => {
          const isVictim = alert.camera_id === 'VICTIM-APP';
          return (
            <Marker
              key={idx}
              position={{ lat: alert.lat, lng: alert.lng }}
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
    <div style={{ width: '100%', height: '400px', backgroundColor: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      Loading Map...
    </div>
  );
}
