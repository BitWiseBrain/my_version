export default function CameraGrid({ cameras, latestAlert }) {
  // Check if camera is currently alerting (within last 8 seconds maybe? or just if it's the exact latest alert camera)
  // Let's say if the latestAlert matches the camera_id and is recent (< 8000ms)
  const isAlerting = (cameraId) => {
    if (!latestAlert) return false;
    if (latestAlert.camera_id !== cameraId) return false;
    const age = Date.now() - new Date(latestAlert.timestamp).getTime();
    return age < 8000;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
      {cameras.map(cam => {
        const alerting = isAlerting(cam.camera_id);
        
        return (
          <div key={cam.camera_id} style={{
            padding: '16px',
            borderRadius: '8px',
            border: alerting ? '2px solid #DC2626' : '1px solid #10B981',
            backgroundColor: alerting ? '#FEF2F2' : '#ffffff',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold' }}>{cam.camera_id}</span>
              {alerting ? (
                <span style={{ color: '#DC2626', fontWeight: 'bold', fontSize: '14px' }}>🔴 ALERT</span>
              ) : (
                <span style={{ color: '#10B981', fontSize: '14px' }}>🟢 Active</span>
              )}
            </div>
            <div style={{ color: '#6B7280', marginTop: '8px', fontSize: '14px' }}>
              {cam.location_name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
