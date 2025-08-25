// src/services/api.ts - DEBUG MODE

import axios from 'axios';
import { 
  ApiResponse, 
  AnalysisRequest, 
  AnalysisResponse, 
  TrendsRequest, 
  TrendDataPoint, 
  CashFlowDataPoint,
  CashFlowRequest,
  VariableOption 
} from '../types/api';

// API Base Configuration with HTTPS FIX
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:7289/api'; // HTTPS!

// Debug mode
const DEBUG_MODE = process.env.REACT_APP_DEBUG === 'true' || process.env.NODE_ENV === 'development';

console.log('🔧 API Configuration:', {
  baseURL: API_BASE_URL,
  debugMode: DEBUG_MODE,
  nodeEnv: process.env.NODE_ENV
});

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
  // SSL Certificate bypass for development
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Accept 4xx errors too for debugging
  }
});

// Request interceptor with DEBUG
api.interceptors.request.use(
  (config) => {
    if (DEBUG_MODE) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
      console.log('📤 Request config:', {
        method: config.method,
        url: config.url,
        baseURL: config.baseURL,
        headers: config.headers,
        params: config.params,
        data: config.data
      });
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with DEBUG
api.interceptors.response.use(
  (response) => {
    if (DEBUG_MODE) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
      console.log('📥 Response data:', response.data);
    }
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      baseURL: error.config?.baseURL
    });
    
    // Handle common errors with user-friendly messages
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.error('🔴 Backend sunucuya bağlanılamıyor. Sunucunun çalıştığından emin olun.');
    } else if (error.response?.status === 404) {
      console.error('🔴 API endpoint bulunamadı:', error.config?.url);
    } else if (error.response?.status === 500) {
      console.error('🔴 Server internal error');
    } else if (error.response?.status === 0) {
      console.error('🔴 CORS hatası olabilir');
    }
    
    return Promise.reject(error);
  }
);

// API Service Class
export class ApiService {
  // Health Check with detailed logging
  static async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      console.log('🩺 Health check starting...');
      const response = await api.get('/health');
      console.log('✅ Health check successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      throw error;
    }
  }

  // Test backend connectivity
  static async testConnection(): Promise<any> {
    try {
      console.log('🔌 Testing backend connection...');
      const response = await api.get('/');
      console.log('✅ Backend connection successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      throw error;
    }
  }

  // Variables API with better error handling
  static async getKaynakKuruluslar(): Promise<ApiResponse<VariableOption[]>> {
    try {
      console.log('📊 Fetching kaynak kuruluslar...');
      const response = await api.get('/variables/kaynak-kurulus');
      console.log('✅ Kaynak kuruluslar loaded:', response.data.count, 'items');
      return response.data;
    } catch (error) {
      console.error('❌ Kaynak kuruluslar fetch failed:', error);
      throw error;
    }
  }

  static async getFonlar(kaynakKurulus: string): Promise<ApiResponse<VariableOption[]>> {
    try {
      console.log('📊 Fetching fonlar for:', kaynakKurulus);
      const params = new URLSearchParams({ kaynakKurulus });
      const response = await api.get(`/variables/fonlar?${params}`);
      console.log('✅ Fonlar loaded:', response.data.count, 'items');
      return response.data;
    } catch (error) {
      console.error('❌ Fonlar fetch failed for:', kaynakKurulus, error);
      throw error;
    }
  }

  static async getIhraclar(
    kaynakKurulus: string,
    fonNo: string
  ): Promise<ApiResponse<VariableOption[]>> {
    try {
      console.log('📊 Fetching ihraclar for:', { kaynakKurulus, fonNo });
      const params = new URLSearchParams({ kaynakKurulus, fonNo });
      const response = await api.get(`/variables/ihraclar?${params}`);
      console.log('✅ Ihraclar loaded:', response.data.count, 'items');
      return response.data;
    } catch (error) {
      console.error('❌ Ihraclar fetch failed for:', { kaynakKurulus, fonNo }, error);
      throw error;
    }
  }

  // Analysis APIs with detailed logging
  static async calculateAnalysis(request: AnalysisRequest): Promise<ApiResponse<AnalysisResponse>> {
    try {
      console.log('💰 Calculating analysis with request:', request);
      const response = await api.post('/analysis/calculate', request);
      console.log('✅ Analysis calculated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Analysis calculation failed:', error);
      throw error;
    }
  }

  static async getSimpleAnalysis(
    kaynakKurulus: string,
    faizOrani: number,
    fonNo?: string,
    ihracNo?: string
  ): Promise<ApiResponse<AnalysisResponse>> {
    try {
      console.log('💰 Getting simple analysis for:', { kaynakKurulus, faizOrani, fonNo, ihracNo });
      const params = new URLSearchParams({
        kaynakKurulus,
        faizOrani: faizOrani.toString(),
        ...(fonNo && { fonNo }),
        ...(ihracNo && { ihracNo })
      });
      
      const response = await api.get(`/analysis/simple?${params}`);
      console.log('✅ Simple analysis loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Simple analysis failed:', error);
      throw error;
    }
  }

  static async compareAnalysis(requests: AnalysisRequest[]): Promise<ApiResponse<AnalysisResponse[]>> {
    try {
      console.log('💰 Comparing analysis with requests:', requests);
      const response = await api.post('/analysis/compare', requests);
      console.log('✅ Analysis comparison completed:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Analysis comparison failed:', error);
      throw error;
    }
  }

  static async getAnalysisSummary(
    kaynakKurulus: string,
    faizOrani: number
  ): Promise<ApiResponse<any>> {
    try {
      console.log('💰 Getting analysis summary for:', { kaynakKurulus, faizOrani });
      const params = new URLSearchParams({
        kaynakKurulus,
        faizOrani: faizOrani.toString()
      });
      
      const response = await api.get(`/analysis/summary?${params}`);
      console.log('✅ Analysis summary loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Analysis summary failed:', error);
      throw error;
    }
  }

  // Trends APIs
  static async getTrends(request: TrendsRequest): Promise<ApiResponse<TrendDataPoint[]>> {
    try {
      console.log('📈 Getting trends with request:', request);
      const response = await api.post('/trends/data', request);
      console.log('✅ Trends loaded:', response.data.count, 'items');
      return response.data;
    } catch (error) {
      console.error('❌ Trends fetch failed:', error);
      throw error;
    }
  }

  static async getSimpleTrends(
    kaynakKurulus: string,
    period: string = 'week',
    fonNo?: string,
    ihracNo?: string,
    limit: number = 100
  ): Promise<ApiResponse<TrendDataPoint[]>> {
    try {
      console.log('📈 Getting simple trends for:', { kaynakKurulus, period, fonNo, ihracNo, limit });
      const params = new URLSearchParams({
        kaynakKurulus,
        period,
        limit: limit.toString(),
        ...(fonNo && { fonNo }),
        ...(ihracNo && { ihracNo })
      });
      
      const response = await api.get(`/trends/simple?${params}`);
      console.log('✅ Simple trends loaded:', response.data.count, 'items');
      return response.data;
    } catch (error) {
      console.error('❌ Simple trends failed:', error);
      throw error;
    }
  }

  // === CASH FLOW APIs ===
  static async getCashFlowAnalysis(
    period: string = 'month',
    limit: number = 100
  ): Promise<ApiResponse<CashFlowDataPoint[]>> {
    try {
      console.log('💹 Getting cash flow analysis for:', { period, limit });
      const params = new URLSearchParams({
        period,
        limit: limit.toString()
      });
      
      const response = await api.get(`/trends/cash-flow?${params}`);
      console.log('✅ Cash flow analysis loaded:', response.data.count, 'items');
      return response.data;
    } catch (error) {
      console.error('❌ Cash flow analysis failed:', error);
      throw error;
    }
  }

  static async getCashFlowAnalysisPost(request: CashFlowRequest): Promise<ApiResponse<CashFlowDataPoint[]>> {
    try {
      console.log('💹 Getting cash flow analysis (POST) with request:', request);
      const response = await api.post('/trends/cash-flow', request);
      console.log('✅ Cash flow analysis (POST) loaded:', response.data.count, 'items');
      return response.data;
    } catch (error) {
      console.error('❌ Cash flow analysis (POST) failed:', error);
      throw error;
    }
  }

  static async getTrendsSummary(
    kaynakKurulus: string,
    period: string = 'week'
  ): Promise<ApiResponse<any>> {
    try {
      console.log('📈 Getting trends summary for:', { kaynakKurulus, period });
      const params = new URLSearchParams({
        kaynakKurulus,
        period
      });
      
      const response = await api.get(`/trends/summary?${params}`);
      console.log('✅ Trends summary loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Trends summary failed:', error);
      throw error;
    }
  }

  static async compareTrends(requests: TrendsRequest[]): Promise<ApiResponse<any[]>> {
    try {
      console.log('📈 Comparing trends with requests:', requests);
      const response = await api.post('/trends/compare', requests);
      console.log('✅ Trends comparison completed:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Trends comparison failed:', error);
      throw error;
    }
  }

  static async getTrendForecast(
    kaynakKurulus: string,
    period: string = 'week',
    forecastPeriods: number = 4
  ): Promise<ApiResponse<any>> {
    try {
      console.log('📈 Getting trend forecast for:', { kaynakKurulus, period, forecastPeriods });
      const params = new URLSearchParams({
        kaynakKurulus,
        period,
        forecastPeriods: forecastPeriods.toString()
      });
      
      const response = await api.get(`/trends/forecast?${params}`);
      console.log('✅ Trend forecast loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Trend forecast failed:', error);
      throw error;
    }
  }

  static async getRealtimeTrendStatus(kaynakKurulus: string): Promise<ApiResponse<any>> {
    try {
      console.log('📈 Getting realtime trend status for:', kaynakKurulus);
      const params = new URLSearchParams({ kaynakKurulus });
      const response = await api.get(`/trends/realtime?${params}`);
      console.log('✅ Realtime trend status loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Realtime trend status failed:', error);
      throw error;
    }
  }

  static async getVariableHierarchy(
    kaynakKurulus?: string,
    fonNo?: string
  ): Promise<ApiResponse<any>> {
    try {
      console.log('📊 Getting variable hierarchy for:', { kaynakKurulus, fonNo });
      const params = new URLSearchParams();
      if (kaynakKurulus) params.append('kaynakKurulus', kaynakKurulus);
      if (fonNo) params.append('fonNo', fonNo);
      
      const response = await api.get(`/variables/hierarchy?${params}`);
      console.log('✅ Variable hierarchy loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Variable hierarchy failed:', error);
      throw error;
    }
  }

  static async getFilterStats(): Promise<ApiResponse<any>> {
    try {
      console.log('📊 Getting filter stats...');
      const response = await api.get('/variables/stats');
      console.log('✅ Filter stats loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Filter stats failed:', error);
      throw error;
    }
  }

  // Export APIs
  static async exportAnalysis(
    level: 'basic' | 'detailed' | 'full',
    format: 'pdf' | 'excel',
    analysisData: AnalysisRequest
  ): Promise<Blob> {
    try {
      console.log('📥 Exporting analysis:', { level, format, analysisData });
      const response = await api.post('/export/analysis', {
        level,
        format,
        analysisData
      }, {
        responseType: 'blob'
      });
      
      console.log('✅ Analysis export completed, blob size:', response.data.size);
      return response.data;
    } catch (error) {
      console.error('❌ Analysis export failed:', error);
      throw error;
    }
  }

  static async exportTrends(
    trendsRequest: TrendsRequest,
    format: 'excel' | 'csv' = 'excel'
  ): Promise<Blob> {
    try {
      console.log('📥 Exporting trends:', { trendsRequest, format });
      const response = await api.post(`/export/trends?format=${format}`, trendsRequest, {
        responseType: 'blob'
      });
      
      console.log('✅ Trends export completed, blob size:', response.data.size);
      return response.data;
    } catch (error) {
      console.error('❌ Trends export failed:', error);
      throw error;
    }
  }

  static async exportCashFlow(
    period: string = 'month',
    format: 'excel' | 'csv' = 'excel'
  ): Promise<Blob> {
    try {
      console.log('📥 Exporting cash flow:', { period, format });
      const response = await api.post(`/export/cash-flow?format=${format}`, {
        period,
        limit: 1000
      }, {
        responseType: 'blob'
      });
      
      console.log('✅ Cash flow export completed, blob size:', response.data.size);
      return response.data;
    } catch (error) {
      console.error('❌ Cash flow export failed:', error);
      throw error;
    }
  }

  static async quickExcelExport(
    kaynakKurulus: string,
    faizOrani: number,
    fonNo?: string,
    ihracNo?: string
  ): Promise<Blob> {
    try {
      console.log('📥 Quick excel export for:', { kaynakKurulus, faizOrani, fonNo, ihracNo });
      const params = new URLSearchParams({
        kaynakKurulus,
        faizOrani: faizOrani.toString(),
        ...(fonNo && { fonNo }),
        ...(ihracNo && { ihracNo })
      });
      
      const response = await api.get(`/export/quick-excel?${params}`, {
        responseType: 'blob'
      });
      
      console.log('✅ Quick excel export completed, blob size:', response.data.size);
      return response.data;
    } catch (error) {
      console.error('❌ Quick excel export failed:', error);
      throw error;
    }
  }

  static async getExportFormats(): Promise<ApiResponse<any>> {
    try {
      console.log('📥 Getting export formats...');
      const response = await api.get('/export/formats');
      console.log('✅ Export formats loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Export formats failed:', error);
      throw error;
    }
  }

  // Connection test utility
  static async debugConnection(): Promise<void> {
    console.log('🔍 Starting connection debug...');
    console.log('🔧 API Base URL:', API_BASE_URL);
    
    try {
      // Test 1: Root endpoint
      console.log('🧪 Test 1: Root endpoint');
      const rootResponse = await api.get('/');
      console.log('✅ Root endpoint OK:', rootResponse.data);
    } catch (error) {
      console.error('❌ Root endpoint failed:', error);
    }

    try {
      // Test 2: Health check
      console.log('🧪 Test 2: Health check');
      const healthResponse = await api.get('/health');
      console.log('✅ Health check OK:', healthResponse.data);
    } catch (error) {
      console.error('❌ Health check failed:', error);
    }

    try {
      // Test 3: Variables endpoint
      console.log('🧪 Test 3: Variables endpoint');
      const variablesResponse = await api.get('/variables/kaynak-kurulus');
      console.log('✅ Variables OK:', variablesResponse.data.count, 'items');
    } catch (error) {
      console.error('❌ Variables failed:', error);
    }

    console.log('🔍 Connection debug completed');
  }
}

// Auto-run debug on development
if (DEBUG_MODE) {
  console.log('🔧 Debug mode enabled - Running connection test...');
  ApiService.debugConnection().catch(error => {
    console.error('🔴 Auto debug failed:', error);
  });
}

export default ApiService;