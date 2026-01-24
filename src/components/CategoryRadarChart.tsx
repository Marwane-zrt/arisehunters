import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { Category } from '../types/category';
import { BarChart3, Award } from 'lucide-react';
import { getRankFromPoints } from '../utils/rankingSystem';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface CategoryRadarChartProps {
  categories: Category[];
}

export const CategoryRadarChart: React.FC<CategoryRadarChartProps> = ({ categories }) => {
  if (categories.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-cyan-400" size={20} />
          <h3 className="text-lg font-semibold text-white">Category Progress</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-400">Create categories to see your progress visualization</p>
        </div>
      </div>
    );
  }

  const maxPoints = Math.max(...categories.map(cat => cat.points));
  const adaptiveMax = maxPoints === 0 ? 5 : maxPoints;

  const data = {
    labels: categories.map(cat => cat.name),
    datasets: [
      {
        label: 'Points',
        data: categories.map(cat => cat.points),
        backgroundColor: 'rgba(6, 182, 212, 0.2)',
        borderColor: 'rgba(6, 182, 212, 1)',
        borderWidth: 2,
        pointBackgroundColor: categories.map(cat => cat.color),
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
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
        borderColor: 'rgba(6, 182, 212, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const categoryIndex = context.dataIndex;
            const category = categories[categoryIndex];
            const rankInfo = getRankFromPoints(category.points);
            return [
              `${context.parsed.r} points`,
              `Rank: ${rankInfo.rank} (${rankInfo.description})`
            ];
          },
        },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: adaptiveMax,
        grid: {
          color: 'rgba(75, 85, 99, 0.8)',
        },
        angleLines: {
          color: 'rgba(75, 85, 99, 0.8)',
        },
        pointLabels: {
          color: '#D1D5DB',
          font: {
            size: 12,
            weight: '500' as const,
          },
        },
        ticks: {
          color: 'rgba(156, 163, 175, 0.8)',
          backdropColor: 'transparent',
          font: {
            size: 10,
          },
          stepSize: Math.max(1, Math.ceil(adaptiveMax / 5)),
        },
      },
    },
    elements: {
      line: {
        tension: 0.1,
      },
    },
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="text-cyan-400" size={20} />
        <h3 className="text-lg font-semibold text-white">Category Progress</h3>
        <div className="ml-auto text-sm text-gray-400">
          Max: {maxPoints} points
        </div>
      </div>
      
      <div className="relative h-80">
        <Radar data={data} options={options} />
      </div>
      
      <div className="flex flex-wrap justify-center gap-4 mt-6">
        {categories.map((category) => {
          const rankInfo = getRankFromPoints(category.points);
          return (
            <div key={category.id} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-sm text-gray-300">{category.name}</span>
              <span className="text-sm font-bold text-cyan-400">
                {category.points}
              </span>
              <div 
                className="px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                style={{ 
                  backgroundColor: rankInfo.color + '20',
                  color: rankInfo.color
                }}
              >
                <Award size={12} />
                {rankInfo.rank}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};