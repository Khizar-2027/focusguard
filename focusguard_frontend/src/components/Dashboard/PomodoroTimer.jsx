import { useEffect, useState } from 'react';
import usePomodoroStore, { PHASES } from '../../store/pomodoroStore';
import { getProfile } from '../../api/auth';

const fmt = (s) => {
  const n = (typeof s === 'number' && !isNaN(s)) ? Math.max(0, Math.floor(s)) : 0;
  return `${Math.floor(n / 60).toString().padStart(2, '0')}:${(n % 60).toString().padStart(2, '0')}`;
};

export default function PomodoroTimer() {
  const { phase, workMinutes, breakMinutes, sessionsCompleted,
    startTimestamp, configure, start, skip, reset, resume } = usePomodoroStore();

  const [, forceRender] = useState(0);
  const [notifPerm, setNotifPerm] = useState(Notification.permission);

  useEffect(() => {
    getProfile().then(res => {
      configure(
        res.data.pomodoro_work_minutes || 45,
        res.data.pomodoro_break_minutes || 10,
        res.data.playlist_url || ''
      );
    }).catch(() => {});

    resume();

    const id = setInterval(() => forceRender(n => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const isIdle = phase === PHASES.IDLE;
  const isWork = phase === PHASES.WORK;
  const isBreak = phase === PHASES.BREAK;

  const wMin = workMinutes || 45;
  const bMin = breakMinutes || 10;

  const elapsed = startTimestamp ? Math.floor((Date.now() - startTimestamp) / 1000) : 0;
  const totalSecs = isBreak ? bMin * 60 : wMin * 60;
  const remaining = Math.max(0, totalSecs - elapsed);
  const pct = isIdle ? 0 : Math.min(100, (elapsed / totalSecs) * 100);

  const C = 2 * Math.PI * 54;
  const offset = C - (pct / 100) * C;
  const color = isWork ? '#c9913a' : isBreak ? '#4a8c3f' : '#3a5534';

  return (
    <div style={{ background: '#1e2d1a', border: '1px solid #2d4228', borderRadius: '12px', padding: '24px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: '17px', fontWeight: 600, color: '#f5f0e8' }}>
          🍅 Pomodoro
        </div>
        {sessionsCompleted > 0 && (
          <span style={{ fontSize: '11px', background: '#162014', border: '1px solid #2d4228', borderRadius: '20px', padding: '3px 10px', color: '#c9913a' }}>
            🍅 {sessionsCompleted} done
          </span>
        )}
      </div>

      {notifPerm !== 'granted' && (
        <div style={{ background: 'rgba(201,145,58,0.1)', border: '1px solid rgba(201,145,58,0.3)', borderRadius: '8px', padding: '10px 12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#c9913a' }}>Enable notifications for break alerts</span>
          <button onClick={async () => { const r = await Notification.requestPermission(); setNotifPerm(r); }}
            style={{ background: '#c9913a', color: '#fff8ee', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Allow
          </button>
        </div>
      )}

      {/* Circle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <div style={{ position: 'relative', width: '140px', height: '140px' }}>
          <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="70" cy="70" r="54" fill="none" stroke="#2d4228" strokeWidth="8" />
            <circle cx="70" cy="70" r="54" fill="none" stroke={color} strokeWidth="8"
              strokeLinecap="round" strokeDasharray={C}
              strokeDashoffset={isIdle ? C : offset}
              style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '26px', fontWeight: 700, color: '#f5f0e8', lineHeight: 1 }}>
              {fmt(isIdle ? wMin * 60 : remaining)}
            </div>
            <div style={{ fontSize: '11px', color, marginTop: '4px', fontWeight: 600 }}>
              {isWork ? 'FOCUS' : isBreak ? 'BREAK' : 'READY'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
        <span style={{ fontSize: '11px', background: '#162014', border: '1px solid #2d4228', borderRadius: '20px', padding: '3px 10px', color: '#8a9980' }}>⚡ {wMin}m focus</span>
        <span style={{ fontSize: '11px', background: '#162014', border: '1px solid #2d4228', borderRadius: '20px', padding: '3px 10px', color: '#8a9980' }}>☕ {bMin}m break</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {isIdle && (
          <button onClick={start} style={{ width: '100%', padding: '12px', background: 'rgba(201,145,58,0.15)', border: '1px solid rgba(201,145,58,0.35)', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#e8b04a', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            ▶ Start Focus Session
          </button>
        )}
        {isWork && (
          <>
            <div style={{ background: 'rgba(201,145,58,0.08)', border: '1px solid rgba(201,145,58,0.2)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#e8b04a' }}>🔥 Stay focused — {fmt(remaining)} remaining</span>
            </div>
            <button onClick={skip} style={{ width: '100%', padding: '9px', background: 'transparent', border: '1px solid #2d4228', borderRadius: '10px', fontSize: '12px', color: '#8a9980', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Skip to break →
            </button>
          </>
        )}
        {isBreak && (
          <>
            <div style={{ background: 'rgba(74,140,63,0.08)', border: '1px solid rgba(74,140,63,0.2)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#7fd672' }}>☕ Break time — {fmt(remaining)} remaining</span>
            </div>
            <button onClick={skip} style={{ width: '100%', padding: '9px', background: 'transparent', border: '1px solid #2d4228', borderRadius: '10px', fontSize: '12px', color: '#8a9980', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Skip break →
            </button>
          </>
        )}
        {!isIdle && (
          <button onClick={reset} style={{ background: 'none', border: 'none', fontSize: '11px', color: '#3a5534', cursor: 'pointer', fontFamily: 'Inter, sans-serif', padding: '4px', textAlign: 'center' }}>
            Reset
          </button>
        )}
      </div>
    </div>
  );
}