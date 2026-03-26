import ConfidenceBadge from './ConfidenceBadge';

export default function AlertLog({ alerts }) {
  return (
    <div style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ backgroundColor: '#F3F4F6' }}>
          <tr>
            <th style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB' }}>Time</th>
            <th style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB' }}>Source</th>
            <th style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB' }}>Location</th>
            <th style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB' }}>Confidence</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert, idx) => {
            const bg = idx === 0 ? '#FEF2F2' : (idx % 2 === 0 ? 'white' : '#F9FAFB');
            
            return (
              <tr key={idx} style={{ backgroundColor: bg }}>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB' }}>
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB' }}>
                  {alert.camera_id === 'VICTIM-APP' ? (
                    <span style={{ color: '#8B5CF6', fontWeight: 'bold' }}>📱 Victim App</span>
                  ) : (
                    <span style={{ fontFamily: 'monospace' }}>{alert.camera_id}</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB' }}>
                  {alert.location_name}
                </td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB' }}>
                  <ConfidenceBadge confidence={alert.confidence} />
                </td>
              </tr>
            );
          })}
          {alerts.length === 0 && (
            <tr>
              <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>
                No alerts recorded.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
