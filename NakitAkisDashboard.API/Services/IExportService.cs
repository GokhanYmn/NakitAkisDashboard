using NakitAkisDashboard.API.Models.Request;
using NakitAkisDashboard.API.Models.Response;

namespace NakitAkisDashboard.API.Services
{
    public interface IExportService
    {
        // ===== ANALYSIS EXPORTS =====
        Task<byte[]> ExportAnalysisToPdfAsync(AnalysisResponse analysis, AnalysisRequest request, string level = "basic");
        Task<byte[]> ExportAnalysisToExcelAsync(AnalysisResponse analysis, AnalysisRequest request, string level = "basic");

        // ===== TRENDS EXPORTS =====
        Task<byte[]> ExportTrendsToExcelAsync(List<TrendDataPoint> trends, TrendsRequest request);
        Task<byte[]> ExportTrendsToCsvAsync(List<TrendDataPoint> trends, TrendsRequest request);

        // ===== CASH FLOW EXPORTS =====
        Task<byte[]> ExportCashFlowToExcelAsync(List<CashFlowDataPoint> cashFlow, CashFlowRequest request);
        Task<byte[]> ExportCashFlowToCsvAsync(List<CashFlowDataPoint> cashFlow, CashFlowRequest request);

        // ===== HTML GENERATION =====
        Task<string> GenerateAnalysisHtmlAsync(AnalysisResponse analysis, AnalysisRequest request, string level = "basic");
    }
}
