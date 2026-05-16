export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: '#1e2d1a', border: '1px solid #2d4228', borderRadius: '14px', padding: '28px', maxWidth: '360px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
        <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: '18px', fontWeight: 600, color: '#f5f0e8', marginBottom: '8px' }}>
          Are you sure?
        </div>
        <div style={{ fontSize: '13px', color: '#8a9980', marginBottom: '24px' }}>{message}</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onConfirm} style={{ flex: 1, padding: '10px', background: 'rgba(192,83,63,0.2)', color: '#e87a60', border: '1px solid rgba(192,83,63,0.4)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Yes, delete
          </button>
          <button onClick={onCancel} style={{ flex: 1, padding: '10px', background: '#162014', color: '#f5f0e8', border: '1px solid #2d4228', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}