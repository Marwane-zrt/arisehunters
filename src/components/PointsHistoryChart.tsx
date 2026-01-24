import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { PointsHistoryData } from '../types/pointsHistory';
import { TrendingUp, Trophy } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PointsHistoryChartProps {
  historyData: PointsHistoryData;
}

export const PointsHistoryChart: React.FC<PointsHistoryChartProps> = ({ historyData }) => {
  if (historyData.entries.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="text-cyan-400" size={20} />
          Your Progress
        </h3>
        <div className="text-center py-8">
          <p className="text-gray-400">Complete some quests to see your progress!</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const labels = historyData.entries.slice().reverse().map(entry => {
    const date = new Date(entry.date);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const cumulativeData = historyData.entries.slice().reverse().map(entry => entry.dailyTotal);

  const data = {
    labels,
    datasets: [
      {
        label: 'Total Points',
        data: cumulativeData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(31, 41, 55, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            if (!context || !context[0] || context[0].dataIndex === undefined) {
              return '';
            }
            const dataIndex = context[0].dataIndex;
            const entry = historyData.entries.slice().reverse()[dataIndex];
            return `${context[0].parsed.y} total points`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 11,
          },
        },
        title: {
          display: true,
          text: 'Points',
          color: '#9CA3AF',
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <TrendingUp className="text-cyan-400" size={20} />
          Your Progress
        </h3>
      </div>

      {/* Simple Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-black/40 rounded-lg p-4 border border-purple-500/20 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="text-blue-400" size={16} />
            <span className="text-xs text-blue-300 font-medium uppercase tracking-wider">Current Total</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {historyData.entries[0]?.dailyTotal || 0}
          </div>
          <div className="text-xs text-gray-400 mt-1">Points</div>
        </div>
        
        <div className="bg-black/40 rounded-lg p-4 border border-green-500/20 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Trophy className="text-green-400" size={16} />
            <span className="text-xs text-green-300 font-medium uppercase tracking-wider">Best Day</span>
          </div>
          <div className="text-2xl font-bold text-green-400">
            {historyData.bestDay ? `+${historyData.bestDay.netChange}` : '0'}
          </div>
          <div className="text-xs text-gray-400 mt-1">Points gained</div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-64 mb-4">
        <Line data={data} options={options} />
      </div>
      
      {/* Simple explanation */}
      <div className="text-center">
        <p className="text-sm text-gray-400">
          Your points grow as you complete daily quests and achieve goals
        </p>
      </div>
    </div>
  );
};