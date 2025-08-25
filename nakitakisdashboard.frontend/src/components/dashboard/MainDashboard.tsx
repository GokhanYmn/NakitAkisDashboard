import React, { useState, useCallback } from 'react';
import AdvancedVariableSelector from '../filters/AdvancedVariableSelector';
import AnalysisCard from './AnalysisCard';
import TrendChart from '../charts/TrendChart';
import CashFlowChart from '../charts/CashFlowChart';
import ExportMenu from '../ui/ExportMenu';
import { useHealthCheck, useSimpleTrends } from '../../hooks/useApi';

// Debug Panel - sadece development için
const DebugPanel = React.lazy(() => import('../debug/DebugPanel'));

interface DashboardSelection {
  dashboardType: string;
  kaynakKurulus: string;
  fonNo: string;
  ihracNo: string;
  faizOrani: number | null;
}

const MainDashboard: React.FC = () => {
  const [selection, setSelection] = useState<DashboardSelection>({
    dashboardType: 'analysis',
    kaynakKurulus: '',
    fonNo: '',
    ihracNo: '',
    faizOrani: null
  });

  const { data: healthData, loading: healthLoading, error: healthError } = useHealthCheck();
  
  // Trends data - sadece kuruluş seçildiğinde çek
  const { data: trendsData, loading: trendsLoading } = useSimpleTrends(
    selection.kaynakKurulus,
    'week',
    selection.fonNo,
    selection.ihracNo,
    50
  );

  const handleSelectionChange = useCallback((newSelection: DashboardSelection) => {
    console.log('Selection changed:', newSelection); // Debug için
    setSelection(newSelection);
  }, []);

  // Validation helpers
  const isAnalysisReady = selection.kaynakKurulus && selection.faizOrani;
  const isTrendsReady = selection.kaynakKurulus;
  const isCashFlowReady = selection.kaynakKurulus;
  const isComparisonReady = selection.kaynakKurulus;

  // Dashboard content renderer
  const renderDashboardContent = () => {
    if (!selection.kaynakKurulus) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            🎯 Dashboard Hazır!
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Lütfen yukarıdan <strong>Kaynak Kuruluş</strong> seçin.
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <strong>Kullanılabilir Dashboard'lar:</strong><br />
            💰 Nakit Akış Analizi<br />
            📈 Haftalık Trend Analizi<br />
            💹 Cash Flow Analizi<br />
            ⚖️ Kuruluş Karşılaştırma
          </div>
        </div>
      );
    }

    switch (selection.dashboardType) {
      case 'analysis':
        if (!isAnalysisReady) {
          return (
            <div className="text-center py-12">
              <div className="text-warning-600 dark:text-warning-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Faiz Oranı Gerekli
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Nakit akış analizi için lütfen <strong>faiz oranını</strong> girin
              </p>
            </div>
          );
        }
        return (
          <div className="space-y-6">
            <AnalysisCard
              kaynakKurulus={selection.kaynakKurulus}
              fonNo={selection.fonNo}
              ihracNo={selection.ihracNo}
              faizOrani={selection.faizOrani!}
            />
            
            {/* Additional Export Menu for Analysis Results */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  📥 Analiz Raporu Export
                </h4>
                <ExportMenu
                  filters={{
                    kaynakKurulus: selection.kaynakKurulus,
                    fonNo: selection.fonNo,
                    ihracNo: selection.ihracNo,
                    faizOrani: selection.faizOrani!
                  }}
                />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <span>📋</span>
                    <span><strong>Basit:</strong> Temel sonuçlar</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>📊</span>
                    <span><strong>Detaylı:</strong> İstatistik + breakdown</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>📈</span>
                    <span><strong>Tam:</strong> Görseller + öneriler</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'trends':
        if (!isTrendsReady) {
          return (
            <div className="text-center py-12">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Trend Analizi
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Trend analizi için kuruluş seçimi yeterlidir
              </p>
            </div>
          );
        }
        return (
          <TrendChart
            data={trendsData?.data || []}
            loading={trendsLoading}
            kaynakKurulus={selection.kaynakKurulus}
            title="Haftalık Trend Analizi"
          />
        );

      case 'cash-flow':
        if (!isCashFlowReady) {
          return (
            <div className="text-center py-12">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Cash Flow Analizi
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Cash flow analizi için kuruluş seçimi yeterlidir
              </p>
            </div>
          );
        }
        return <CashFlowChart initialPeriod="month" limit={100} />;

      case 'comparison':
        if (!isComparisonReady) {
          return (
            <div className="text-center py-12">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Kuruluş Karşılaştırma
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Karşılaştırma analizi için kuruluş seçimi yeterlidir
              </p>
            </div>
          );
        }
        return (
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              ⚖️ Kuruluş Karşılaştırma
            </h3>
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Karşılaştırma İşlevselliği
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Kuruluş karşılaştırma özelliği yakında eklenecek
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                🔄 Geliştirme aşamasında...
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Bilinmeyen Dashboard Türü
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Dashboard türü: {selection.dashboardType}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-soft border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gradient-primary">
                💰 Nakit Akış Dashboard
              </h1>
              <span className="ml-3 badge-info">
                v2.0 - Advanced
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {/* API Health Status */}
              <div className="flex items-center space-x-2">
                {healthLoading ? (
                  <div className="w-2 h-2 bg-warning-500 rounded-full animate-pulse"></div>
                ) : healthError ? (
                  <div className="w-2 h-2 bg-error-500 rounded-full"></div>
                ) : healthData ? (
                  <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                ) : (
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {healthLoading ? 'Bağlanıyor...' :
                   healthError ? 'API Bağlantı Hatası' :
                   healthData ? 'API Bağlı' : 'Durum Bilinmiyor'}
                </span>
              </div>
              
              <span className="text-sm text-gray-500 dark:text-gray-400">
                🚀 Grafana-Free Analytics
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* API Status Banner - Only show if there's an error */}
          {healthError && (
            <div className="p-4 bg-error-100 dark:bg-error-800 border border-error-200 dark:border-error-600 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-error-600 dark:text-error-400">⚠️</span>
                <span className="text-error-800 dark:text-error-200 font-medium">
                  Backend API'ye bağlanamıyor
                </span>
              </div>
              <p className="mt-1 text-error-700 dark:text-error-300 text-sm">
                Lütfen backend sunucusunun çalıştığından emin olun: http://localhost:7289
              </p>
            </div>
          )}

          {/* Advanced Variable Selector */}
          <AdvancedVariableSelector onSelectionChange={handleSelectionChange} />

          {/* Dashboard Content */}
          <div className="card">
            {renderDashboardContent()}
          </div>

          {/* Current Selection Summary */}
          {selection.kaynakKurulus && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                📋 Aktif Seçim Özeti
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="p-3 bg-primary-50 dark:bg-primary-900 rounded-lg border border-primary-200 dark:border-primary-700">
                  <div className="font-medium text-primary-700 dark:text-primary-300">📊 Dashboard</div>
                  <div className="text-primary-900 dark:text-primary-100 font-semibold">
                    {selection.dashboardType === 'analysis' && '💰 Nakit Akış Analizi'}
                    {selection.dashboardType === 'trends' && '📈 Haftalık Trend'}
                    {selection.dashboardType === 'cash-flow' && '💹 Cash Flow'}
                    {selection.dashboardType === 'comparison' && '⚖️ Karşılaştırma'}
                  </div>
                </div>
                
                <div className="p-3 bg-success-50 dark:bg-success-900 rounded-lg border border-success-200 dark:border-success-700">
                  <div className="font-medium text-success-700 dark:text-success-300">🏢 Kaynak Kuruluş</div>
                  <div className="text-success-900 dark:text-success-100 font-semibold">{selection.kaynakKurulus}</div>
                </div>
                
                {selection.fonNo && (
                  <div className="p-3 bg-warning-50 dark:bg-warning-900 rounded-lg border border-warning-200 dark:border-warning-700">
                    <div className="font-medium text-warning-700 dark:text-warning-300">💼 Fon Numarası</div>
                    <div className="text-warning-900 dark:text-warning-100 font-semibold">{selection.fonNo}</div>
                  </div>
                )}
                
                {selection.ihracNo && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-900 rounded-lg border border-purple-200 dark:border-purple-700">
                    <div className="font-medium text-purple-700 dark:text-purple-300">🎯 İhraç Numarası</div>
                    <div className="text-purple-900 dark:text-purple-100 font-semibold">{selection.ihracNo}</div>
                  </div>
                )}
                
                {selection.faizOrani && (
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900 rounded-lg border border-indigo-200 dark:border-indigo-700">
                    <div className="font-medium text-indigo-700 dark:text-indigo-300">📊 Faiz Oranı</div>
                    <div className="text-indigo-900 dark:text-indigo-100 font-semibold">%{selection.faizOrani.toFixed(2)}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Stats - Show when no selection */}
          {!selection.kaynakKurulus && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="metric-card">
                <div className="metric-value text-primary-600">🏢</div>
                <div className="metric-label">Kaynak Kuruluş</div>
                <div className="metric-change">
                  ⏳ Seçim Bekleniyor
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-value text-warning-600">📊</div>
                <div className="metric-label">Dashboard</div>
                <div className="metric-change">
                  🎯 Hazır
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-value text-success-600">🔄</div>
                <div className="metric-label">API Durumu</div>
                <div className="metric-change">
                  {healthData ? '✅ Bağlı' : '⏳ Kontrol Ediliyor'}
                </div>
              </div>
            </div>
          )}

          {/* System Status */}
          {healthData && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                ⚡ Sistem Durumu
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-success-600 dark:text-success-400 font-bold text-lg">✅ Aktif</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">API Bağlantısı</div>
                </div>
                <div className="text-center">
                  <div className="text-primary-600 dark:text-primary-400 font-bold text-lg">🚀 v2.0</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Dashboard Sürümü</div>
                </div>
                <div className="text-center">
                  <div className="text-warning-600 dark:text-warning-400 font-bold text-lg">⚡ Hazır</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Analiz Motoru</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-600 dark:text-purple-400 font-bold text-lg">🎛️ Advanced</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Variable Selector</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Debug Panel - Development Only */}
      {process.env.NODE_ENV === 'development' && (
        <React.Suspense fallback={<div>Loading debug...</div>}>
          <DebugPanel />
        </React.Suspense>
      )}
    </div>
  );
};

export default MainDashboard;