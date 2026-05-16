import { useState, useEffect } from 'react';
import useTimerStore from '../../store/timerStore';
import usePomodoroStore, { PHASES } from '../../store/pomodoroStore';
import { createSession } from '../../api/sessions';
import { getProfile } from '../../api/auth';
import toast from 'react-hot-toast';

const fmt = (s) => {
  const n = (typeof s === 'number' && !isNaN(s)) ? Math.max(0, Math.floor(s)) : 0;
  return `${Math.floor(n / 60).toString().padStart(2, '0')}:${(n % 60).toString().padStart(2, '0')}`;
};

export default function TimerPanel({ onSessionSaved }) {
  const [mode, setMode] = useState('manual');
  const [saving, setSaving] = useState(false);
  const [, forceRender] = useState(0);

  const { activeTimer, elapsed, startTimer, stopTimer } = useTimerStore();
  const {
    phase, startTimestamp, workMinutes, breakMinutes,
    sessionsCompleted, configure, start: pomStart,
    skip: pomSkip, reset: pomReset, resume
  } = usePomodoroStore();

  useEffect(() => {
    getProfile().then(res => {
      configure(
        res.data.pomodoro_work_minutes || 45,
        res.data.pomodoro_break_minutes || 10,
        res.data.playlist_url || ''
      );
    }).catch(() => {});
    resume();
    if (Notification.permission === 'default') Notification.requestPermission();
    const id = setInterval(() => forceRender(n => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const handleStop = async () => {
    const { elapsed: duration, type } = stopTimer();
    if (duration < 5) { toast.error('Session too short!'); return; }
    setSaving(true);
    try {
      const now = new Date();
      await createSession({
        session_type: type, duration,
        started_at: new Date(now - duration * 1000).toISOString(),
        ended_at: now.toISOString(),
        source: 'manual',
      });
      toast.success(`${type} session saved`);
      onSessionSaved();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const isIdle = phase === PHASES.IDLE;
  const isWork = phase === PHASES.WORK;
  const isBreak = phase === PHASES.BREAK;
  const wMin = workMinutes || 45;
  const bMin = breakMinutes || 10;
  const pomElapsed = startTimestamp ? Math.floor((Date.now() - startTimestamp) / 1000) : 0;
  const totalSecs = isBreak ? bMin * 60 : wMin * 60;
  const remaining = Math.max(0, totalSecs - pomElapsed);
  const pct = isIdle ? 0 : Math.min(100, (pomElapsed / totalSecs) * 100);
  const C = 2 * Math.PI * 44;
  const offset = C - (pct / 100) * C;
  const phaseColor = isWork ? '#fbbf24' : isBreak ? '#4ade80' : '#1e2a1e';

  const s = {
    card: { background: '#141a14', border: '1px solid #1e2a1e', borderRadius: '10px', padding: '18px' },
  };

  return (
    <div style={s.card}>

      {/* Tab toggle */}
      <div style={{
        display: 'flex', background: '#0d120d',
        borderRadius: '7px', padding: '3px', marginBottom: '18px',
      }}>
        {[{ id: 'manual', label: 'Manual' }, { id: 'pomodoro', label: 'Pomodoro' }].map(tab => (
          <button key={tab.id} onClick={() => setMode(tab.id)} style={{
            flex: 1, padding: '7px', borderRadius: '5px', border: 'none',
            fontSize: '12px', fontWeight: mode === tab.id ? 600 : 400,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            background: mode === tab.id ? '#1e2a1e' : 'transparent',
            color: mode === tab.id ? '#4ade80' : '#2d4228',
            transition: 'all 0.15s',
          }}>{tab.label}</button>
        ))}
      </div>

      {/* ── MANUAL ── */}
      {mode === 'manual' && (
        <div>
          {/* Timer display */}
          <div style={{
            background: '#0d120d',
            border: `1px solid ${activeTimer ? '#1e2a1e' : '#141a14'}`,
            borderRadius: '8px', padding: '24px 16px',
            textAlign: 'center', marginBottom: '14px',
          }}>
            <div style={{
              fontFamily: 'monospace', fontSize: '46px', fontWeight: 700,
              letterSpacing: '3px', lineHeight: 1,
              color: activeTimer === 'study' ? '#4ade80' : activeTimer === 'reels' ? '#f87171' : activeTimer === 'break' ? '#fbbf24' : '#1e2a1e',
              transition: 'color 0.3s',
            }}>
              {fmt(elapsed)}
            </div>
            <div style={{ fontSize: '11px', color: '#1e2a1e', marginTop: '8px' }}>
              {activeTimer ? `${activeTimer} session active` : 'select a session type'}
            </div>
          </div>

          {/* Session type buttons */}
          {!activeTimer ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[
                { type: 'study', label: 'Study', color: '#4ade80' },
                { type: 'reels', label: 'Reels', color: '#f87171' },
                { type: 'break', label: 'Break', color: '#fbbf24' },
              ].map(({ type, label, color }) => (
                <button key={type} onClick={() => startTimer(type)} style={{
                  background: `${color}0f`,
                  border: `1px solid ${color}22`,
                  borderRadius: '8px', padding: '12px 6px',
                  color, fontWeight: 500, fontSize: '13px',
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.15s',
                }}>
                  {label}
                </button>
              ))}
            </div>
          ) : (
            <button onClick={handleStop} disabled={saving} style={{
              width: '100%', padding: '11px',
              background: saving ? '#0d120d' : '#f8717110',
              border: `1px solid ${saving ? '#1e2a1e' : '#f8717122'}`,
              borderRadius: '8px', fontSize: '13px', fontWeight: 500,
              color: saving ? '#2d4228' : '#f87171',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
            }}>
              {saving ? 'Saving...' : '⏹ Stop & Save'}
            </button>
          )}
        </div>
      )}

      {/* ── POMODORO ── */}
      {mode === 'pomodoro' && (
        <div>
          {/* Circle timer */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px' }}>
              <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r="44" fill="none" stroke="#0d120d" strokeWidth="6" />
                <circle cx="60" cy="60" r="44" fill="none"
                  stroke={phaseColor} strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={isIdle ? C : offset}
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
              </svg>
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  fontFamily: 'monospace', fontSize: '22px',
                  fontWeight: 700, color: '#e8f5e8', lineHeight: 1,
                }}>
                  {fmt(isIdle ? wMin * 60 : remaining)}
                </div>
                <div style={{ fontSize: '10px', color: phaseColor, marginTop: '3px', fontWeight: 600 }}>
                  {isWork ? 'FOCUS' : isBreak ? 'BREAK' : 'READY'}
                </div>
              </div>
            </div>
          </div>

          {/* Pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '14px' }}>
            {[
              `${wMin}m focus`,
              `${bMin}m break`,
              ...(sessionsCompleted > 0 ? [`${sessionsCompleted} done`] : []),
            ].map(t => (
              <span key={t} style={{
                fontSize: '11px', background: '#0d120d',
                border: '1px solid #1e2a1e', borderRadius: '20px',
                padding: '3px 10px', color: '#2d4228',
              }}>{t}</span>
            ))}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {isIdle && (
              <button onClick={pomStart} style={{
                width: '100%', padding: '11px',
                background: '#fbbf2410', border: '1px solid #fbbf2422',
                borderRadius: '8px', fontSize: '13px', fontWeight: 500,
                color: '#fbbf24', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}>
                ▶ Start Focus Session
              </button>
            )}
            {isWork && (
              <>
                <div style={{
                  background: '#fbbf2408', border: '1px solid #fbbf2418',
                  borderRadius: '8px', padding: '9px', textAlign: 'center',
                  fontSize: '12px', fontWeight: 500, color: '#fbbf24',
                }}>
                  Stay focused — {fmt(remaining)} left
                </div>
                <button onClick={pomSkip} style={{
                  width: '100%', padding: '8px', background: 'transparent',
                  border: '1px solid #1e2a1e', borderRadius: '8px',
                  fontSize: '12px', color: '#2d4228', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}>
                  Skip to break →
                </button>
              </>
            )}
            {isBreak && (
              <>
                <div style={{
                  background: '#4ade8008', border: '1px solid #4ade8018',
                  borderRadius: '8px', padding: '9px', textAlign: 'center',
                  fontSize: '12px', fontWeight: 500, color: '#4ade80',
                }}>
                  Break time — {fmt(remaining)} left
                </div>
                <button onClick={pomSkip} style={{
                  width: '100%', padding: '8px', background: 'transparent',
                  border: '1px solid #1e2a1e', borderRadius: '8px',
                  fontSize: '12px', color: '#2d4228', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}>
                  Skip break →
                </button>
              </>
            )}
            {!isIdle && (
              <button onClick={pomReset} style={{
                background: 'none', border: 'none', fontSize: '11px',
                color: '#1e2a1e', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', padding: '3px', textAlign: 'center',
              }}>
                Reset
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}