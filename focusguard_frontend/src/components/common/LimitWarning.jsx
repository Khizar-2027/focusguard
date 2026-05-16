export default function LimitWarning({ reelsTime, onClose }) {
  const mins = Math.floor((reelsTime || 0) / 60);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: '#141a14', border: '1px solid #f8717130', borderRadius: '14px', padding: '36px', maxWidth: '380px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠</div>
        <div style={{ fontSize: '18px', fontWeight: 600, color: '#f87171', marginBottom: '10px' }}>Reels limit exceeded</div>
        <div style={{ fontSize: '14px', color: '#4a6741', marginBottom: '8px' }}>
          You've spent <span style={{ color: '#e8f5e8', fontWeight: 500 }}>{mins} minutes</span> on Reels today.
        </div>
        <div style={{ fontSize: '12px', color: '#2d4228', marginBottom: '28px' }}>Your future self is watching.</div>
        <button onClick={onClose} style={{ background: '#4ade8018', color: '#4ade80', border: '1px solid #4ade8030', borderRadius: '8px', padding: '10px 28px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
          Back to focus
        </button>
      </div>
    </div>
  );
}