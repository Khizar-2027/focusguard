import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function WeeklyChart({ data }) {
  const entries = Object.entries(data).reverse();
  const labels = entries.map(([date]) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Study (mins)',
        data: entries.map(([, v]) => Math.floor(v.study / 60)),
        backgroundColor: '#22c55e',
        borderRadius: 6,
      },
      {
        label: 'Reels (mins)',
        data: entries.map(([, v]) => Math.floor(v.reels / 60)),
        backgroundColor: '#ef4444',
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#ffffff' } },
      title: { display: false },
    },
    scales: {
      x: { ticks: { color: '#9ca3af' }, grid: { color: '#1f2937' } },
      y: { ticks: { color: '#9ca3af' }, grid: { color: '#1f2937' } },
    },
  };

  return (
    <div className="bg-card rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">📊 Weekly Overview</h2>
      <Bar data={chartData} options={options} />
    </div>
  );
}