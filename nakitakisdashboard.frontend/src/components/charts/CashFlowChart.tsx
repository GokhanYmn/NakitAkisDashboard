import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
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
} from 'chart.js';
import { CashFlowDataPoint } from '../../types/api';
import { useManualCashFlow } from '../../hooks/useApi';
import Loading from '../ui/Loading';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CashFlowChartProps {
  initialPeriod?: string;
  limit?: number;
}

type MetricType = 'anapara' | 'kazanc' | 'verimlilik' | 'performance';

const CashFlowChart: React.FC<CashFlowChartProps> = ({ 
  initialPeriod = 'month',
  limit = 100 
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>(initialPeriod);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('kazanc');
  
  const { data, loading, error, fetchCashFlow } = useManualCashFlow();

  // Initial load
  useEffect(() => {
    fetchCashFlow(selectedPeriod, limit);
  }, [selectedPeriod, limit, fetchCashFlow]);

  // Period change handler
  const handlePeriodChange = async (period: string) => {
    setSelectedPeriod(period);
    await fetchCashFlow(period, limit);
  };

  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <Loading size="lg" text="Cash Flow verileri yükleniyor..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          💹 Cash Flow Analizi
        </h3>
        <div className="p-4 bg-error-100 dark:bg-error-800 border border-error-200 dark:border-error-600 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-error-600 dark:text-error-400">❌</span>
            <span className="text-error-800 dark:text-error-200 font-medium">Cash Flow Hatası:</span>
          </div>
          <p className="mt-1 text-error-700 dark:text-error-300 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          💹 Cash Flow Analizi
        </h3>
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Cash Flow Verisi Bulunamadı
          </h4>
          <p className="text-gray-600 dark:text-gray-400">
            Seçili periyot için cash flow analiz verisi mevcut değil
          </p>
        </div>
      </div>
    );
  }

  const cashFlowData = data.data;

  // Chart labels - period'a göre format
  const labels = cashFlowData.map((item: CashFlowDataPoint) => {
    const date = new Date(item.tarih);
    
    switch (selectedPeriod) {
      case 'day':
        return date.toLocaleDateString('tr-TR', { 
          day: '2-digit', 
          month: '2-digit'
        });
      case 'week':
        return date.toLocaleDateString('tr-TR', { 
          day: '2-digit', 
          month: '2-digit'
        }) + ' Hf';
      case 'month':
        return date.toLocaleDateString('tr-TR', { 
          month: '2-digit',
          year: '2-digit'
        });
      case 'quarter':
        return `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
      case 'year':
        return date.getFullYear().toString();
      default:
        return date.toLocaleDateString('tr-TR');
    }
  });

  // Chart data sets based on selected metric
  const getChartData = () => {
    switch (selectedMetric) {
      case 'anapara':
        return {
          labels,
          datasets: [
            {
              label: '💰 Toplam Anapara (₺)',
              data: cashFlowData.map((item: CashFlowDataPoint) => item.totalAnapara),
              borderColor: '#6c757d',
              backgroundColor: 'rgba(108, 117, 125, 0.1)',
              borderWidth: 3,
              pointBackgroundColor: '#6c757d',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8,
              fill: true,
              tension: 0.4
            }
          ]
        };

      case 'kazanc':
        return {
          labels,
          datasets: [
            {
              label: '💰 Basit Faiz Kazancı (₺)',
              data: cashFlowData.map((item: CashFlowDataPoint) => item.totalFaizKazanci),
              borderColor: '#28a745',
              backgroundColor: 'rgba(40, 167, 69, 0.1)',
              borderWidth: 3,
              pointBackgroundColor: '#28a745',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8,
              fill: false,
              tension: 0.4
            },
            {
              label: '🎯 Model Faiz Kazancı (₺)',
              data: cashFlowData.map((item: CashFlowDataPoint) => item.totalModelFaizKazanci),
              borderColor: '#007bff',
              backgroundColor: 'rgba(0, 123, 255, 0.1)',
              borderWidth: 3,
              pointBackgroundColor: '#007bff',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8,
              fill: false,
              tension: 0.4
            },
            {
              label: '📊 TLREF Faiz Kazancı (₺)',
              data: cashFlowData.map((item: CashFlowDataPoint) => item.totalTlrefKazanci),
              borderColor: '#6f42c1',
              backgroundColor: 'rgba(111, 66, 193, 0.1)',
              borderWidth: 3,
              pointBackgroundColor: '#6f42c1',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8,
              fill: false,
              tension: 0.4
            }
          ]
        };

      case 'verimlilik':
        return {
          labels,
          datasets: [
            {
              label: '💰 Basit Faiz Verimlilik (%)',
              data: cashFlowData.map((item: CashFlowDataPoint) => item.basitFaizYieldPercentage || 0),
              borderColor: '#28a745',
              backgroundColor: 'rgba(40, 167, 69, 0.1)',
              borderWidth: 3,
              pointBackgroundColor: '#28a745',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8,
              fill: false,
              tension: 0.4
            },
            {
              label: '🎯 Model Faiz Verimlilik (%)',
              data: cashFlowData.map((item: CashFlowDataPoint) => item.modelFaizYieldPercentage || 0),
              borderColor: '#007bff',
              backgroundColor: 'rgba(0, 123, 255, 0.1)',
              borderWidth: 3,
              pointBackgroundColor: '#007bff',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8,
              fill: false,
              tension: 0.4
            },
            {
              label: '📊 TLREF Faiz Verimlilik (%)',
              data: cashFlowData.map((item: CashFlowDataPoint) => item.tlrefFaizYieldPercentage || 0),
              borderColor: '#6f42c1',
              backgroundColor: 'rgba(111, 66, 193, 0.1)',
              borderWidth: 3,
              pointBackgroundColor: '#6f42c1',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8,
              fill: false,
              tension: 0.4
            }
          ]
        };

      case 'performance':
        return {
          labels,
          datasets: [
            {
              label: '📈 Basit vs Model Performans (%)',
              data: cashFlowData.map((item: CashFlowDataPoint) => item.basitVsModelPerformance),
              borderColor: '#fd7e14',
              backgroundColor: 'rgba(253, 126, 20, 0.1)',
              borderWidth: 3,
              pointBackgroundColor: '#fd7e14',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8,
              fill: false,
              tension: 0.4
            },
            {
              label: '📊 Basit vs TLREF Performans (%)',
              data: cashFlowData.map((item: CashFlowDataPoint) => item.basitVsTlrefPerformance),
              borderColor: '#dc3545',
              backgroundColor: 'rgba(220, 53, 69, 0.1)',
              borderWidth: 3,
              pointBackgroundColor: '#dc3545',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8,
              fill: false,
              tension: 0.4
            }
          ]
        };
    }
  };

  const chartOptions: ChartOptions<'line'> = {
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
        text: selectedMetric === 'anapara' 
          ? '💰 Cash Flow Analizi - Anapara Dağılımı'
          : selectedMetric === 'kazanc'
          ? '💹 Cash Flow Analizi - Faiz Kazançları'
          : selectedMetric === 'verimlilik'
          ? '📊 Cash Flow Analizi - Anapara Verimliliği (%)'
          : '📊 Cash Flow Analizi - Performans Karşılaştırma',
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
        displayColors: true,
        callbacks: {
          title: function(context: any) {
            try {
              const dataIndex = context[0].dataIndex;
              const item = cashFlowData[dataIndex];
              const recordCount = item?.recordCount || 0;
              
              const date = new Date(item.tarih);
              let dateStr = '';
              
              switch (selectedPeriod) {
                case 'day':
                  dateStr = date.toLocaleDateString('tr-TR', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric' 
                  });
                  break;
                case 'week':
                  dateStr = date.toLocaleDateString('tr-TR', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric' 
                  }) + ' Haftası';
                  break;
                case 'month':
                  dateStr = date.toLocaleDateString('tr-TR', { 
                    month: 'long', 
                    year: 'numeric' 
                  });
                  break;
                default:
                  dateStr = date.toLocaleDateString('tr-TR');
              }
              
              return `📅 ${dateStr} (${recordCount} kayıt)`;
            } catch (error) {
              console.error('Tooltip title error:', error);
              return '📅 Tarih bilgisi yüklenemiyor';
            }
          },
          beforeBody: function(context: any) {
            try {
              const dataIndex = context[0].dataIndex;
              const item = cashFlowData[dataIndex];
              
              if (!item) return [];
              
              const tooltipLines = [
                `💰 Anapara: ₺${(item.totalAnapara || 0).toLocaleString('tr-TR')}`
              ];
              
              if (item.avgBasitFaiz !== undefined && item.avgBasitFaiz !== null && !isNaN(item.avgBasitFaiz)) {
                tooltipLines.push(`🟢 Basit Faiz Oranı: %${item.avgBasitFaiz.toFixed(4)}`);
              }
              
              if (item.avgModelNemaOrani !== undefined && item.avgModelNemaOrani !== null && !isNaN(item.avgModelNemaOrani)) {
                tooltipLines.push(`📊 Model Nema: %${item.avgModelNemaOrani.toFixed(4)}`);
              }
              
              if (item.avgTlrefFaiz !== undefined && item.avgTlrefFaiz !== null && !isNaN(item.avgTlrefFaiz)) {
                tooltipLines.push(`📈 TLREF Oranı: %${(item.avgTlrefFaiz * 100).toFixed(4)}`);
              }
              
              return tooltipLines;
            } catch (error) {
              console.error('Tooltip beforeBody error:', error);
              return ['💰 Veri bilgisi yüklenemiyor'];
            }
          },
          label: function(context: any) {
            try {
              const value = context.parsed.y || 0;
              
              if (selectedMetric === 'anapara' || selectedMetric === 'kazanc') {
                return `${context.dataset.label}: ₺${value.toLocaleString('tr-TR')}`;
              } else {
                return `${context.dataset.label}: %${value.toFixed(2)}`;
              }
            } catch (error) {
              console.error('Tooltip label error:', error);
              return `${context.dataset.label}: Veri hatası`;
            }
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: `📅 ${selectedPeriod === 'day' ? 'Günlük' : selectedPeriod === 'week' ? 'Haftalık' : selectedPeriod === 'month' ? 'Aylık' : selectedPeriod === 'quarter' ? 'Çeyreklik' : 'Yıllık'} Periyotlar`,
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
          text: selectedMetric === 'anapara' 
            ? '💰 Anapara (₺)'
            : selectedMetric === 'kazanc' 
            ? '💰 Faiz Kazancı (₺)'
            : '📊 Oran (%)',
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
            if (selectedMetric === 'performance' || selectedMetric === 'verimlilik') {
              return '%' + value.toFixed(1);
            } else {
              return '₺' + value.toLocaleString('tr-TR');
            }
          }
        }
      }
    }
  };

  // Summary statistics
  const totalBasitKazanc = cashFlowData.reduce((sum: number, item: CashFlowDataPoint) => sum + (item.totalFaizKazanci || 0), 0);
  const totalModelKazanc = cashFlowData.reduce((sum: number, item: CashFlowDataPoint) => sum + (item.totalModelFaizKazanci || 0), 0);
  const totalTlrefKazanc = cashFlowData.reduce((sum: number, item: CashFlowDataPoint) => sum + (item.totalTlrefKazanci || 0), 0);
  const avgModelPerformance = cashFlowData.reduce((sum: number, item: CashFlowDataPoint) => sum + (item.basitVsModelPerformance || 0), 0) / cashFlowData.length;
  const totalAnapara = cashFlowData.reduce((sum: number, item: CashFlowDataPoint) => sum + (item.totalAnapara || 0), 0);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          💹 Cash Flow Analizi
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {cashFlowData.length} veri noktası
        </div>
      </div>

      {/* Period Selector */}
      <div className="mb-6 flex flex-wrap gap-4 justify-center">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            📅 Periyot:
          </label>
          <select 
            value={selectedPeriod}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="select-field"
          >
            <option value="day">📆 Günlük</option>
            <option value="week">📅 Haftalık</option>
            <option value="month">📊 Aylık</option>
            <option value="quarter">📈 Çeyreklik</option>
            <option value="year">📋 Yıllık</option>
          </select>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="mb-6 flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => setSelectedMetric('anapara')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            selectedMetric === 'anapara'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          💰 Anapara
        </button>
        <button
          onClick={() => setSelectedMetric('kazanc')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            selectedMetric === 'kazanc'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          💹 Faiz Kazançları
        </button>
        <button
          onClick={() => setSelectedMetric('verimlilik')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            selectedMetric === 'verimlilik'
              ? 'bg-warning-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          📊 Verimlilik (%)
        </button>
        <button
          onClick={() => setSelectedMetric('performance')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            selectedMetric === 'performance'
              ? 'bg-success-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          📈 Performans (%)
        </button>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="metric-card bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="metric-value text-gray-600 dark:text-gray-400 text-lg">
            ₺{totalAnapara.toLocaleString('tr-TR')}
          </div>
          <div className="metric-label">Toplam Anapara</div>
        </div>
        
        <div className="metric-card bg-success-50 dark:bg-success-900 border border-success-200 dark:border-success-700">
          <div className="metric-value text-success-600 dark:text-success-400 text-lg">
            ₺{totalBasitKazanc.toLocaleString('tr-TR')}
          </div>
          <div className="metric-label">Basit Faiz Kazancı</div>
        </div>

        <div className="metric-card bg-primary-50 dark:bg-primary-900 border border-primary-200 dark:border-primary-700">
          <div className="metric-value text-primary-600 dark:text-primary-400 text-lg">
            ₺{totalModelKazanc.toLocaleString('tr-TR')}
          </div>
          <div className="metric-label">Model Faiz Kazancı</div>
        </div>

        <div className="metric-card bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700">
          <div className="metric-value text-purple-600 dark:text-purple-400 text-lg">
            ₺{totalTlrefKazanc.toLocaleString('tr-TR')}
          </div>
          <div className="metric-label">TLREF Faiz Kazancı</div>
        </div>

        <div className={`metric-card ${
          avgModelPerformance >= 0
            ? 'bg-success-50 dark:bg-success-900 border-success-200 dark:border-success-700'
            : 'bg-error-50 dark:bg-error-900 border-error-200 dark:border-error-700'
        } border`}>
          <div className={`metric-value text-lg ${
            avgModelPerformance >= 0
              ? 'text-success-600 dark:text-success-400'
              : 'text-error-600 dark:text-error-400'
          }`}>
            {avgModelPerformance >= 0 ? '+' : ''}{avgModelPerformance.toFixed(1)}%
          </div>
          <div className="metric-label">Ort. Model Performans</div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: '400px' }}>
        <Line data={getChartData()!} options={chartOptions} />
      </div>

      {/* Data Info */}
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          💹 <strong>{cashFlowData.length}</strong> {selectedPeriod === 'day' ? 'günlük' : selectedPeriod === 'week' ? 'haftalık' : selectedPeriod === 'month' ? 'aylık' : selectedPeriod === 'quarter' ? 'çeyreklik' : 'yıllık'} veri gösteriliyor | 
          📅 <strong>{labels[0]}</strong> - <strong>{labels[labels.length - 1]}</strong> dönemi |
          📊 Toplam kayıt: <strong>{cashFlowData.reduce((sum: number, item: CashFlowDataPoint) => sum + (item.recordCount || 0), 0).toLocaleString('tr-TR')}</strong>
        </div>
      </div>
    </div>
  );
};

export default CashFlowChart;