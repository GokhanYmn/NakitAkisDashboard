import axios from 'axios';
import { 
  ApiResponse, 
  AnalysisRequest, 
  AnalysisResponse, 
  TrendsRequest, 
  TrendDataPoint, 
  CashFlowDataPoint,
  VariableOption 
} from '../types/api';

// API Base Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:7289/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('Response Error:', error.response?.data || error.message);
    
    // Handle common errors
    if (error.response?.status === 404) {
      console.error('API endpoint not found');
    } else if (error.response?.status === 500) {
      console.error('Server error occurred');
    }
    
    return Promise.reject(error);
  }
);

// API Service Class
export class ApiService {
  // Health Check
  static async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await api.get('/health');
    return response.data;
  }

  // Analysis APIs
  static async calculateAnalysis(request: AnalysisRequest): Promise<ApiResponse<AnalysisResponse>> {
    const response = await api.post('/analysis/calculate', request);
    return response.data;
  }

  static async getSimpleAnalysis(
    kaynakKurulus: string,
    faizOrani: number,
    fonNo?: string,
    ihracNo?: string
  ): Promise<ApiResponse<AnalysisResponse>> {
    const params = new URLSearchParams({
      kaynakKurulus,
      faizOrani: faizOrani.toString(),
      ...(fonNo && { fonNo }),
      ...(ihracNo && { ihracNo })
    });
    
    const response = await api.get(`/analysis/simple?${params}`);
    return response.data;
  }

  static async compareAnalysis(requests: AnalysisRequest[]): Promise<ApiResponse<AnalysisResponse[]>> {
    const response = await api.post('/analysis/compare', requests);
    return response.data;
  }

  static async getAnalysisSummary(
    kaynakKurulus: string,
    faizOrani: number
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      kaynakKurulus,
      faizOrani: faizOrani.toString()
    });
    
    const response = await api.get(`/analysis/summary?${params}`);
    return response.data;
  }

  // Trends APIs
  static async getTrends(request: TrendsRequest): Promise<ApiResponse<TrendDataPoint[]>> {
    const response = await api.post('/trends/data', request);
    return response.data;
  }

  static async getSimpleTrends(
    kaynakKurulus: string,
    period: string = 'week',
    fonNo?: string,
    ihracNo?: string,
    limit: number = 100
  ): Promise<ApiResponse<TrendDataPoint[]>> {
    const params = new URLSearchParams({
      kaynakKurulus,
      period,
      limit: limit.toString(),
      ...(fonNo && { fonNo }),
      ...(ihracNo && { ihracNo })
    });
    
    const response = await api.get(`/trends/simple?${params}`);
    return response.data;
  }

  static async getCashFlowAnalysis(
    period: string = 'month',
    limit: number = 100
  ): Promise<ApiResponse<CashFlowDataPoint[]>> {
    const params = new URLSearchParams({
      period,
      limit: limit.toString()
    });
    
    const response = await api.get(`/trends/cash-flow?${params}`);
    return response.data;
  }

  static async getTrendsSummary(
    kaynakKurulus: string,
    period: string = 'week'
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      kaynakKurulus,
      period
    });
    
    const response = await api.get(`/trends/summary?${params}`);
    return response.data;
  }

  static async compareTrends(requests: TrendsRequest[]): Promise<ApiResponse<any[]>> {
    const response = await api.post('/trends/compare', requests);
    return response.data;
  }

  static async getTrendForecast(
    kaynakKurulus: string,
    period: string = 'week',
    forecastPeriods: number = 4
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      kaynakKurulus,
      period,
      forecastPeriods: forecastPeriods.toString()
    });
    
    const response = await api.get(`/trends/forecast?${params}`);
    return response.data;
  }

  static async getRealtimeTrendStatus(kaynakKurulus: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({ kaynakKurulus });
    const response = await api.get(`/trends/realtime?${params}`);
    return response.data;
  }

  // Variables APIs
  static async getKaynakKuruluslar(): Promise<ApiResponse<VariableOption[]>> {
    const response = await api.get('/variables/kaynak-kurulus');
    return response.data;
  }

  static async getFonlar(kaynakKurulus: string): Promise<ApiResponse<VariableOption[]>> {
    const params = new URLSearchParams({ kaynakKurulus });
    const response = await api.get(`/variables/fonlar?${params}`);
    return response.data;
  }

  static async getIhraclar(
    kaynakKurulus: string,
    fonNo: string
  ): Promise<ApiResponse<VariableOption[]>> {
    const params = new URLSearchParams({ kaynakKurulus, fonNo });
    const response = await api.get(`/variables/ihraclar?${params}`);
    return response.data;
  }

  static async getVariableHierarchy(
    kaynakKurulus?: string,
    fonNo?: string
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (kaynakKurulus) params.append('kaynakKurulus', kaynakKurulus);
    if (fonNo) params.append('fonNo', fonNo);
    
    const response = await api.get(`/variables/hierarchy?${params}`);
    return response.data;
  }

  static async getFilterStats(): Promise<ApiResponse<any>> {
    const response = await api.get('/variables/stats');
    return response.data;
  }

  // Export APIs
  static async exportAnalysis(
    level: 'basic' | 'detailed' | 'full',
    format: 'pdf' | 'excel',
    analysisData: AnalysisRequest
  ): Promise<Blob> {
    const response = await api.post('/export/analysis', {
      level,
      format,
      analysisData
    }, {
      responseType: 'blob'
    });
    
    return response.data;
  }

  static async exportTrends(
    trendsRequest: TrendsRequest,
    format: 'excel' | 'csv' = 'excel'
  ): Promise<Blob> {
    const response = await api.post(`/export/trends?format=${format}`, trendsRequest, {
      responseType: 'blob'
    });
    
    return response.data;
  }

  static async exportCashFlow(
    period: string = 'month',
    format: 'excel' | 'csv' = 'excel'
  ): Promise<Blob> {
    const response = await api.post(`/export/cash-flow?format=${format}`, {
      period,
      limit: 1000
    }, {
      responseType: 'blob'
    });
    
    return response.data;
  }

  static async quickExcelExport(
    kaynakKurulus: string,
    faizOrani: number,
    fonNo?: string,
    ihracNo?: string
  ): Promise<Blob> {
    const params = new URLSearchParams({
      kaynakKurulus,
      faizOrani: faizOrani.toString(),
      ...(fonNo && { fonNo }),
      ...(ihracNo && { ihracNo })
    });
    
    const response = await api.get(`/export/quick-excel?${params}`, {
      responseType: 'blob'
    });
    
    return response.data;
  }

  static async getExportFormats(): Promise<ApiResponse<any>> {
    const response = await api.get('/export/formats');
    return response.data;
  }
}

export default ApiService;