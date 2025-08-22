using Microsoft.AspNetCore.Mvc;
using NakitAkisDashboard.API.Models;
using NakitAkisDashboard.API.Models.ApiResponseWrapper;
using NakitAkisDashboard.API.Models.Request;
using NakitAkisDashboard.API.Models.Response;
using NakitAkisDashboard.API.Services;

namespace NakitAkisDashboard.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalysisController : ControllerBase
{
    private readonly INakitAkisService _nakitAkisService;
    private readonly ILogger<AnalysisController> _logger;

    public AnalysisController(INakitAkisService nakitAkisService, ILogger<AnalysisController> logger)
    {
        _nakitAkisService = nakitAkisService;
        _logger = logger;
    }

    /// <summary>
    /// Nakit akış analizi hesaplama
    /// </summary>
    [HttpPost("calculate")]
    public async Task<ActionResult<ApiResponse<AnalysisResponse>>> CalculateAnalysis([FromBody] AnalysisRequest request)
    {
        try
        {
            _logger.LogInformation("Analysis calculation started for {KaynakKurulus} with {FaizOrani}%",
                request.KaynakKurulus, request.FaizOrani);

            var result = await _nakitAkisService.CalculateAnalysisAsync(request);

            return Ok(new ApiResponse<AnalysisResponse>
            {
                Success = true,
                Message = "Analiz başarıyla hesaplandı",
                Data = result,
                Count = 1
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Analysis calculation failed for {KaynakKurulus}", request.KaynakKurulus);

            return BadRequest(new ApiResponse<AnalysisResponse>
            {
                Success = false,
                Message = $"Analiz hesaplama hatası: {ex.Message}",
                Data = null
            });
        }
    }

    /// <summary>
    /// Basit analiz - sadece kuruluş ve faiz oranı ile
    /// </summary>
    [HttpGet("simple")]
    public async Task<ActionResult<ApiResponse<AnalysisResponse>>> GetSimpleAnalysis(
        [FromQuery] string kaynakKurulus,
        [FromQuery] decimal faizOrani,
        [FromQuery] string? fonNo = null,
        [FromQuery] string? ihracNo = null)
    {
        try
        {
            var request = new AnalysisRequest
            {
                KaynakKurulus = kaynakKurulus,
                FaizOrani = faizOrani,
                FonNo = fonNo,
                IhracNo = ihracNo
            };

            var result = await _nakitAkisService.CalculateAnalysisAsync(request);

            return Ok(new ApiResponse<AnalysisResponse>
            {
                Success = true,
                Message = "Basit analiz tamamlandı",
                Data = result,
                Count = 1
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Simple analysis failed");

            return BadRequest(new ApiResponse<AnalysisResponse>
            {
                Success = false,
                Message = $"Basit analiz hatası: {ex.Message}",
                Data = null
            });
        }
    }

    /// <summary>
    /// Karşılaştırmalı analiz - birden fazla kuruluş
    /// </summary>
    [HttpPost("compare")]
    public async Task<ActionResult<ApiResponse<List<AnalysisResponse>>>> CompareAnalysis([FromBody] List<AnalysisRequest> requests)
    {
        try
        {
            _logger.LogInformation("Comparison analysis started for {Count} kuruluş", requests.Count);

            var results = new List<AnalysisResponse>();

            foreach (var request in requests)
            {
                var result = await _nakitAkisService.CalculateAnalysisAsync(request);
                results.Add(result);
            }

            return Ok(new ApiResponse<List<AnalysisResponse>>
            {
                Success = true,
                Message = $"{results.Count} kuruluş karşılaştırıldı",
                Data = results,
                Count = results.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Comparison analysis failed");

            return BadRequest(new ApiResponse<List<AnalysisResponse>>
            {
                Success = false,
                Message = $"Karşılaştırma analizi hatası: {ex.Message}",
                Data = null
            });
        }
    }

    /// <summary>
    /// Detaylı analiz özeti
    /// </summary>
    [HttpGet("summary")]
    public async Task<ActionResult<ApiResponse<object>>> GetAnalysisSummary(
        [FromQuery] string kaynakKurulus,
        [FromQuery] decimal faizOrani)
    {
        try
        {
            var request = new AnalysisRequest
            {
                KaynakKurulus = kaynakKurulus,
                FaizOrani = faizOrani
            };

            var analysis = await _nakitAkisService.CalculateAnalysisAsync(request);
            var fonlar = await _nakitAkisService.GetFonlarAsync(kaynakKurulus);

            var summary = new
            {
                Analysis = analysis,
                FonSayisi = fonlar.Count,
                ToplamFonTutari = fonlar.Sum(f => f.ToplamTutar),
                OrtalamaPonTutari = fonlar.Any() ? fonlar.Average(f => f.ToplamTutar) : 0,
                PerformansSkoru = analysis.FarkYuzdesi switch
                {
                    > 10 => "Mükemmel",
                    > 5 => "İyi",
                    > 0 => "Orta",
                    > -5 => "Zayıf",
                    _ => "Çok Zayıf"
                },
                RiskSeviyesi = Math.Abs(analysis.FarkYuzdesi) switch
                {
                    < 5 => "Düşük",
                    < 15 => "Orta",
                    _ => "Yüksek"
                }
            };

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Analiz özeti hazırlandı",
                Data = summary,
                Count = 1
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Analysis summary failed");

            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = $"Analiz özeti hatası: {ex.Message}",
                Data = null
            });
        }
    }
}