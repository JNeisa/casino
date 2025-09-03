// src/components/charts/NumberRepetitionsChart.tsx
'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { RouletteStatistics } from '../../services/roulette/types';
import { getAllRouletteNumbers } from '../../utils/roulette';
import ChartLoading from '../ui/ChartLoading';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface NumberRepetitionsChartProps {
  statistics: RouletteStatistics;
  isLoading?: boolean;
}

export default function NumberRepetitionsChart({ statistics, isLoading = false }: NumberRepetitionsChartProps) {
  const chartRef = useRef<ChartJS<'bar'> | null>(null);

  const sortedNumbers = getAllRouletteNumbers();
  const data = {
    labels: sortedNumbers,
    datasets: [{
      label: 'Número de Ocurrencias',
      data: sortedNumbers.map(num => statistics.numberCounts[num] || 0),
      backgroundColor: 'rgba(153, 102, 255, 0.6)',
      borderColor: 'rgba(153, 102, 255, 1)',
      borderWidth: 1
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Repeticiones de Número'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Número de Ocurrencias'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Números de Ruleta'
        }
      }
    }
  };

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-3 sm:mb-4 text-center">
        Gráfico de Repetición de Números
      </h2>
      <div className="relative w-full h-[400px]">
        <Bar ref={chartRef} data={data} options={options} />
        {isLoading && <ChartLoading />}
      </div>
    </div>
  );
}
