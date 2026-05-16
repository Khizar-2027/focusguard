import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ProductivityChart({ summary }) {
  const data = {
    labels: ['Study', 'Reels', 'Break'],
    datasets: [{
      data: [summary.study_time, summary.reels_time, summary.break_time],
      backgroundColor: ['#22c55e', '#ef4444', '#eab308'],
      borderWidth: 0,
    }],
  };

  const options = {
    plugins: {
      legend: { labels: { color: '#ffffff' } }
    }
  };

  return (
    <div className="bg-card rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">📊 Today's Breakdown</h2>
      <div className="max-w-xs mx-auto">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
}