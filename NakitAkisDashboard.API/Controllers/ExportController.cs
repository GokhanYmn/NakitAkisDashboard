using Microsoft.AspNetCore.Mvc;
using NakitAkisDashboard.API.Models;
using NakitAkisDashboard.API.Models.ApiResponseWrapper;
using NakitAkisDashboard.API.Models.Request;
using NakitAkisDashboard.API.Services;

namespace NakitAkisDashboard.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExportController : ControllerBase
{
    private readonly INakitAkisService _nakitAkisService;
    private readonly IExportService _exportService;
    private readonly ILogger<ExportController> _logger;

    public ExportController(
        INakitAkisService nakitAkisService,
        IExportService exportService,
        ILogger<ExportController> logger)
    {
        _nakitAkisService = nakitAkisService;
        _exportService = exportService;
        _logger = logger;
    }

    /// <summary>
    /// Analiz raporunu export et
    /// </summary>
    [HttpPost("analysis")]
    public async Task<IActionResult> ExportAnalysis([FromBody] ExportRequest request)
    {
        try
        {
            _logger.LogInformation("Export analysis requested: {Level} - {Format}", request.Level, request.Format);

            // Önce analiz hesapla
            var analysisResult = await _nakitAkisService.CalculateAnalysisAsync(request.AnalysisData);

            // Export seviyesine göre işle
            byte[] fileData;
            string fileName;
            string contentType;

            switch (request.Format.ToLower())
            {
                case "pdf":
                    fileData = await _exportService.ExportAnalysisToPdfAsync(analysisResult, request.AnalysisData, request.Level);
                    fileName = $"nakit-akis-analizi-{request.Level}-{DateTime.Now:yyyyMMdd-HHmmss}.pdf";
                    contentType = "application/pdf";
                    break;

                case "excel":
                    fileData = await _exportService.ExportAnalysisToExcelAsync(analysisResult, request.AnalysisData, request.Level);
                    fileName = $"nakit-akis-analizi-{request.Level}-{DateTime.Now:yyyyMMdd-HHmmss}.xlsx";
                    contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                    break;

                default:
                    return BadRequest(new { error = "Desteklenmeyen format. 'pdf' veya 'excel' kullanın." });
            }

            _logger.LogInformation("Export completed: {FileName} ({Size} bytes)", fileName, fileData.Length);

            return File(fileData, contentType, fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Analysis export failed");
            return BadRequest(new { error = $"Export hatası: {ex.Message}" });
        }
    }

    /// <summary>
    /// Trend raporunu export et
    /// </summary>
    [HttpPost("trends")]
    public async Task<IActionResult> ExportTrends([FromBody] TrendsRequest trendsRequest, [FromQuery] string format = "excel")
    {
        try
        {
            _logger.LogInformation("Export trends requested: {KaynakKurulus} - {Format}", trendsRequest.KaynakKurulus, format);

            // Trend verilerini al
            var trendsData = await _nakitAkisService.GetTrendsAsync(trendsRequest);

            if (!trendsData.Any())
            {
                return BadRequest(new { error = "Export için veri bulunamadı" });
            }

            // Export formatına göre işle
            byte[] fileData;
            string fileName;
            string contentType;

            switch (format.ToLower())
            {
                case "excel":
                    fileData = await _exportService.ExportTrendsToExcelAsync(trendsData, trendsRequest);
                    fileName = $"trend-analizi-{trendsRequest.KaynakKurulus}-{DateTime.Now:yyyyMMdd-HHmmss}.xlsx";
                    contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                    break;

                case "csv":
                    fileData = await _exportService.ExportTrendsToCsvAsync(trendsData, trendsRequest);
                    fileName = $"trend-analizi-{trendsRequest.KaynakKurulus}-{DateTime.Now:yyyyMMdd-HHmmss}.csv";
                    contentType = "text/csv";
                    break;

                default:
                    return BadRequest(new { error = "Desteklenmeyen format. 'excel' veya 'csv' kullanın." });
            }

            return File(fileData, contentType, fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Trends export failed");
            return BadRequest(new { error = $"Trend export hatası: {ex.Message}" });
        }
    }

    /// <summary>
    /// Cash Flow raporunu export et
    /// </summary>
    [HttpPost("cash-flow")]
    public async Task<IActionResult> ExportCashFlow([FromBody] CashFlowRequest cashFlowRequest, [FromQuery] string format = "excel")
    {
        try
        {
            _logger.LogInformation("Export cash flow requested: {Period} - {Format}", cashFlowRequest.Period, format);

            // Cash flow verilerini al
            var cashFlowData = await _nakitAkisService.GetCashFlowAnalysisAsync(cashFlowRequest);

            if (!cashFlowData.Any())
            {
                return BadRequest(new { error = "Cash flow export için veri bulunamadı" });
            }

            // Export formatına göre işle
            byte[] fileData;
            string fileName;
            string contentType;

            switch (format.ToLower())
            {
                case "excel":
                    fileData = await _exportService.ExportCashFlowToExcelAsync(cashFlowData, cashFlowRequest);
                    fileName = $"cash-flow-analizi-{cashFlowRequest.Period}-{DateTime.Now:yyyyMMdd-HHmmss}.xlsx";
                    contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                    break;

                case "csv":
                    fileData = await _exportService.ExportCashFlowToCsvAsync(cashFlowData, cashFlowRequest);
                    fileName = $"cash-flow-analizi-{cashFlowRequest.Period}-{DateTime.Now:yyyyMMdd-HHmmss}.csv";
                    contentType = "text/csv";
                    break;

                default:
                    return BadRequest(new { error = "Desteklenmeyen format. 'excel' veya 'csv' kullanın." });
            }

            return File(fileData, contentType, fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Cash flow export failed");
            return BadRequest(new { error = $"Cash flow export hatası: {ex.Message}" });
        }
    }

    /// <summary>
    /// Hızlı excel export - sadece analiz sonucu
    /// </summary>
    [HttpGet("quick-excel")]
    public async Task<IActionResult> QuickExcelExport(
        [FromQuery] string kaynakKurulus,
        [FromQuery] decimal faizOrani,
        [FromQuery] string? fonNo = null,
        [FromQuery] string? ihracNo = null)
    {
        try
        {
            var analysisRequest = new AnalysisRequest
            {
                KaynakKurulus = kaynakKurulus,
                FaizOrani = faizOrani,
                FonNo = fonNo,
                IhracNo = ihracNo
            };

            var analysisResult = await _nakitAkisService.CalculateAnalysisAsync(analysisRequest);
            var fileData = await _exportService.ExportAnalysisToExcelAsync(analysisResult, analysisRequest, "basic");
            var fileName = $"hizli-analiz-{kaynakKurulus}-{DateTime.Now:yyyyMMdd-HHmmss}.xlsx";

            return File(fileData, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Quick excel export failed");
            return BadRequest(new { error = $"Hızlı excel export hatası: {ex.Message}" });
        }
    }

    /// <summary>
    /// Export formatları listesi
    /// </summary>
    [HttpGet("formats")]
    public IActionResult GetExportFormats()
    {
        var formats = new
        {
            Analysis = new[]
            {
                new { Value = "pdf", Text = "📄 PDF Raporu", Description = "Detaylı analiz raporu" },
                new { Value = "excel", Text = "📊 Excel Tablosu", Description = "Veri analizi için" }
            },
            Trends = new[]
            {
                new { Value = "excel", Text = "📊 Excel Tablosu", Description = "Trend verileri" },
                new { Value = "csv", Text = "📋 CSV Dosyası", Description = "Ham veri export" }
            },
            CashFlow = new[]
            {
                new { Value = "excel", Text = "📊 Excel Tablosu", Description = "Cash flow analizi" },
                new { Value = "csv", Text = "📋 CSV Dosyası", Description = "Ham veri export" }
            },
            Levels = new[]
            {
                new { Value = "basic", Text = "📋 Basit Özet", Description = "Temel analiz sonuçları" },
                new { Value = "detailed", Text = "📊 Detaylı Analiz", Description = "İstatistikler + breakdown" },
                new { Value = "full", Text = "📈 Tam Rapor", Description = "Görseller + öneriler" }
            }
        };

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Message = "Export formatları listelendi",
            Data = formats,
            Count = 1
        });
    }
}