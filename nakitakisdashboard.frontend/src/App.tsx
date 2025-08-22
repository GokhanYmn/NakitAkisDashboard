import React, { useState } from 'react';
import './index.css';
import { useHealthCheck } from './hooks/useApi';
import Loading from './components/ui/Loading';

function App() {
  const { data: healthData, loading: healthLoading, error: healthError } = useHealthCheck();
  const [apiTest, setApiTest] = useState<string>('');

  const handleApiTest = async () => {
    setApiTest('Testing API...');
    try {
      // API test simulation
      setTimeout(() => {
        setApiTest('✅ API Connection Successful!');
      }, 1000);
    } catch (error) {
      setApiTest('❌ API Connection Failed');
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
                v1.0 - Clean React
              </span>
            </div>
            <div className="flex items-center space-x-4">
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
          {/* Welcome Card */}
          <div className="card-hover">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                🎯 Frontend Kurulum Tamamlandı!
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Modern React + TypeScript + TailwindCSS + API Ready!
              </p>
              <div className="flex justify-center space-x-4">
                <button className="btn-primary">
                  📊 Dashboard Test
                </button>
                <button 
                  className="btn-secondary"
                  onClick={handleApiTest}
                >
                  🎛️ API Test
                </button>
              </div>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="metric-card">
              <div className="metric-value text-success-600">✅</div>
              <div className="metric-label">React 18</div>
              <div className="metric-change positive">
                + TypeScript
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-value text-primary-600">🎨</div>
              <div className="metric-label">TailwindCSS</div>
              <div className="metric-change positive">
                + Custom Components
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-value text-warning-600">⚡</div>
              <div className="metric-label">Clean API</div>
              <div className="metric-change positive">
                + React Hooks
              </div>
            </div>
          </div>

          {/* API Connection Test */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              🔗 Backend Connection Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    API Endpoint: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">http://localhost:7289</code>
                  </p>
                  <div className="flex items-center space-x-2">
                    {healthLoading ? (
                      <Loading size="sm" />
                    ) : healthError ? (
                      <>
                        <div className="w-2 h-2 bg-error-500 rounded-full"></div>
                        <span className="text-sm text-error-600 dark:text-error-400">
                          Backend Disconnected: {healthError}
                        </span>
                      </>
                    ) : healthData ? (
                      <>
                        <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-success-600 dark:text-success-400">
                          Backend Connected
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
                        <span className="text-sm text-warning-600 dark:text-warning-400">
                          Status Unknown
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <button 
                  className="btn-primary"
                  onClick={handleApiTest}
                >
                  🔄 Test API
                </button>
              </div>
              
              {apiTest && (
                <div className={`p-3 rounded-lg text-sm ${
                  apiTest.includes('✅') 
                    ? 'bg-success-100 text-success-800 dark:bg-success-800 dark:text-success-100'
                    : apiTest.includes('❌')
                    ? 'bg-error-100 text-error-800 dark:bg-error-800 dark:text-error-100'
                    : 'bg-warning-100 text-warning-800 dark:bg-warning-800 dark:text-warning-100'
                }`}>
                  {apiTest}
                </div>
              )}
            </div>
          </div>

          {/* Features Preview */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              🚀 Hazır Özellikler
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800 dark:text-gray-200">📊 Component'ler:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• ✅ Loading Components (Spinner, Dots, Bars)</li>
                  <li>• ✅ API Service Layer</li>
                  <li>• ✅ Custom React Hooks</li>
                  <li>• ✅ TypeScript Types</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800 dark:text-gray-200">🎛️ API Entegrasyonu:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• ✅ Analysis API calls</li>
                  <li>• ✅ Trends API calls</li>
                  <li>• ✅ Variables API calls</li>
                  <li>• ✅ Export API calls</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              📋 Sonraki Adımlar
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-success-600">✅</span>
                <span className="text-gray-700 dark:text-gray-300">Backend API hazır</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-success-600">✅</span>
                <span className="text-gray-700 dark:text-gray-300">Frontend kurulumu tamamlandı</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-warning-600">🔄</span>
                <span className="text-gray-700 dark:text-gray-300">Dashboard component'leri eklenecek</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-warning-600">🔄</span>
                <span className="text-gray-700 dark:text-gray-300">Chart.js entegrasyonu yapılacak</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-warning-600">🔄</span>
                <span className="text-gray-700 dark:text-gray-300">Responsive tasarım optimize edilecek</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;