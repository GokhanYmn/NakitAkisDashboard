// src/components/dashboard/MainDashboard.tsx

import React, { useState } from 'react';
import VariableSelector from '../filters/VariableSelector';
import AnalysisCard from './AnalysisCard';
import { useHealthCheck } from '../../hooks/useApi';

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

  const { data: healthData, loading: healthLoading, error: healthError } = useHealthCheck();

  const handleSelectionChange = (newSelection: DashboardSelection) => {
    setSelection(newSelection);
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

          {/* Analysis Section */}
          {selection.kaynakKurulus && selection.faizOrani && (
            <AnalysisCard
              kaynakKurulus={selection.kaynakKurulus}
              fonNo={selection.fonNo}
              ihracNo={selection.ihracNo}
              faizOrani={selection.faizOrani}
            />
          )}

          {/* Info Cards - Show when no analysis is ready */}
          {(!selection.kaynakKurulus || !selection.faizOrani) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="metric-card">
                <div className="metric-value text-primary-600">🏢</div>
                <div className="metric-label">Kaynak Kuruluş</div>
                <div className="metric-change">
                  {selection.kaynakKurulus ? '✅ Seçildi' : '⏳ Seçim Bekleniyor'}
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-value text-warning-600">📊</div>
                <div className="metric-label">Faiz Oranı</div>
                <div className="metric-change">
                  {selection.faizOrani ? `✅ %${selection.faizOrani}` : '⏳ Giriş Bekleniyor'}
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-value text-success-600">🔄</div>
                <div className="metric-label">Analiz Durumu</div>
                <div className="metric-change">
                  {(selection.kaynakKurulus && selection.faizOrani) ? '✅ Hazır' : '⏳ Parametreler Eksik'}
                </div>
              </div>
            </div>
          )}

          {/* Features Overview */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              🚀 Dashboard Özellikleri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl mb-2">💰</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Nakit Akış Analizi</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Real-time hesaplama</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Performans Metrikleri</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Detaylı raporlama</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Akıllı Filtreler</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Hiyerarşik seçim</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl mb-2">📥</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Export İşlemleri</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">PDF & Excel çıktı</div>
              </div>
            </div>
          </div>

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

          {/* Quick Stats */}
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