// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  timestamp: string;
  count: number;
}

// Analysis Types
export interface AnalysisRequest {
  faizOrani: number;
  kaynakKurulus: string;
  fonNo?: string;
  ihracNo?: string;
  baslangicTarihi?: string;
  bitisTarihi?: string;
}

export interface AnalysisResponse {
  toplamFaizTutari: number;
  toplamModelFaizTutari: number;
  farkTutari: number;
  farkYuzdesi: number;
  faizOrani: number;
  kaynakKurulus: string;
  fonNo?: string;
  ihracNo?: string;
  calculatedAt: string;
}

// Trends Types
export interface TrendsRequest {
  kaynakKurulus: string;
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  fonNo?: string;
  ihracNo?: string;
  limit: number;
}

export interface TrendDataPoint {
  timestamp: number;
  tarih: string;
  period: string;
  fonNo: string;
  haftalikMevduat: number;
  kumulatifMevduat: number;
  haftalikFaizKazanci: number;
  kumulatifFaizKazanci: number;
  haftalikBuyumeYuzde: number;
  kumulatifBuyumeYuzde: number;
  haftalikIslemSayisi: number;
  ortalamaPaizOrani: number;
  kaynakKurulus: string;
}

// Cash Flow Types - YENİ!
export interface CashFlowRequest {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  limit: number;
}

export interface CashFlowDataPoint {
  timestamp: number;
  tarih: string;
  period: string;
  totalAnapara: number;
  totalBasitFaiz: number;
  totalFaizKazanci: number;
  avgBasitFaiz: number;
  totalModelFaiz: number;
  totalModelFaizKazanci: number;
  avgModelNemaOrani: number;
  totalTlrefFaiz: number;
  totalTlrefKazanci: number;
  avgTlrefFaiz: number;
  basitFaizYieldPercentage: number;
  modelFaizYieldPercentage: number;
  tlrefFaizYieldPercentage: number;
  basitVsModelPerformance: number;
  basitVsTlrefPerformance: number;
  recordCount: number;
  periodType: string;
}

// Variable Options
export interface VariableOption {
  text: string;
  value: string;
  recordCount?: number;
  totalAmount?: number;
}

// Export Types
export interface ExportRequest {
  level: 'basic' | 'detailed' | 'full';
  format: 'pdf' | 'excel';
  analysisData: AnalysisRequest;
}

// Health Check Response
export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  version?: string;
  details?: Record<string, any>;
}