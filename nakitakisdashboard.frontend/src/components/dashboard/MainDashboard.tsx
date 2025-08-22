// src/components/dashboard/MainDashboard.tsx
import React, { useState } from 'react';
import VariableSelector from '../filters/VariableSelector';
import AnalysisCard from './AnalysisCard';
import TrendChart from '../charts/TrendChart';
import { useHealthCheck, useSimpleTrends } from '../../hooks/useApi';

interface DashboardSelection {
  kaynakKurulus: string;
  fonNo: string;
  ihracNo: string;
  faizOrani: number | null;
}

const MainDashboard: React.FC = () => {
  const [selection, setSelection] = useState<DashboardSelection>({
    kaynakKurulus: '',
    fonNo: '',
    ihracNo: '',
    faizOrani: null
  });

  const [activeTab, setActiveTab] = useState<'analysis' | 'trends' | 'export'>('analysis');

  const { data: healthData, loading: healthLoading, error: healthError } = useHealthCheck();
  
  // Trends data - sadece kuruluş seçildiğinde çek
  const { data: trendsData, loading: trendsLoading } = useSimpleTrends(
    selection.kaynakKurulus,
    'week',
    selection.fonNo,
    selection.ihracNo,
    50
  );

  const handleSelectionChange = (newSelection: DashboardSelection) => {
    setSelection(newSelection);
  };

  const isAnalysisReady = selection.kaynakKurulus && selection.faizOrani;
  const isTrendsReady = selection.kaynakKurulus;

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
                v2.0 - Clean React
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

          {/* Variable Selector */}
          <VariableSelector onSelectionChange={handleSelectionChange} />

          {/* Tab Navigation */}
          {selection.kaynakKurulus && (
            <div className="card">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('analysis')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'analysis'
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    💰 Nakit Akış Analizi
                    {!isAnalysisReady && <span className="ml-2 text-warning-500">⚠️</span>}
                  </button>
                  <button
                    onClick={() => setActiveTab('trends')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'trends'
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    📈 Trend Analizi
                    {isTrendsReady && <span className="ml-2 text-success-500">✅</span>}
                  </button>
                  <button
                    onClick={() => setActiveTab('export')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'export'
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    📥 Export & Raporlar
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="py-6">
                {activeTab === 'analysis' && (
                  <>
                    {isAnalysisReady ? (
                      <AnalysisCard
                        kaynakKurulus={selection.kaynakKurulus}
                        fonNo={selection.fonNo}
                        ihracNo={selection.ihracNo}
                        faizOrani={selection.faizOrani!}
                      />
                    ) : (
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
                    )}
                  </>
                )}

                {activeTab === 'trends' && (
                  <>
                    {isTrendsReady ? (
                      <div className="space-y-6">
                        <TrendChart
                          data={trendsData?.data || []}
                          loading={trendsLoading}
                          kaynakKurulus={selection.kaynakKurulus}
                          title="Haftalık Trend Analizi"
                        />
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Trend Analizi
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          Trend analizi için kuruluş seçimi yeterlidir
                        </p>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'export' && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 dark:text-gray-500 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Export İşlevselliği
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      PDF ve Excel export özellikleri yakında eklenecek
                    </p>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      🔄 Geliştirme aşamasında...
                    </div>
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

          {/* Current Selection Summary */}
          {selection.kaynakKurulus && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                📋 Aktif Seçim Özeti
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="p-3 bg-primary-50 dark:bg-primary-900 rounded-lg border border-primary-200 dark:border-primary-700">
                  <div className="font-medium text-primary-700 dark:text-primary-300">🏢 Kaynak Kuruluş</div>
                  <div className="text-primary-900 dark:text-primary-100 font-semibold">{selection.kaynakKurulus}</div>
                </div>
                
                {selection.fonNo && (
                  <div className="p-3 bg-success-50 dark:bg-success-900 rounded-lg border border-success-200 dark:border-success-700">
                    <div className="font-medium text-success-700 dark:text-success-300">💼 Fon Numarası</div>
                    <div className="text-success-900 dark:text-success-100 font-semibold">{selection.fonNo}</div>
                  </div>
                )}
                
                {selection.ihracNo && (
                  <div className="p-3 bg-warning-50 dark:bg-warning-900 rounded-lg border border-warning-200 dark:border-warning-700">
                    <div className="font-medium text-warning-700 dark:text-warning-300">🎯 İhraç Numarası</div>
                    <div className="text-warning-900 dark:text-warning-100 font-semibold">{selection.ihracNo}</div>
                  </div>
                )}
                
                {selection.faizOrani && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-900 rounded-lg border border-purple-200 dark:border-purple-700">
                    <div className="font-medium text-purple-700 dark:text-purple-300">📊 Faiz Oranı</div>
                    <div className="text-purple-900 dark:text-purple-100 font-semibold">%{selection.faizOrani.toFixed(2)}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* System Status */}
          {healthData && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                ⚡ Sistem Durumu
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MainDashboard;