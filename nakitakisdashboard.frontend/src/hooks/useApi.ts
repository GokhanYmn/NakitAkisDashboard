// src/hooks/useApi.ts

import { useState, useEffect, useCallback } from 'react';
import ApiService from '../services/api';
import { ApiResponse, AnalysisResponse, VariableOption, HealthCheckResponse } from '../types/api';

// Generic API hook
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  immediate: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'API çağrısı başarısız');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  const refetch = useCallback(() => {
    execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    refetch,
    execute
  };
}

// Health check hook
export function useHealthCheck() {
  return useApi<HealthCheckResponse>(
    () => ApiService.healthCheck(),
    [],
    true
  );
}

// Variables hooks
export function useKaynakKuruluslar() {
  return useApi<ApiResponse<VariableOption[]>>(
    () => ApiService.getKaynakKuruluslar(),
    [],
    true
  );
}

export function useFonlar(kaynakKurulus: string) {
  return useApi<ApiResponse<VariableOption[]>>(
    () => ApiService.getFonlar(kaynakKurulus),
    [kaynakKurulus],
    !!kaynakKurulus
  );
}

export function useIhraclar(kaynakKurulus: string, fonNo: string) {
  return useApi<ApiResponse<VariableOption[]>>(
    () => ApiService.getIhraclar(kaynakKurulus, fonNo),
    [kaynakKurulus, fonNo],
    !!(kaynakKurulus && fonNo)
  );
}

// Variable hierarchy hook
export function useVariableHierarchy(kaynakKurulus?: string, fonNo?: string) {
  return useApi<ApiResponse<any>>(
    () => ApiService.getVariableHierarchy(kaynakKurulus, fonNo),
    [kaynakKurulus, fonNo],
    true
  );
}

// Filter stats hook
export function useFilterStats() {
  return useApi<ApiResponse<any>>(
    () => ApiService.getFilterStats(),
    [],
    true
  );
}

// Analysis hooks
export function useAnalysisSummary(kaynakKurulus: string, faizOrani: number) {
  return useApi<ApiResponse<any>>(
    () => ApiService.getAnalysisSummary(kaynakKurulus, faizOrani),
    [kaynakKurulus, faizOrani],
    !!(kaynakKurulus && faizOrani > 0)
  );
}

// Trends hooks
export function useTrendsSummary(kaynakKurulus: string, period: string = 'week') {
  return useApi<ApiResponse<any>>(
    () => ApiService.getTrendsSummary(kaynakKurulus, period),
    [kaynakKurulus, period],
    !!kaynakKurulus
  );
}

export function useRealtimeTrendStatus(kaynakKurulus: string) {
  return useApi<ApiResponse<any>>(
    () => ApiService.getRealtimeTrendStatus(kaynakKurulus),
    [kaynakKurulus],
    !!kaynakKurulus
  );
}

// Cash flow analysis hook
export function useCashFlowAnalysis(period: string = 'month', limit: number = 100) {
  return useApi<ApiResponse<any>>(
    () => ApiService.getCashFlowAnalysis(period, limit),
    [period, limit],
    true
  );
}

// Export formats hook
export function useExportFormats() {
  return useApi<ApiResponse<any>>(
    () => ApiService.getExportFormats(),
    [],
    true
  );
}

// Manual API calls with loading states - TİP GÜVENLİĞİ İLE
export function useManualApi<T = ApiResponse<AnalysisResponse>>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'API çağrısı başarısız';
      setError(errorMessage);
      console.error('API Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
}

// Debounced API hook for search/filter scenarios
export function useDebouncedApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[],
  delay: number = 500
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (dependencies.some(dep => dep === '' || dep === null || dep === undefined)) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await apiCall();
        setData(result);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'API çağrısı başarısız');
        console.error('Debounced API Error:', err);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [...dependencies, delay]);

  return { data, loading, error };
}