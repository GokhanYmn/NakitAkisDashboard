using Microsoft.AspNetCore.Mvc;
using NakitAkisDashboard.API.Models;
using NakitAkisDashboard.API.Models.ApiResponseWrapper;
using NakitAkisDashboard.API.Models.Request;
using NakitAkisDashboard.API.Models.Response;
using NakitAkisDashboard.API.Services;
using System.Linq;

namespace NakitAkisDashboard.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TrendsController : ControllerBase
{
    private readonly INakitAkisService _nakitAkisService;
    private readonly ILogger<TrendsController> _logger;

    public TrendsController(INakitAkisService nakitAkisService, ILogger<TrendsController> logger)
    {
        _nakitAkisService = nakitAkisService;
        _logger = logger;
    }

    /// <summary>
    /// Haftalık/Aylık trend verileri
    /// </summary>
    [HttpPost("data")]
    public async Task<ActionResult<ApiResponse<List<TrendDataPoint>>>> GetTrends([FromBody] TrendsRequest request)
    {
        try
        {
            _logger.LogInformation("Trends data requested for {KaynakKurulus} with period {Period}",
                request.KaynakKurulus, request.Period);

            var trends = await _nakitAkisService.GetTrendsAsync(request);

            return Ok(new ApiResponse<List<TrendDataPoint>>
            {
                Success = true,
                Message = $"{trends.Count} {request.Period} trend verisi alındı",
                Data = trends,
                Count = trends.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Trends data failed for {KaynakKurulus}", request.KaynakKurulus);

            return BadRequest(new ApiResponse<List<TrendDataPoint>>
            {
                Success = false,
                Message = $"Trend verileri alınamadı: {ex.Message}",
                Data = new List<TrendDataPoint>()
            });
        }
    }

    /// <summary>
    /// Basit trend verisi - query parametreleri ile
    /// </summary>
    [HttpGet("simple")]
    public async Task<ActionResult<ApiResponse<List<TrendDataPoint>>>> GetSimpleTrends(
        [FromQuery] string kaynakKurulus,
        [FromQuery] string period = "week",
        [FromQuery] string? fonNo = null,
        [FromQuery] string? ihracNo = null,
        [FromQuery] int limit = 100)
    {
        try
        {
            var request = new TrendsRequest
            {
                KaynakKurulus = kaynakKurulus,
                Period = period,
                FonNo = fonNo,
                IhracNo = ihracNo,
                Limit = limit
            };

            var trends = await _nakitAkisService.GetTrendsAsync(request);

            return Ok(new ApiResponse<List<TrendDataPoint>>
            {
                Success = true,
                Message = $"Basit trend verileri alındı",
                Data = trends,
                Count = trends.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Simple trends failed");

            return BadRequest(new ApiResponse<List<TrendDataPoint>>
            {
                Success = false,
                Message = $"Basit trend hatası: {ex.Message}",
                Data = new List<TrendDataPoint>()
            });
        }
    }

    /// <summary>
    /// Cash Flow Analysis verileri
    /// </summary>
    [HttpPost("cash-flow")]
    public async Task<ActionResult<ApiResponse<List<CashFlowDataPoint>>>> GetCashFlowAnalysis([FromBody] CashFlowRequest request)
    {
        try
        {
            _logger.LogInformation("Cash flow analysis requested with period {Period}", request.Period);

            var cashFlowData = await _nakitAkisService.GetCashFlowAnalysisAsync(request);

            return Ok(new ApiResponse<List<CashFlowDataPoint>>
            {
                Success = true,
                Message = $"{cashFlowData.Count} {request.Period} cash flow verisi alındı",
                Data = cashFlowData,
                Count = cashFlowData.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Cash flow analysis failed");

            return BadRequest(new ApiResponse<List<CashFlowDataPoint>>
            {
                Success = false,
                Message = $"Cash flow analizi hatası: {ex.Message}",
                Data = new List<CashFlowDataPoint>()
            });
        }
    }

    /// <summary>
    /// Cash Flow Analysis - basit endpoint
    /// </summary>
    [HttpGet("cash-flow")]
    public async Task<ActionResult<ApiResponse<List<CashFlowDataPoint>>>> GetCashFlowAnalysisSimple(
        [FromQuery] string period = "month",
        [FromQuery] int limit = 100)
    {
        try
        {
            var request = new CashFlowRequest
            {
                Period = period,
                Limit = limit
            };

            var cashFlowData = await _nakitAkisService.GetCashFlowAnalysisAsync(request);

            return Ok(new ApiResponse<List<CashFlowDataPoint>>
            {
                Success = true,
                Message = "Cash flow analizi tamamlandı",
                Data = cashFlowData,
                Count = cashFlowData.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Simple cash flow analysis failed");

            return BadRequest(new ApiResponse<List<CashFlowDataPoint>>
            {
                Success = false,
                Message = $"Basit cash flow hatası: {ex.Message}",
                Data = new List<CashFlowDataPoint>()
            });
        }
    }

    /// <summary>
    /// Trend özeti ve istatistikleri
    /// </summary>
    [HttpGet("summary")]
    public async Task<ActionResult<ApiResponse<object>>> GetTrendsSummary(
        [FromQuery] string kaynakKurulus,
        [FromQuery] string period = "week")
    {
        try
        {
            var request = new TrendsRequest
            {
                KaynakKurulus = kaynakKurulus,
                Period = period,
                Limit = 50
            };

            var trends = await _nakitAkisService.GetTrendsAsync(request);

            if (!trends.Any())
            {
                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Trend verisi bulunamadı",
                    Data = new { HasData = false },
                    Count = 0
                });
            }

            var summary = new
            {
                HasData = true,
                PeriodType = period,
                DataPointCount = trends.Count,
                DateRange = new
                {
                    Start = trends.Min(t => t.Tarih),
                    End = trends.Max(t => t.Tarih)
                },
                TotalStats = new
                {
                    KumulatifMevduat = trends.Max(t => t.KumulatifMevduat),
                    KumulatifFaizKazanci = trends.Max(t => t.KumulatifFaizKazanci),
                    ToplamIslemSayisi = trends.Sum(t => t.HaftalikIslemSayisi)
                },
                GrowthStats = new
                {
                    OrtalamaBuyume = trends.Where(t => t.HaftalikBuyumeYuzde != 0).Any() ?
                        trends.Where(t => t.HaftalikBuyumeYuzde != 0).Average(t => t.HaftalikBuyumeYuzde) : 0,
                    MaxBuyume = trends.Max(t => t.HaftalikBuyumeYuzde),
                    MinBuyume = trends.Min(t => t.HaftalikBuyumeYuzde)
                },
                PerformanceScore = CalculatePerformanceScore(trends),
                TopFonlar = trends.GroupBy(t => t.FonNo)
                    .Select(g => new {
                        FonNo = g.Key,
                        ToplamKazanc = g.Sum(t => t.KumulatifFaizKazanci),
                        ToplamMevduat = g.Sum(t => t.KumulatifMevduat)
                    })
                    .OrderByDescending(f => f.ToplamKazanc)
                    .Take(5)
                    .ToList()
            };

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Trend özeti hazırlandı",
                Data = summary,
                Count = 1
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Trends summary failed");

            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = $"Trend özeti hatası: {ex.Message}",
                Data = null
            });
        }
    }

    /// <summary>
    /// Karşılaştırmalı trend analizi - birden fazla kuruluş
    /// </summary>
    [HttpPost("compare")]
    public async Task<ActionResult<ApiResponse<List<object>>>> CompareTrends([FromBody] List<TrendsRequest> requests)
    {
        try
        {
            _logger.LogInformation("Comparison trends requested for {Count} kuruluş", requests.Count);

            var comparisonResults = new List<object>();

            foreach (var request in requests)
            {
                var trends = await _nakitAkisService.GetTrendsAsync(request);

                var comparisonData = new
                {
                    KaynakKurulus = request.KaynakKurulus,
                    Period = request.Period,
                    TrendCount = trends.Count,
                    TotalKumulatifMevduat = trends.Any() ? trends.Max(t => t.KumulatifMevduat) : 0,
                    TotalKumulatifFaiz = trends.Any() ? trends.Max(t => t.KumulatifFaizKazanci) : 0,
                    AvgGrowthRate = trends.Where(t => t.HaftalikBuyumeYuzde != 0).Any() ?
                        trends.Where(t => t.HaftalikBuyumeYuzde != 0).Average(t => t.HaftalikBuyumeYuzde) : 0,
                    PerformanceScore = CalculatePerformanceScore(trends),
                    LastPeriodData = trends.OrderByDescending(t => t.Tarih).FirstOrDefault()
                };

                comparisonResults.Add(comparisonData);
            }

            return Ok(new ApiResponse<List<object>>
            {
                Success = true,
                Message = $"{comparisonResults.Count} kuruluş karşılaştırıldı",
                Data = comparisonResults,
                Count = comparisonResults.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Comparison trends failed");

            return BadRequest(new ApiResponse<List<object>>
            {
                Success = false,
                Message = $"Karşılaştırma trend analizi hatası: {ex.Message}",
                Data = new List<object>()
            });
        }
    }

    /// <summary>
    /// Trend tahmin modeli (basit linear regression)
    /// </summary>
    [HttpGet("forecast")]
    public async Task<ActionResult<ApiResponse<object>>> GetTrendForecast(
        [FromQuery] string kaynakKurulus,
        [FromQuery] string period = "week",
        [FromQuery] int forecastPeriods = 4)
    {
        try
        {
            var request = new TrendsRequest
            {
                KaynakKurulus = kaynakKurulus,
                Period = period,
                Limit = 20 // Son 20 periyot için tahmin
            };

            var trends = await _nakitAkisService.GetTrendsAsync(request);

            if (trends.Count < 3)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Tahmin için yeterli veri yok (minimum 3 periyot gerekli)",
                    Data = null
                });
            }

            // Basit linear regression ile tahmin
            var forecastData = CalculateSimpleForecast(trends, forecastPeriods, period);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = $"{forecastPeriods} periyot tahmin hesaplandı",
                Data = new
                {
                    HistoricalData = trends.OrderBy(t => t.Tarih).ToList(),
                    ForecastData = forecastData,
                    ForecastMethod = "Linear Regression",
                    Confidence = CalculateForecastConfidence(trends),
                    Warning = "Bu tahminler geçmiş verilere dayalı basit hesaplamadır. Yatırım kararlarında kullanmayın."
                },
                Count = trends.Count + forecastData.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Trend forecast failed");

            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = $"Trend tahmini hatası: {ex.Message}",
                Data = null
            });
        }
    }

    /// <summary>
    /// Real-time trend status - son veriler
    /// </summary>
    [HttpGet("realtime")]
    public async Task<ActionResult<ApiResponse<object>>> GetRealtimeTrendStatus(
        [FromQuery] string kaynakKurulus)
    {
        try
        {
            var request = new TrendsRequest
            {
                KaynakKurulus = kaynakKurulus,
                Period = "day",
                Limit = 7 // Son 7 gün
            };

            var dailyTrends = await _nakitAkisService.GetTrendsAsync(request);

            var weeklyRequest = new TrendsRequest
            {
                KaynakKurulus = kaynakKurulus,
                Period = "week",
                Limit = 4 // Son 4 hafta
            };

            var weeklyTrends = await _nakitAkisService.GetTrendsAsync(weeklyRequest);

            var realtimeStatus = new
            {
                LastUpdate = DateTime.UtcNow,
                KaynakKurulus = kaynakKurulus,
                Daily = new
                {
                    TodaysData = dailyTrends.OrderByDescending(t => t.Tarih).FirstOrDefault(),
                    WeekTrend = dailyTrends.Count >= 2 ?
                        dailyTrends.OrderByDescending(t => t.Tarih).Take(2).ToList() :
                        dailyTrends,
                    DailyGrowth = CalculateDailyGrowth(dailyTrends)
                },
                Weekly = new
                {
                    CurrentWeek = weeklyTrends.OrderByDescending(t => t.Tarih).FirstOrDefault(),
                    MonthTrend = weeklyTrends,
                    WeeklyGrowth = CalculateWeeklyGrowth(weeklyTrends)
                },
                Alerts = GenerateTrendAlerts(dailyTrends, weeklyTrends),
                Status = DetermineOverallTrendStatus(dailyTrends, weeklyTrends)
            };

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Real-time trend durumu hazırlandı",
                Data = realtimeStatus,
                Count = 1
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Realtime trend status failed");

            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = $"Real-time trend hatası: {ex.Message}",
                Data = null
            });
        }
    }

    // ===== PRIVATE HELPER METHODS =====

    /// <summary>
    /// Performans skorunu hesapla
    /// </summary>
    private static string CalculatePerformanceScore(List<TrendDataPoint> trends)
    {
        if (!trends.Any()) return "Veri Yok";

        var avgGrowth = trends.Where(t => t.HaftalikBuyumeYuzde != 0).Any() ?
            trends.Where(t => t.HaftalikBuyumeYuzde != 0).Average(t => t.HaftalikBuyumeYuzde) : 0;

        return avgGrowth switch
        {
            > 15 => "🌟 Mükemmel",
            > 8 => "✅ İyi",
            > 3 => "📊 Orta",
            > 0 => "⚠️ Zayıf",
            _ => "🔴 Negatif"
        };
    }

    /// <summary>
    /// Basit forecast hesaplama
    /// </summary>
    private static List<object> CalculateSimpleForecast(List<TrendDataPoint> trends, int periods, string periodType)
    {
        var sortedTrends = trends.OrderBy(t => t.Tarih).ToList();
        var lastDate = sortedTrends.Last().Tarih;
        var lastValue = sortedTrends.Last().KumulatifFaizKazanci;

        // Basit linear trend hesaplama
        var avgGrowth = sortedTrends.Where(t => t.HaftalikBuyumeYuzde != 0).Any() ?
            sortedTrends.Where(t => t.HaftalikBuyumeYuzde != 0).Average(t => t.HaftalikBuyumeYuzde) : 0;

        var forecasts = new List<object>();
        var currentValue = lastValue;
        var currentDate = lastDate;

        for (int i = 1; i <= periods; i++)
        {
            currentDate = periodType switch
            {
                "day" => currentDate.AddDays(1),
                "week" => currentDate.AddDays(7),
                "month" => currentDate.AddMonths(1),
                _ => currentDate.AddDays(7)
            };

            currentValue = currentValue * (1 + (avgGrowth / 100));

            forecasts.Add(new
            {
                Tarih = currentDate,
                Period = currentDate.ToString("yyyy-MM-dd"),
                ForecastKumulatifFaiz = currentValue,
                ForecastType = "Linear Projection",
                Confidence = Math.Max(50 - (i * 10), 10) // Confidence azalır
            });
        }

        return forecasts;
    }

    /// <summary>
    /// Forecast confidence hesaplama
    /// </summary>
    private static int CalculateForecastConfidence(List<TrendDataPoint> trends)
    {
        if (trends.Count < 5) return 30;
        if (trends.Count < 10) return 50;

        // Volatilite kontrolü
        var growthRates = trends.Where(t => t.HaftalikBuyumeYuzde != 0)
                               .Select(t => t.HaftalikBuyumeYuzde).ToList();

        if (!growthRates.Any()) return 40;

        var avgGrowth = growthRates.Average();
        var variance = growthRates.Sum(g => Math.Pow((double)(g - avgGrowth), 2)) / growthRates.Count;
        var stdDev = Math.Sqrt(variance);

        // Düşük volatilite = yüksek confidence
        return stdDev switch
        {
            < 5 => 80,
            < 10 => 70,
            < 20 => 60,
            _ => 40
        };
    }

    /// <summary>
    /// Günlük büyüme hesaplama
    /// </summary>
    private static decimal CalculateDailyGrowth(List<TrendDataPoint> dailyTrends)
    {
        if (dailyTrends.Count < 2) return 0;

        var sorted = dailyTrends.OrderByDescending(t => t.Tarih).Take(2).ToList();
        var today = sorted[0];
        var yesterday = sorted[1];

        if (yesterday.KumulatifFaizKazanci == 0) return 0;

        return ((today.KumulatifFaizKazanci - yesterday.KumulatifFaizKazanci) / yesterday.KumulatifFaizKazanci) * 100;
    }

    /// <summary>
    /// Haftalık büyüme hesaplama
    /// </summary>
    private static decimal CalculateWeeklyGrowth(List<TrendDataPoint> weeklyTrends)
    {
        if (weeklyTrends.Count < 2) return 0;

        var sorted = weeklyTrends.OrderByDescending(t => t.Tarih).Take(2).ToList();
        var thisWeek = sorted[0];
        var lastWeek = sorted[1];

        if (lastWeek.KumulatifFaizKazanci == 0) return 0;

        return ((thisWeek.KumulatifFaizKazanci - lastWeek.KumulatifFaizKazanci) / lastWeek.KumulatifFaizKazanci) * 100;
    }

    /// <summary>
    /// Trend uyarıları oluştur
    /// </summary>
    private static List<object> GenerateTrendAlerts(List<TrendDataPoint> dailyTrends, List<TrendDataPoint> weeklyTrends)
    {
        var alerts = new List<object>();

        // Günlük kontroller
        var dailyGrowth = CalculateDailyGrowth(dailyTrends);
        if (dailyGrowth < -10)
        {
            alerts.Add(new
            {
                Type = "warning",
                Level = "high",
                Message = $"Günlük büyüme %{dailyGrowth:F1} - Dikkat gerekli",
                Timestamp = DateTime.UtcNow
            });
        }

        // Haftalık kontroller
        var weeklyGrowth = CalculateWeeklyGrowth(weeklyTrends);
        if (weeklyGrowth > 20)
        {
            alerts.Add(new
            {
                Type = "success",
                Level = "info",
                Message = $"Haftalık büyüme %{weeklyGrowth:F1} - Mükemmel performans",
                Timestamp = DateTime.UtcNow
            });
        }

        // Veri eksikliği kontrolü
        if (dailyTrends.Count < 3)
        {
            alerts.Add(new
            {
                Type = "info",
                Level = "low",
                Message = "Son günlerde veri eksikliği mevcut",
                Timestamp = DateTime.UtcNow
            });
        }

        return alerts;
    }

    /// <summary>
    /// Genel trend durumu belirle
    /// </summary>
    private static string DetermineOverallTrendStatus(List<TrendDataPoint> dailyTrends, List<TrendDataPoint> weeklyTrends)
    {
        var dailyGrowth = CalculateDailyGrowth(dailyTrends);
        var weeklyGrowth = CalculateWeeklyGrowth(weeklyTrends);

        if (dailyGrowth > 5 && weeklyGrowth > 10) return "🚀 Excellent";
        if (dailyGrowth > 0 && weeklyGrowth > 5) return "✅ Good";
        if (dailyGrowth > -5 && weeklyGrowth > 0) return "📊 Stable";
        if (dailyGrowth > -10 && weeklyGrowth > -5) return "⚠️ Warning";

        return "🔴 Critical";
    }
}