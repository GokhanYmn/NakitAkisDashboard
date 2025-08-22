import React, { useState, useEffect } from 'react';
import { useKaynakKuruluslar, useFonlar, useIhraclar } from '../../hooks/useApi';
import Loading from '../ui/Loading';

interface VariableSelectorProps {
  onSelectionChange: (selection: {
    kaynakKurulus: string;
    fonNo: string;
    ihracNo: string;
    faizOrani: number | null;
  }) => void;
}

const VariableSelector: React.FC<VariableSelectorProps> = ({ onSelectionChange }) => {
  const [selectedKurulus, setSelectedKurulus] = useState<string>('');
  const [selectedFon, setSelectedFon] = useState<string>('');
  const [selectedIhrac, setSelectedIhrac] = useState<string>('');
  const [faizOrani, setFaizOrani] = useState<string>('');

  // API calls
  const { data: kuruluslar, loading: kurulusLoading } = useKaynakKuruluslar();
  const { data: fonlar, loading: fonLoading } = useFonlar(selectedKurulus);
  const { data: ihraclar, loading: ihracLoading } = useIhraclar(selectedKurulus, selectedFon);

  // Selection change handler
  useEffect(() => {
    const faizOraniNum = parseFloat(faizOrani);
    onSelectionChange({
      kaynakKurulus: selectedKurulus,
      fonNo: selectedFon,
      ihracNo: selectedIhrac,
      faizOrani: !isNaN(faizOraniNum) && faizOraniNum > 0 ? faizOraniNum : null
    });
  }, [selectedKurulus, selectedFon, selectedIhrac, faizOrani, onSelectionChange]);

  // Reset dependent selections
  useEffect(() => {
    setSelectedFon('');
    setSelectedIhrac('');
  }, [selectedKurulus]);

  useEffect(() => {
    setSelectedIhrac('');
  }, [selectedFon]);

  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        🎛️ Filtreler ve Parametreler
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <option key={`${fon.value}-${index}`} value={fon.value}>
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
                <option key={`${ihrac.value}-${index}`} value={ihrac.value}>
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

        {/* Faiz Oranı */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            📊 Faiz Oranı (%) *
          </label>
          <input
            type="number"
            value={faizOrani}
            onChange={(e) => setFaizOrani(e.target.value)}
            placeholder="Örn: 15.5"
            min="0.1"
            max="100"
            step="0.1"
            className={`input-field ${
              faizOrani && (isNaN(parseFloat(faizOrani)) || parseFloat(faizOrani) <= 0)
                ? 'border-error-500 focus:ring-error-500'
                : ''
            }`}
          />
          {faizOrani && (isNaN(parseFloat(faizOrani)) || parseFloat(faizOrani) <= 0) && (
            <p className="mt-1 text-sm text-error-600 dark:text-error-400">
              ⚠️ Geçerli bir faiz oranı girin (0.1-100 arası)
            </p>
          )}
        </div>
      </div>

      {/* Seçim Özeti */}
      {selectedKurulus && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            📋 Aktif Seçim:
          </h4>
          <div className="space-y-1 text-sm">
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
            {faizOrani && !isNaN(parseFloat(faizOrani)) && parseFloat(faizOrani) > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 dark:text-gray-400">📊 Faiz Oranı:</span>
                <span className="font-medium text-success-600 dark:text-success-400">
                  %{parseFloat(faizOrani).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading States */}
      {(kurulusLoading && !kuruluslar) && (
        <div className="mt-4 flex items-center justify-center p-4">
          <Loading text="Kuruluşlar yükleniyor..." />
        </div>
      )}
    </div>
  );
};

export default VariableSelector;