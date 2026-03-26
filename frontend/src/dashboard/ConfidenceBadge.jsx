export default function ConfidenceBadge({ confidence }) {
  const percent = Math.round(confidence * 100);
  let bgColor = '#6B7280'; // gray
  if (confidence >= 0.9) bgColor = '#DC2626'; // red
  else if (confidence >= 0.7) bgColor = '#F59E0B'; // amber

  return (
    <span style={{
      backgroundColor: bgColor,
      color: 'white',
      borderRadius: '9999px',
      padding: '2px 10px',
      fontSize: '14px',
      fontWeight: 'bold',
      display: 'inline-block'
    }}>
      {percent}%
    </span>
  );
}
