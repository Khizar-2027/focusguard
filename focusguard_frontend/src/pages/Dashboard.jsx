import { useEffect, useState, useCallback } from 'react';
import { getDailySummary } from '../api/sessions';
import { getStreak } from '../api/streaks';
import TimerPanel from '../components/Timer/TimerPanel';
import LimitWarning from '../components/common/LimitWarning';
import useWindowSize from '../hooks/useWindowSize';

const fmtTime = (s) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const card = {
  background: '#141a14',
  border: '1px solid #1e2a1e',
  borderRadius: '10px',
  padding: '16px',
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [streak, setStreak] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { isMobile, isTablet } = useWindowSize();

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const [s, st] = await Promise.all([getDailySummary(), getStreak()]);
      setSummary(s.data); setStreak(st.data);
      setLastUpdated(new Date());
      if (s.data.limit_exceeded) setShowWarning(true);
    } catch (err) { console.error(err); }
    finally { if (!silent) setRefreshing(false); }
  }, []);

  useEffect(() => {
    fetchData();
    const onVis = () => { if (!document.hidden) fetchData(true); };
    const onFocus = () => fetchData(true);
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchData]);

  const pct = streak
    ? Math.min(100, Math.round((streak.study_today_seconds / streak.goal_seconds) * 100))
    : 0;

  return (
    <div style={{
      minHeight: '100vh', background: '#0f1117',
      padding: isMobile ? '16px 14px 80px' : '24px 20px',
    }}>
      {showWarning && <LimitWarning reelsTime={summary?.reels_time} onClose={() => setShowWarning(false)} />}

      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 600, color: '#e8f5e8' }}>Dashboard</div>
            <div style={{ fontSize: '11px', color: '#2d4228', marginTop: '2px' }}>
              {lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
                : 'Loading...'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {streak && (
              <div style={{ ...card, padding: '7px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px' }}>🔥</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#fbbf24', lineHeight: 1 }}>{streak.current_streak}d</div>
                  <div style={{ fontSize: '10px', color: '#2d4228' }}>streak</div>
                </div>
              </div>
            )}
            <button onClick={() => fetchData(false)} disabled={refreshing} style={{
              background: '#141a14', border: '1px solid #1e2a1e', borderRadius: '8px',
              padding: '8px 12px', fontSize: '14px', cursor: 'pointer',
              color: '#4a6741', opacity: refreshing ? 0.5 : 1,
            }}>↻</button>
          </div>
        </div>

        {/* Limit warning */}
        {summary?.limit_exceeded && (
          <div style={{ background: '#f8717112', border: '1px solid #f8717130', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#f87171', fontSize: '13px' }}>⚠</span>
            <span style={{ fontSize: '12px', color: '#f87171', fontWeight: 500 }}>
              Reels limit exceeded — {fmtTime(summary.reels_time)} used today
            </span>
          </div>
        )}

        {/* Stat cards — 2 col on mobile, 4 col on desktop */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: '10px', marginBottom: '14px',
        }}>
          {summary ? [
            { label: 'Study Time', value: fmtTime(summary.study_time), color: '#4ade80' },
            { label: 'Reels Time', value: fmtTime(summary.reels_time), color: '#f87171' },
            { label: 'Focus Score', value: `${summary.productivity_score}%`, color: '#60a5fa' },
            { label: 'Goal', value: `${pct}%`, color: '#fbbf24' },
          ].map(({ label, value, color }) => (
            <div key={label} style={card}>
              <div style={{ fontSize: '10px', color: '#2d4228', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{label}</div>
              <div style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 600, color, lineHeight: 1 }}>{value}</div>
            </div>
          )) : [...Array(4)].map((_, i) => (
            <div key={i} className="loading" style={{ ...card, height: '72px' }} />
          ))}
        </div>

        {/* Goal bar */}
        {streak && (
          <div style={{ ...card, marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: '#4a6741', fontWeight: 500 }}>Daily study goal</span>
              <span style={{ fontSize: '11px', color: '#2d4228' }}>
                {fmtTime(streak.study_today_seconds)} / {fmtTime(streak.goal_seconds)}
              </span>
            </div>
            <div style={{ background: '#0d120d', height: '5px', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#4ade80' : '#fbbf24', borderRadius: '3px', transition: 'width 0.8s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '11px', color: streak?.goal_met_today ? '#4ade80' : '#2d4228' }}>
                {streak?.goal_met_today ? '✓ Goal met today' : 'Keep going'}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 500, color: pct >= 100 ? '#4ade80' : '#fbbf24' }}>{pct}%</span>
            </div>
          </div>
        )}

        {/* Main grid — stacks on mobile */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile || isTablet ? '1fr' : '1fr 1fr',
          gap: '14px',
        }}>
          <TimerPanel onSessionSaved={() => fetchData(false)} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Breakdown */}
            <div style={card}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#4a6741', marginBottom: '14px' }}>
                Today's breakdown
              </div>
              {summary ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    { label: 'Study', value: summary.study_time, total: summary.total_time, color: '#4ade80' },
                    { label: 'Reels', value: summary.reels_time, total: summary.total_time, color: '#f87171' },
                    { label: 'Break', value: summary.break_time, total: summary.total_time, color: '#fbbf24' },
                  ].map(({ label, value, total, color }) => {
                    const p = total > 0 ? Math.round((value / total) * 100) : 0;
                    return (
                      <div key={label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '12px', color: '#4a6741' }}>{label}</span>
                          <span style={{ fontSize: '11px', color: '#2d4228' }}>{fmtTime(value)} · {p}%</span>
                        </div>
                        <div style={{ background: '#0d120d', height: '5px', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${p}%`, background: color, borderRadius: '3px', transition: 'width 0.8s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                  {summary.total_time === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px 0', fontSize: '12px', color: '#1e2a1e' }}>
                      No sessions yet — start your first timer
                    </div>
                  )}
                </div>
              ) : (
                <div className="loading" style={{ height: '90px', background: '#0d120d', borderRadius: '6px' }} />
              )}
            </div>

            {/* Streak overview */}
            {streak && (
              <div style={card}>
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#4a6741', marginBottom: '14px' }}>
                  Streak overview
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  {[
                    { label: 'Current', value: streak.current_streak, unit: 'days', color: '#fbbf24' },
                    { label: 'Longest', value: streak.longest_streak, unit: 'days', color: '#60a5fa' },
                    { label: 'Study days', value: streak.total_study_days, unit: 'total', color: '#4ade80' },
                  ].map(({ label, value, unit, color }) => (
                    <div key={label} style={{ textAlign: 'center', background: '#0d120d', borderRadius: '8px', padding: '10px 6px' }}>
                      <div style={{ fontSize: '18px', fontWeight: 600, color, lineHeight: 1, marginBottom: '3px' }}>{value}</div>
                      <div style={{ fontSize: '10px', color: '#2d4228' }}>{unit}</div>
                      <div style={{ fontSize: '10px', color: '#1e2a1e', marginTop: '2px' }}>{label}</div>
                    </div>
                  ))}
                </div>
                <div style={{
                  background: streak.goal_met_today ? '#4ade8010' : '#fbbf2410',
                  border: `1px solid ${streak.goal_met_today ? '#4ade8025' : '#fbbf2425'}`,
                  borderRadius: '7px', padding: '8px 12px',
                  fontSize: '12px', fontWeight: 500,
                  color: streak.goal_met_today ? '#4ade80' : '#fbbf24',
                  textAlign: 'center',
                }}>
                  {streak.goal_met_today ? '✓ Goal met today — streak secured' : '⚡ Study more to keep your streak'}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}