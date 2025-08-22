import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendDataPoint } from '../../types/api';
import Loading from '../ui/Loading';

// Chart.js register
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TrendChartProps {
  data: TrendDataPoint[];
  loading?: boolean;
  kaynakKurulus: string;
  title?: string;
}

const TrendChart: React.FC<TrendChartProps> = ({ 
  data, 
  loading = false, 
  kaynakKurulus,
  title = "Haftalık Trend Analizi"
}) => {
  const chartRef = useRef<ChartJS<'line'>>(null);

  // Chart cleanup on unmount
  useEffect(() => {
    const chart = chartRef.current;
    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <Loading size="lg" text="Trend verileri yükleniyor..." />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          📈 {title}
        </h3>
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Trend Verisi Bulunamadı
          </h4>
          <p className="text-gray-600 dark:text-gray-400">
            {kaynakKurulus} için trend verisi mevcut değil
          </p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const labels = data.map(item => {
    const date = new Date(item.tarih);
    return date.toLocaleDateString('tr-TR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  });

  const chartData: ChartData<'line'> = {
    labels,
    datasets: [
      {
        label: '💰 Kümülatif Faiz Kazancı (₺)',
        data: data.map(item => item.kumulatifFaizKazanci),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#22c55e',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
        tension: 0.4
      },
      {
        label: '📊 Kümülatif Mevduat (₺)',
        data: data.map(item => item.kumulatifMevduat),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: false,
        tension: 0.4
      }
    ]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: `📈 ${kaynakKurulus} - ${title}`,
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 30
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#22c55e',
        borderWidth: 2,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        padding: 15,
        cornerRadius: 8,
        callbacks: {
          title: function(context: any) {
            const dataIndex = context[0].dataIndex;
            const item = data[dataIndex];
            return `📅 ${new Date(item.tarih).toLocaleDateString('tr-TR')} (${item.haftalikIslemSayisi} işlem)`;
          },
          beforeBody: function(context: any) {
            const dataIndex = context[0].dataIndex;
            const item = data[dataIndex];
            return [
              `💼 Fon: ${item.fonNo}`,
              `📈 Haftalık Büyüme: %${item.haftalikBuyumeYuzde.toFixed(2)}`
            ];
          },
          label: function(context: any) {
            const value = context.parsed.y;
            return `${context.dataset.label}: ₺${value.toLocaleString('tr-TR')}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '📅 Haftalık Periyotlar',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      y: {
        title: {
          display: true,
          text: '💰 Tutar (₺)',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback: function(value: any) {
            return '₺' + value.toLocaleString('tr-TR');
          }
        }
      }
    },
    elements: {
      line: {
        borderJoinStyle: 'round'
      },
      point: {
        hoverBorderWidth: 3
      }
    }
  };

  // Calculate summary stats
  const lastDataPoint = data[data.length - 1];
  const firstDataPoint = data[0];
  const totalGrowth = firstDataPoint && lastDataPoint 
    ? ((lastDataPoint.kumulatifFaizKazanci - firstDataPoint.kumulatifFaizKazanci) / firstDataPoint.kumulatifFaizKazanci * 100)
    : 0;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          📈 {title}
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {data.length} veri noktası
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="metric-card bg-success-50 dark:bg-success-900 border border-success-200 dark:border-success-700">
          <div className="metric-value text-success-600 dark:text-success-400 text-lg">
            ₺{lastDataPoint?.kumulatifFaizKazanci.toLocaleString('tr-TR') || '0'}
          </div>
          <div className="metric-label">Son Kümülatif Faiz</div>
        </div>

        <div className="metric-card bg-primary-50 dark:bg-primary-900 border border-primary-200 dark:border-primary-700">
          <div className="metric-value text-primary-600 dark:text-primary-400 text-lg">
            {data.length}
          </div>
          <div className="metric-label">Haftalık Veri</div>
        </div>

        <div className={`metric-card ${
          totalGrowth >= 0
            ? 'bg-success-50 dark:bg-success-900 border-success-200 dark:border-success-700'
            : 'bg-error-50 dark:bg-error-900 border-error-200 dark:border-error-700'
        } border`}>
          <div className={`metric-value text-lg ${
            totalGrowth >= 0
              ? 'text-success-600 dark:text-success-400'
              : 'text-error-600 dark:text-error-400'
          }`}>
            {totalGrowth >= 0 ? '+' : ''}{totalGrowth.toFixed(1)}%
          </div>
          <div className="metric-label">Dönem Büyümesi</div>
        </div>

        <div className="metric-card bg-warning-50 dark:bg-warning-900 border border-warning-200 dark:border-warning-700">
          <div className="metric-value text-warning-600 dark:text-warning-400 text-lg">
            {data.reduce((sum, item) => sum + item.haftalikIslemSayisi, 0).toLocaleString('tr-TR')}
          </div>
          <div className="metric-label">Toplam İşlem</div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: '400px' }}>
        <Line 
          ref={chartRef}
          data={chartData} 
          options={options} 
        />
      </div>

      {/* Data Info */}
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          📊 <strong>{data.length}</strong> haftalık veri | 
          📅 <strong>{labels[0]}</strong> - <strong>{labels[labels.length - 1]}</strong> dönemi
        </div>
      </div>
    </div>
  );
};

export default TrendChart;