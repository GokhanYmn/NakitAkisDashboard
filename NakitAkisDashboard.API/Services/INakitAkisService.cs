using NakitAkisDashboard.API.Models.ApiResponseWrapper;
using NakitAkisDashboard.API.Models.Info;
using NakitAkisDashboard.API.Models.Request;
using NakitAkisDashboard.API.Models.Response;

namespace NakitAkisDashboard.API.Services
{
    public interface INakitAkisService
    {
        // ===== ANALYSIS METHODS =====
        Task<AnalysisResponse> CalculateAnalysisAsync(AnalysisRequest request);
        Task<List<AnalysisResponse>> CompareAnalysisAsync(List<AnalysisRequest> requests);

        // ===== TRENDS METHODS =====
        Task<List<TrendDataPoint>> GetTrendsAsync(TrendsRequest request);
        Task<List<CashFlowDataPoint>> GetCashFlowAnalysisAsync(CashFlowRequest request);

        // ===== VARIABLES METHODS =====
        Task<List<KaynakKurulusBilgi>> GetKaynakKuruluslarAsync();
        Task<List<FonBilgi>> GetFonlarAsync(string kaynakKurulus);
        Task<List<IhracBilgi>> GetIhraclarAsync(string kaynakKurulus, string fonNo);

        // ===== UTILITY METHODS =====
        Task<bool> TestConnectionAsync();
        Task<HealthCheckResponse> GetHealthAsync();
    }
}
