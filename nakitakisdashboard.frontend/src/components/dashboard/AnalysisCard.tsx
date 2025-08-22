import React, { useState } from 'react';
import { useManualApi } from '../../hooks/useApi';
import ApiService from '../../services/api';
import Loading from '../ui/Loading';
import { ApiResponse, AnalysisResponse, AnalysisRequest } from '../../types/api';

interface AnalysisCardProps {
  kaynakKurulus: string;
  fonNo: string;
  ihracNo: string;
  faizOrani: number;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({
  kaynakKurulus,
  fonNo,
  ihracNo,
  faizOrani
}) => {
  // TİP GÜVENLİĞİ İLE HOOK KULLANIMI
  const { data: analysisData, loading, error, execute } = useManualApi<ApiResponse<AnalysisResponse>>();
  const [lastCalculatedWith, setLastCalculatedWith] = useState<AnalysisRequest | null>(null);

  const handleCalculate = async () => {
    try {
      const request: AnalysisRequest = {
        kaynakKurulus,
        faizOrani,
        ...(fonNo && { fonNo }),
        ...(ihracNo && { ihracNo })
      };

      await execute(() => ApiService.calculateAnalysis(request));
      setLastCalculatedWith(request);
    } catch (error) {
      console.error('Analysis calculation failed:', error);
    }
  };

  const canCalculate = kaynakKurulus && faizOrani > 0;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          💰 Nakit Akış Analizi
        </h3>
        <button
          onClick={handleCalculate}
          disabled={!canCalculate || loading}
          className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
            canCalculate && !loading
              ? 'btn-primary hover:shadow-lg transform hover:-translate-y-0.5'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loading size="sm" />
              <span>Hesaplanıyor...</span>
            </div>
          ) : (
            '🔄 Analizi Hesapla'
          )}
        </button>
      </div>

      {/* Analysis Parameters */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          📊 Analiz Parametreleri:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">🏢 Kuruluş:</span>
            <div className="font-medium text-gray-900 dark:text-gray-100">{kaynakKurulus}</div>
          </div>
          {fonNo && (
            <div>
              <span className="text-gray-600 dark:text-gray-400">💼 Fon:</span>
              <div className="font-medium text-gray-900 dark:text-gray-100">{fonNo}</div>
            </div>
          )}
          {ihracNo && (
            <div>
              <span className="text-gray-600 dark:text-gray-400">🎯 İhraç:</span>
              <div className="font-medium text-gray-900 dark:text-gray-100">{ihracNo}</div>
            </div>
          )}
          <div>
            <span className="text-gray-600 dark:text-gray-400">📈 Faiz Oranı:</span>
            <div className="font-medium text-primary-600 dark:text-primary-400">%{faizOrani.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <Loading size="lg" text="Nakit akış analizi hesaplanıyor..." />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-error-100 dark:bg-error-800 border border-error-200 dark:border-error-600 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-error-600 dark:text-error-400">❌</span>
            <span className="text-error-800 dark:text-error-200 font-medium">Analiz Hatası:</span>
          </div>
          <p className="mt-1 text-error-700 dark:text-error-300 text-sm">{error}</p>
        </div>
      )}

      {/* Results - TİP GÜVENLİ ERİŞİM */}
      {!loading && !error && analysisData?.data && (
        <div className="space-y-6">
          {/* Main Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="metric-card bg-success-50 dark:bg-success-900 border border-success-200 dark:border-success-700">
              <div className="metric-value text-success-600 dark:text-success-400">
                ₺{analysisData.data.toplamFaizTutari.toLocaleString('tr-TR')}
              </div>
              <div className="metric-label">Gerçek Faiz Tutarı</div>
            </div>

            <div className="metric-card bg-primary-50 dark:bg-primary-900 border border-primary-200 dark:border-primary-700">
              <div className="metric-value text-primary-600 dark:text-primary-400">
                ₺{analysisData.data.toplamModelFaizTutari.toLocaleString('tr-TR')}
              </div>
              <div className="metric-label">Model Faiz Tutarı</div>
            </div>

            <div className={`metric-card ${
              analysisData.data.farkTutari >= 0
                ? 'bg-success-50 dark:bg-success-900 border-success-200 dark:border-success-700'
                : 'bg-error-50 dark:bg-error-900 border-error-200 dark:border-error-700'
            } border`}>
              <div className={`metric-value ${
                analysisData.data.farkTutari >= 0
                  ? 'text-success-600 dark:text-success-400'
                  : 'text-error-600 dark:text-error-400'
              }`}>
                ₺{analysisData.data.farkTutari.toLocaleString('tr-TR')}
              </div>
              <div className="metric-label">Fark Tutarı</div>
              <div className={`metric-change ${analysisData.data.farkTutari >= 0 ? 'positive' : 'negative'}`}>
                {analysisData.data.farkYuzdesi >= 0 ? '+' : ''}{analysisData.data.farkYuzdesi.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              📋 Performans Özeti
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">💡 Performans Durumu:</span>
                <div className={`font-medium ${
                  analysisData.data.farkYuzdesi >= 10 ? 'text-success-600 dark:text-success-400' :
                  analysisData.data.farkYuzdesi >= 0 ? 'text-warning-600 dark:text-warning-400' :
                  'text-error-600 dark:text-error-400'
                }`}>
                  {analysisData.data.farkYuzdesi >= 10 ? '🌟 Mükemmel' :
                   analysisData.data.farkYuzdesi >= 5 ? '✅ İyi' :
                   analysisData.data.farkYuzdesi >= 0 ? '📊 Orta' :
                   analysisData.data.farkYuzdesi >= -5 ? '⚠️ Zayıf' : '🔴 Çok Zayıf'}
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">🎯 Önerilen Aksiyon:</span>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {analysisData.data.farkYuzdesi >= 0 
                    ? '✅ Mevcut stratejiye devam'
                    : '🔍 Faiz stratejisi gözden geçir'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Calculation Info */}
          {lastCalculatedWith && (
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              📅 Hesaplama Zamanı: {new Date(analysisData.data.calculatedAt).toLocaleString('tr-TR')}
            </div>
          )}
        </div>
      )}

      {/* Empty State - No calculation yet */}
      {!loading && !error && !analysisData && (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Analiz Bekleniyor
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Nakit akış analizini başlatmak için yukarıdaki butona tıklayın
          </p>
          {!canCalculate && (
            <p className="text-sm text-warning-600 dark:text-warning-400">
              ⚠️ Analiz için gerekli parametreler: Kaynak Kuruluş ve Faiz Oranı
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalysisCard;