export default function Header({ connected }) {
  return (
    <header style={{
      backgroundColor: '#111827',
      color: 'white',
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
        🛡️ Ankurah — Police Control Room
      </div>
      <div style={{ 
        fontSize: '13px', 
        color: connected ? '#10B981' : '#EF4444',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        {connected ? '🟢 Live' : '🔴 Reconnecting...'}
      </div>
    </header>
  );
}
