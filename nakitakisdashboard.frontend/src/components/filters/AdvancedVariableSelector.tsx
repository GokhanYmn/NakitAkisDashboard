import React, { useState, useEffect, useCallback } from 'react';
import { useKaynakKuruluslar, useFonlar, useIhraclar } from '../../hooks/useApi';
import Loading from '../ui/Loading';
import ExportMenu from '../ui/ExportMenu';

interface AdvancedVariableSelectorProps {
  onSelectionChange: (selection: {
    dashboardType: string;
    kaynakKurulus: string;
    fonNo: string;
    ihracNo: string;
    faizOrani: number | null;
  }) => void;
}

// Dashboard türleri
const DASHBOARD_TYPES = [
  {
    id: 'analysis',
    name: 'Nakit Akış Analizi',
    description: 'Faiz oranı analizi ve karşılaştırma',
    icon: '💰'
  },
  {
    id: 'trends',
    name: 'Haftalık Trend Analizi',
    description: 'Kümülatif büyüme ve trend grafiği',
    icon: '📈'
  },
  {
    id: 'cash-flow',
    name: 'Cash Flow Analizi',
    description: 'Detaylı nakit akış analizi',
    icon: '💹'
  },
  {
    id: 'comparison',
    name: 'Kuruluş Karşılaştırma',
    description: 'Farklı kuruluşları karşılaştır',
    icon: '⚖️'
  }
];

const AdvancedVariableSelector: React.FC<AdvancedVariableSelectorProps> = ({ 
  onSelectionChange 
}) => {
  // State'ler
  const [dashboardType, setDashboardType] = useState<string>('analysis');
  const [selectedKurulus, setSelectedKurulus] = useState<string>('');
  const [selectedFon, setSelectedFon] = useState<string>('');
  const [selectedIhrac, setSelectedIhrac] = useState<string>('');
  const [faizOraniInput, setFaizOraniInput] = useState<string>('');
  const [currentFaizOrani, setCurrentFaizOrani] = useState<number | null>(null);

  // API calls - tip güvenli hooks
  const { data: kuruluslar, loading: kurulusLoading } = useKaynakKuruluslar();
  const { data: fonlar, loading: fonLoading } = useFonlar(selectedKurulus);
  const { data: ihraclar, loading: ihracLoading } = useIhraclar(selectedKurulus, selectedFon);

  // Faiz oranı change handler
  const handleFaizOraniChange = (value: string) => {
    setFaizOraniInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 100) {
      setCurrentFaizOrani(numValue);
    } else {
      setCurrentFaizOrani(null);
    }
  };

  // Reset dependent selections when parent changes
  useEffect(() => {
    setSelectedFon('');
    setSelectedIhrac('');
  }, [selectedKurulus]);

  useEffect(() => {
    setSelectedIhrac('');
  }, [selectedFon]);

  // Parent'a değişiklikleri bildir - MEMOIZED CALLBACK
  const notifyParent = useCallback((newSelection: {
    dashboardType: string;
    kaynakKurulus: string;
    fonNo: string;
    ihracNo: string;
    faizOrani: number | null;
  }) => {
    onSelectionChange(newSelection);
  }, [onSelectionChange]);

  useEffect(() => {
    notifyParent({
      dashboardType,
      kaynakKurulus: selectedKurulus,
      fonNo: selectedFon,
      ihracNo: selectedIhrac,
      faizOrani: currentFaizOrani
    });
  }, [dashboardType, selectedKurulus, selectedFon, selectedIhrac, currentFaizOrani, notifyParent]);

  // Validation
  const isFaizOraniValid = currentFaizOrani !== null && currentFaizOrani > 0;
  const isFaizOraniRequired = dashboardType === 'analysis';

  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        🎛️ Dashboard & Filtre Seçimi
      </h3>
      
      {/* Dashboard Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          📊 Dashboard Türü:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {DASHBOARD_TYPES.map((dashboard) => (
            <button
              key={dashboard.id}
              onClick={() => setDashboardType(dashboard.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                dashboardType === dashboard.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary-300'
              }`}
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">{dashboard.icon}</span>
                <span className="font-semibold text-sm">{dashboard.name}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {dashboard.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Variable Selections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Kaynak Kuruluş */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            🏢 Kaynak Kuruluş *
          </label>
          <div className="relative">
            <select
              value={selectedKurulus}
              onChange={(e) => setSelectedKurulus(e.target.value)}
              disabled={kurulusLoading}
              className="select-field"
            >
              <option value="">Seçiniz...</option>
              {kuruluslar?.data?.map((kurulus) => (
                <option key={kurulus.value} value={kurulus.value}>
                  {kurulus.text}
                </option>
              ))}
            </select>
            {kurulusLoading && (
              <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                <Loading size="sm" />
              </div>
            )}
          </div>
        </div>

        {/* Fon Numarası */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            💼 Fon Numarası
          </label>
          <div className="relative">
            <select
              value={selectedFon}
              onChange={(e) => setSelectedFon(e.target.value)}
              disabled={!selectedKurulus || fonLoading}
              className="select-field"
            >
              <option value="">Tüm Fonlar</option>
              {fonlar?.data?.map((fon, index) => (
                <option key={`fon-${fon.value}-${index}`} value={fon.value}>
                  {fon.text}
                </option>
              ))}
            </select>
            {fonLoading && (
              <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                <Loading size="sm" />
              </div>
            )}
          </div>
        </div>

        {/* İhraç Numarası */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            🎯 İhraç Numarası
          </label>
          <div className="relative">
            <select
              value={selectedIhrac}
              onChange={(e) => setSelectedIhrac(e.target.value)}
              disabled={!selectedFon || ihracLoading}
              className="select-field"
            >
              <option value="">Tüm İhraçlar</option>
              {ihraclar?.data?.map((ihrac, index) => (
                <option key={`ihrac-${ihrac.value}-${index}`} value={ihrac.value}>
                  {ihrac.text}
                </option>
              ))}
            </select>
            {ihracLoading && (
              <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                <Loading size="sm" />
              </div>
            )}
          </div>
        </div>

        {/* Faiz Oranı - Sadece Analysis için gerekli */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            📊 Faiz Oranı (%) {isFaizOraniRequired && '*'}
          </label>
          <input
            type="number"
            value={faizOraniInput}
            onChange={(e) => handleFaizOraniChange(e.target.value)}
            placeholder="Örn: 15.5"
            min="0.1"
            max="100"
            step="0.1"
            className={`input-field ${
              isFaizOraniRequired && faizOraniInput && !isFaizOraniValid
                ? 'border-error-500 focus:ring-error-500'
                : ''
            }`}
          />
          {isFaizOraniRequired && faizOraniInput && !isFaizOraniValid && (
            <p className="mt-1 text-sm text-error-600 dark:text-error-400">
              ⚠️ 0.1-100 arası değer girin
            </p>
          )}
          {!isFaizOraniRequired && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              💡 Bu dashboard için opsiyonel
            </p>
          )}
        </div>

        {/* Export Menu - Analysis dashboard'ında ve gerekli veriler varsa */}
        {dashboardType === 'analysis' && selectedKurulus && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📥 Rapor Export:
            </label>
            <ExportMenu
              filters={{
                kaynakKurulus: selectedKurulus,
                fonNo: selectedFon,
                ihracNo: selectedIhrac,
                faizOrani: currentFaizOrani || 0
              }}
              disabled={!isFaizOraniValid}
            />
            {!isFaizOraniValid && (
              <p className="mt-1 text-sm text-warning-600 dark:text-warning-400">
                ⚠️ Export için faiz oranı gerekli
              </p>
            )}
          </div>
        )}
      </div>

      {/* Selection Summary */}
      {selectedKurulus && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            📋 Aktif Seçim Özeti:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 dark:text-gray-400">📊 Dashboard:</span>
              <span className="font-medium text-primary-600 dark:text-primary-400">
                {DASHBOARD_TYPES.find(d => d.id === dashboardType)?.name}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 dark:text-gray-400">🏢 Kuruluş:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{selectedKurulus}</span>
            </div>
            
            {selectedFon && (
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 dark:text-gray-400">💼 Fon:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{selectedFon}</span>
              </div>
            )}
            
            {selectedIhrac && (
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 dark:text-gray-400">🎯 İhraç:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{selectedIhrac}</span>
              </div>
            )}
            
            {/* Faiz Oranı Durumu */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 dark:text-gray-400">📈 Faiz Oranı:</span>
              {isFaizOraniRequired ? (
                isFaizOraniValid ? (
                  <span className="font-medium text-success-600 dark:text-success-400">
                    %{currentFaizOrani} ✅
                  </span>
                ) : (
                  <span className="font-medium text-error-600 dark:text-error-400">
                    Gerekli ⚠️
                  </span>
                )
              ) : (
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  {isFaizOraniValid ? `%${currentFaizOrani}` : 'Opsiyonel'}
                </span>
              )}
            </div>
          </div>
          
          {/* Validation Messages */}
          {isFaizOraniRequired && !isFaizOraniValid && (
            <div className="mt-3 p-3 bg-warning-50 dark:bg-warning-900 border border-warning-200 dark:border-warning-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-warning-600 dark:text-warning-400">⚠️</span>
                <span className="text-warning-800 dark:text-warning-200 font-medium">
                  Nakit Akış Analizi için faiz oranı gereklidir
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading States */}
      {(kurulusLoading && !kuruluslar) && (
        <div className="flex items-center justify-center p-4">
          <Loading text="Kuruluşlar yükleniyor..." />
        </div>
      )}
    </div>
  );
};

export default AdvancedVariableSelector;