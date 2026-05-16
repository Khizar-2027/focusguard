const formatMins = (seconds) => `${Math.floor(seconds / 60)}m`;

export default function StatsCards({ summary }) {
  const cards = [
    { label: 'Study Time', value: formatMins(summary.study_time), emoji: '📚', color: 'text-green-400' },
    { label: 'Reels Time', value: formatMins(summary.reels_time), emoji: '📱', color: 'text-red-400' },
    { label: 'Productivity', value: `${summary.productivity_score}%`, emoji: '⚡', color: 'text-primary' },
    { label: 'Break Time', value: formatMins(summary.break_time), emoji: '☕', color: 'text-yellow-400' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(({ label, value, emoji, color }) => (
        <div key={label} className="bg-card rounded-2xl p-4 text-center">
          <div className="text-3xl mb-1">{emoji}</div>
          <div className={`text-2xl font-bold ${color}`}>{value}</div>
          <div className="text-gray-400 text-sm mt-1">{label}</div>
        </div>
      ))}
    </div>
  );
}