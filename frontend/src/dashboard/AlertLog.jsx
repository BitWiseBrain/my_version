import ConfidenceBadge from './ConfidenceBadge';

export default function AlertLog({ alerts = [] }) {
  // Defensive check to prevent "e.map is not a function"
  const safeAlerts = Array.isArray(alerts) ? alerts : [];

  return (
    <div style={{ backgroundColor: '#111827', display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Alert Log</h3>
        <span style={{ fontSize: '12px', color: '#64748b' }}>{safeAlerts.length} Active Records</span>
      </div>
      
      <div style={{ overflowY: 'auto', flexGrow: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead style={{ backgroundColor: 'rgba(255,255,255,0.02)', position: 'sticky', top: 0, zIndex: 5 }}>
            <tr>
              <th style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#64748b' }}>TIME</th>
              <th style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#64748b' }}>SOURCE</th>
              <th style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#64748b' }}>LOCATION</th>
              <th style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#64748b' }}>PRIORITY</th>
            </tr>
          </thead>
          <tbody>
            {safeAlerts.map((alert, idx) => {
              const bg = idx === 0 ? 'rgba(239, 68, 68, 0.1)' : 'transparent';
              
              return (
                <tr key={idx} style={{ backgroundColor: bg, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '16px', color: '#94a3b8' }}>
                    {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : '--:--:--'}
                  </td>
                  <td style={{ padding: '16px' }}>
                    {alert.camera_id === 'VICTIM-APP' ? (
                      <span style={{ color: '#818cf8', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        📱 <span style={{ fontSize: '11px', letterSpacing: '0.5px' }}>VICTIM APP</span>
                      </span>
                    ) : (
                      <span style={{ fontFamily: 'monospace', color: '#cbd5e1' }}>{alert.camera_id}</span>
                    )}
                  </td>
                  <td style={{ padding: '16px', color: '#cbd5e1' }}>
                    {alert.location_name || 'Unknown Zone'}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <ConfidenceBadge confidence={alert.confidence} />
                  </td>
                </tr>
              );
            })}
            
            {safeAlerts.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '48px', textAlign: 'center', color: '#475569' }}>
                  No alerts recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
