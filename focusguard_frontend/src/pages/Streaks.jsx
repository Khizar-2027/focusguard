import { useEffect, useState, useCallback } from 'react';
import { getStreak } from '../api/streaks';
import useWindowSize from '../hooks/useWindowSize';

const fmtMins = (s) => `${Math.floor(s / 60)}m`;

export default function Streaks() {
  const [streak, setStreak] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { isMobile } = useWindowSize();

  const card = {
    background: '#141a14',
    border: '1px solid #1e2a1e',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '12px',
  };

  const fetchStreak = useCallback(async () => {
    try {
      const res = await getStreak();
      setStreak(res.data);
      setLastUpdated(new Date());
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    fetchStreak();
    const onVis = () => { if (!document.hidden) fetchStreak(); };
    const onFocus = () => fetchStreak();
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchStreak]);

  if (!streak) return (
    <div style={{ minHeight: '100vh', background: '#0f1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '13px', color: '#2d4228' }}>Loading...</div>
    </div>
  );

  const pct = streak.goal_seconds > 0
    ? Math.min(100, Math.round((streak.study_today_seconds / streak.goal_seconds) * 100))
    : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', padding: isMobile ? '16px 14px 80px' : '24px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
          <div>
            <div style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: 600, color: '#e8f5e8' }}>Streaks</div>
            <div style={{ fontSize: '11px', color: '#2d4228', marginTop: '2px' }}>
              {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : 'Stay consistent'}
            </div>
          </div>
          <button onClick={fetchStreak} style={{ background: '#141a14', border: '1px solid #1e2a1e', borderRadius: '8px', padding: '7px 12px', fontSize: '14px', cursor: 'pointer', color: '#4a6741' }}>↻</button>
        </div>

        {/* Main streak card */}
        <div style={{ ...card, textAlign: 'center', padding: '36px 20px' }}>
          <div style={{ fontSize: isMobile ? '52px' : '64px', fontWeight: 600, color: '#fbbf24', lineHeight: 1, marginBottom: '6px' }}>
            {streak.current_streak}
          </div>
          <div style={{ fontSize: '14px', color: '#4a6741', marginBottom: '24px' }}>day streak</div>
          {streak.goal_met_today ? (
            <div style={{ display: 'inline-block', background: '#4ade8012', border: '1px solid #4ade8025', borderRadius: '8px', padding: '8px 20px', fontSize: '13px', color: '#4ade80', fontWeight: 500 }}>
              Goal met today — streak secured
            </div>
          ) : (
            <div style={{ display: 'inline-block', background: '#fbbf2412', border: '1px solid #fbbf2425', borderRadius: '8px', padding: '8px 20px', fontSize: '13px', color: '#fbbf24', fontWeight: 500 }}>
              Study more to keep your streak
            </div>
          )}
        </div>

        {/* Goal progress */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: '#4a6741', fontWeight: 500 }}>Today's goal</span>
            <span style={{ fontSize: '12px', color: '#2d4228' }}>{fmtMins(streak.study_today_seconds)} / {fmtMins(streak.goal_seconds)}</span>
          </div>
          <div style={{ background: '#0d120d', height: '5px', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#4ade80' : '#fbbf24', borderRadius: '3px', transition: 'width 0.8s ease' }} />
          </div>
          <div style={{ textAlign: 'right', marginTop: '6px', fontSize: '12px', color: pct >= 100 ? '#4ade80' : '#fbbf24', fontWeight: 500 }}>{pct}%</div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          {[
            { label: 'Current streak', value: streak.current_streak, unit: 'days', color: '#fbbf24' },
            { label: 'Longest streak', value: streak.longest_streak, unit: 'days', color: '#60a5fa' },
            { label: 'Study days', value: streak.total_study_days, unit: 'total', color: '#4ade80' },
          ].map(({ label, value, unit, color }) => (
            <div key={label} style={{ ...card, marginBottom: 0, textAlign: 'center', padding: '16px' }}>
              <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 600, color, lineHeight: 1, marginBottom: '4px' }}>{value}</div>
              <div style={{ fontSize: '10px', color: '#2d4228', marginBottom: '2px' }}>{unit}</div>
              <div style={{ fontSize: '11px', color: '#1e2a1e' }}>{label}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}