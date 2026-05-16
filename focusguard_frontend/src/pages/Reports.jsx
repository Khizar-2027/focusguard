import { useEffect, useState, useCallback } from 'react';
import { getWeeklySummary, getDailySummary } from '../api/sessions';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import useWindowSize from '../hooks/useWindowSize';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const fmtMins = (s) => `${Math.floor(s / 60)}m`;
const card = { background: '#141a14', border: '1px solid #1e2a1e', borderRadius: '10px', padding: '20px', marginBottom: '12px' };

export default function Reports() {
  const [weekly, setWeekly] = useState(null);
  const [daily, setDaily] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isMobile } = useWindowSize();

  const fetchData = useCallback(async () => {
    try {
      const [w, d] = await Promise.all([getWeeklySummary(), getDailySummary()]);
      setWeekly(w.data); setDaily(d.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchData();
    const onVis = () => { if (!document.hidden) fetchData(); };
    const onFocus = () => fetchData();
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchData]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '13px', color: '#2d4228' }}>Loading reports...</div>
    </div>
  );

  const days = weekly ? Object.entries(weekly).reverse() : [];
  const totalStudy = days.reduce((a, [, v]) => a + v.study, 0);
  const totalReels = days.reduce((a, [, v]) => a + v.reels, 0);
  const bestDay = days.reduce((b, [d, v]) => v.study > (b[1]?.study || 0) ? [d, v] : b, ['', { study: 0 }]);

  const chartData = {
    labels: days.map(([d]) => new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })),
    datasets: [
      { label: 'Study (mins)', data: days.map(([, v]) => Math.floor(v.study / 60)), backgroundColor: '#4ade8060', borderRadius: 4 },
      { label: 'Reels (mins)', data: days.map(([, v]) => Math.floor(v.reels / 60)), backgroundColor: '#f8717160', borderRadius: 4 },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: '#4a6741', font: { family: 'Inter', size: 11 } } } },
    scales: {
      x: { ticks: { color: '#2d4228', font: { size: 10 } }, grid: { color: '#1e2a1e' } },
      y: { ticks: { color: '#2d4228', font: { size: 10 } }, grid: { color: '#1e2a1e' } },
    },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', padding: isMobile ? '16px 14px 80px' : '24px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        <div style={{ marginBottom: '22px' }}>
          <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 600, color: '#e8f5e8' }}>Reports</div>
          <div style={{ fontSize: '11px', color: '#2d4228', marginTop: '2px' }}>Your productivity over time</div>
        </div>

        {/* Today stats — 2col on mobile */}
        {daily && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '10px', marginBottom: '12px' }}>
            {[
              { label: 'Study today', value: fmtMins(daily.study_time), color: '#4ade80' },
              { label: 'Reels today', value: fmtMins(daily.reels_time), color: '#f87171' },
              { label: 'Focus score', value: `${daily.productivity_score}%`, color: '#60a5fa' },
              { label: 'Limit', value: daily.limit_exceeded ? 'Over' : 'Under', color: daily.limit_exceeded ? '#f87171' : '#4ade80' },
            ].map(({ label, value, color }) => (
              <div key={label} style={card}>
                <div style={{ fontSize: '10px', color: '#2d4228', marginBottom: '6px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                <div style={{ fontSize: '20px', fontWeight: 600, color, lineHeight: 1 }}>{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Weekly summary — 1col on mobile, 3col on desktop */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          {[
            { label: 'Total study (7d)', value: fmtMins(totalStudy), color: '#4ade80' },
            { label: 'Total reels (7d)', value: fmtMins(totalReels), color: '#f87171' },
            { label: 'Best day', value: bestDay[0] ? fmtMins(bestDay[1].study) : 'N/A', color: '#fbbf24' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ ...card, textAlign: 'center', marginBottom: 0 }}>
              <div style={{ fontSize: '22px', fontWeight: 600, color, lineHeight: 1, marginBottom: '6px' }}>{value}</div>
              <div style={{ fontSize: '11px', color: '#2d4228' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={card}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: '#4a6741', marginBottom: '16px' }}>Weekly overview</div>
          <Bar data={chartData} options={chartOptions} />
        </div>

        {/* Table — hide on very small, show scrollable */}
        <div style={card}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: '#4a6741', marginBottom: '14px' }}>Daily breakdown</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '300px' }}>
              <thead>
                <tr>
                  {['Date', 'Study', 'Reels', 'Score'].map((h, i) => (
                    <th key={h} style={{ textAlign: i === 0 ? 'left' : 'right', padding: '6px 10px', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#2d4228', borderBottom: '1px solid #1e2a1e' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map(([date, v]) => {
                  const total = v.study + v.reels;
                  const score = total > 0 ? Math.round((v.study / total) * 100) : 0;
                  return (
                    <tr key={date} style={{ borderBottom: '1px solid #0d120d' }}>
                      <td style={{ padding: '9px 10px', color: '#4a6741', whiteSpace: 'nowrap' }}>{date}</td>
                      <td style={{ padding: '9px 10px', textAlign: 'right', color: '#4ade80', fontWeight: 500 }}>{fmtMins(v.study)}</td>
                      <td style={{ padding: '9px 10px', textAlign: 'right', color: '#f87171', fontWeight: 500 }}>{fmtMins(v.reels)}</td>
                      <td style={{ padding: '9px 10px', textAlign: 'right' }}>
                        <span style={{ color: score >= 70 ? '#4ade80' : score >= 40 ? '#fbbf24' : '#f87171', fontWeight: 500 }}>{score}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}