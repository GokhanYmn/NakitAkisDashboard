import React, { useState } from 'react';
import { AnalysisRequest } from '../../types/api';
import ApiService from '../../services/api';
import Loading from './Loading';

interface ExportMenuProps {
  analysisData?: any;
  filters: {
    kaynakKurulus: string;
    fonNo: string;
    ihracNo: string;
    faizOrani: number;
  };
  disabled?: boolean;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ 
  analysisData, 
  filters, 
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const exportLevels = [
    {
      id: 'basic',
      name: '📋 Basit Özet',
      description: 'Temel analiz sonuçları',
      icon: '📋'
    },
    {
      id: 'detailed',
      name: '📊 Detaylı Analiz', 
      description: 'İstatistikler + breakdown',
      icon: '📊'
    },
    {
      id: 'full',
      name: '📈 Tam Rapor',
      description: 'Görseller + öneriler + trendler',
      icon: '📈'
    }
  ];

  const handlePdfExport = async (level: string) => {
    if (!filters.kaynakKurulus || !filters.faizOrani) {
      alert('PDF export için Kaynak Kuruluş ve Faiz Oranı gereklidir.');
      return;
    }

    setLoading(level);
    try {
      console.log(`PDF Export başlatılıyor: ${level} level`);
      
      const analysisRequest: AnalysisRequest = {
        faizOrani: filters.faizOrani,
        kaynakKurulus: filters.kaynakKurulus,
        ...(filters.fonNo && { fonNo: filters.fonNo }),
        ...(filters.ihracNo && { ihracNo: filters.ihracNo })
      };

      const blob = await ApiService.exportAnalysis(level as any, 'pdf', analysisRequest);
      
      // Blob'ı indirilebilir dosya olarak hazırla
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Dosya adı oluştur
      const timestamp = new Date().toISOString().slice(0, 10);
      const fileName = `nakit-akis-${level}-${filters.kaynakKurulus}-${timestamp}.pdf`;
      a.download = fileName;
      
      // İndirmeyi başlat
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log(`PDF Export başarılı: ${fileName}`);
      setIsOpen(false); // Menu'yu kapat
      
    } catch (error: any) {
      console.error('PDF Export hatası:', error);
      
      let errorMessage = 'PDF export hatası';
      if (error.response?.status === 404) {
        errorMessage = 'Export endpoint bulunamadı. Backend sunucusunun çalıştığından emin olun.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server hatası. Lütfen tekrar deneyin.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`PDF Export Hatası: ${errorMessage}`);
    } finally {
      setLoading(null);
    }
  };

  const handleQuickPdfExport = async () => {
    if (!filters.kaynakKurulus || !filters.faizOrani) {
      alert('Hızlı PDF export için Kaynak Kuruluş ve Faiz Oranı gereklidir.');
      return;
    }

    setLoading('quick');
    try {
      const blob = await ApiService.quickExcelExport(
        filters.kaynakKurulus,
        filters.faizOrani,
        filters.fonNo,
        filters.ihracNo
      );
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const timestamp = new Date().toISOString().slice(0, 10);
      const fileName = `hizli-analiz-${filters.kaynakKurulus}-${timestamp}.xlsx`;
      a.download = fileName;
      
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log(`Hızlı Export başarılı: ${fileName}`);
      
    } catch (error: any) {
      console.error('Hızlı Export hatası:', error);
      alert(`Hızlı Export Hatası: ${error.message || 'Bilinmeyen hata'}`);
    } finally {
      setLoading(null);
    }
  };

  if (disabled) {
    return (
      <div className="relative">
        <button
          disabled
          className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed flex items-center space-x-2"
        >
          <span>📥</span>
          <span>Export Raporu</span>
        </button>
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          Analiz gerekli
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main Export Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-primary flex items-center space-x-2"
        disabled={loading !== null}
      >
        {loading === 'quick' ? (
          <Loading size="sm" />
        ) : (
          <span>📥</span>
        )}
        <span>Export Raporu</span>
        <span 
          className={`transform transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        >
          ▼
        </span>
      </button>

      {/* Export Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 min-w-80">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                📄 PDF Export Seçenekleri
              </h4>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            {/* Quick Export */}
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-medium text-blue-700 dark:text-blue-300">
                    ⚡ Hızlı Export
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    Temel analiz sonuçları - Excel formatı
                  </div>
                </div>
                <button
                  onClick={handleQuickPdfExport}
                  disabled={loading !== null}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading === 'quick' ? (
                    <Loading size="sm" />
                  ) : (
                    <>
                      <span>⚡</span>
                      <span>Hızlı İndir</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Detailed PDF Export Options */}
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📋 Detaylı PDF Seçenekleri:
              </div>
              
              {exportLevels.map((level) => (
                <div
                  key={level.id}
                  className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">{level.icon}</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {level.name}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {level.description}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handlePdfExport(level.id)}
                      disabled={loading !== null}
                      className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 min-w-[120px] justify-center"
                    >
                      {loading === level.id ? (
                        <Loading size="sm" />
                      ) : (
                        <>
                          <span>📄</span>
                          <span>PDF İndir</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Info Note */}
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <div className="flex items-start space-x-2">
                <span className="text-yellow-600 dark:text-yellow-400">💡</span>
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <div className="font-medium mb-1">Export Bilgileri:</div>
                  <ul className="text-xs space-y-1">
                    <li>• Hızlı export: Excel formatında temel veriler</li>
                    <li>• PDF export: Görsel raporlar ve analizler</li>
                    <li>• Dosyalar otomatik olarak indirilecek</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ExportMenu;