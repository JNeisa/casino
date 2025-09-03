// src/components/charts/SectorFrequencyChart.tsx
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
import ChartLoading from '../ui/ChartLoading';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SectorFrequencyChartProps {
  statistics: RouletteStatistics;
  isLoading?: boolean;
}

export default function SectorFrequencyChart({ statistics, isLoading = false }: SectorFrequencyChartProps) {
  const chartRef = useRef<ChartJS<'bar'> | null>(null);

  const data = {
    labels: ['A', 'B', 'C', 'D'],
    datasets: [{
      label: 'Números por Sector',
      data: [
        statistics.sectorCounts.A,
        statistics.sectorCounts.B,
        statistics.sectorCounts.C,
        statistics.sectorCounts.D
      ],
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)'
      ],
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
        text: 'Frecuencias de Sector'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Número de Ocurrencias'
        }
      }
    }
  };

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-3 sm:mb-4 text-center">
        Gráfico de Frecuencia de Sectores
      </h2>
      <div className="relative w-full h-[400px]">
        <Bar ref={chartRef} data={data} options={options} />
        {isLoading && <ChartLoading />}
      </div>
    </div>
  );
}
