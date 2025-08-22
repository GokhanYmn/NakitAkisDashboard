using Microsoft.AspNetCore.Mvc;
using NakitAkisDashboard.API.Models;
using NakitAkisDashboard.API.Models.ApiResponseWrapper;
using NakitAkisDashboard.API.Models.Response;
using NakitAkisDashboard.API.Services;

namespace NakitAkisDashboard.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VariablesController : ControllerBase
{
    private readonly INakitAkisService _nakitAkisService;
    private readonly ILogger<VariablesController> _logger;

    public VariablesController(INakitAkisService nakitAkisService, ILogger<VariablesController> logger)
    {
        _nakitAkisService = nakitAkisService;
        _logger = logger;
    }

    /// <summary>
    /// Tüm kaynak kuruluşları listesi
    /// </summary>
    [HttpGet("kaynak-kurulus")]
    public async Task<ActionResult<ApiResponse<List<VariableOption>>>> GetKaynakKuruluslar()
    {
        try
        {
            _logger.LogInformation("Kaynak kuruluşlar listesi istendi");

            var kuruluslar = await _nakitAkisService.GetKaynakKuruluslarAsync();

            var options = kuruluslar.Select(k => new VariableOption
            {
                Text = $"{k.KaynakKurulus} ({k.KayitSayisi:N0} kayıt - ₺{k.ToplamTutar:N0})",
                Value = k.KaynakKurulus,
                RecordCount = k.KayitSayisi,
                TotalAmount = k.ToplamTutar
            }).ToList();

            return Ok(new ApiResponse<List<VariableOption>>
            {
                Success = true,
                Message = $"{options.Count} kaynak kuruluş bulundu",
                Data = options,
                Count = options.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Kaynak kuruluşlar getirilemedi");

            return BadRequest(new ApiResponse<List<VariableOption>>
            {
                Success = false,
                Message = $"Kuruluş listesi hatası: {ex.Message}",
                Data = new List<VariableOption>()
            });
        }
    }

    /// <summary>
    /// Belirli kuruluş için fonlar listesi
    /// </summary>
    [HttpGet("fonlar")]
    public async Task<ActionResult<ApiResponse<List<VariableOption>>>> GetFonlar([FromQuery] string kaynakKurulus)
    {
        try
        {
            if (string.IsNullOrEmpty(kaynakKurulus))
            {
                return BadRequest(new ApiResponse<List<VariableOption>>
                {
                    Success = false,
                    Message = "Kaynak kuruluş parametresi gerekli",
                    Data = new List<VariableOption>()
                });
            }

            _logger.LogInformation("Fonlar listesi istendi: {KaynakKurulus}", kaynakKurulus);

            var fonlar = await _nakitAkisService.GetFonlarAsync(kaynakKurulus);

            var options = fonlar.Select(f => new VariableOption
            {
                Text = $"Fon {f.FonNo} ({f.KayitSayisi:N0} kayıt - ₺{f.ToplamTutar:N0})",
                Value = f.FonNo,
                RecordCount = f.KayitSayisi,
                TotalAmount = f.ToplamTutar
            }).ToList();

            return Ok(new ApiResponse<List<VariableOption>>
            {
                Success = true,
                Message = $"{options.Count} fon bulundu",
                Data = options,
                Count = options.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fonlar getirilemedi: {KaynakKurulus}", kaynakKurulus);

            return BadRequest(new ApiResponse<List<VariableOption>>
            {
                Success = false,
                Message = $"Fon listesi hatası: {ex.Message}",
                Data = new List<VariableOption>()
            });
        }
    }

    /// <summary>
    /// Belirli kuruluş ve fon için ihraçlar listesi
    /// </summary>
    [HttpGet("ihraclar")]
    public async Task<ActionResult<ApiResponse<List<VariableOption>>>> GetIhraclar(
        [FromQuery] string kaynakKurulus,
        [FromQuery] string fonNo)
    {
        try
        {
            if (string.IsNullOrEmpty(kaynakKurulus) || string.IsNullOrEmpty(fonNo))
            {
                return BadRequest(new ApiResponse<List<VariableOption>>
                {
                    Success = false,
                    Message = "Kaynak kuruluş ve fon numarası parametreleri gerekli",
                    Data = new List<VariableOption>()
                });
            }

            _logger.LogInformation("İhraçlar listesi istendi: {KaynakKurulus} - {FonNo}", kaynakKurulus, fonNo);

            var ihraclar = await _nakitAkisService.GetIhraclarAsync(kaynakKurulus, fonNo);

            var options = ihraclar.Select(i => new VariableOption
            {
                Text = $"İhraç {i.IhracNo} ({i.KayitSayisi:N0} kayıt - ₺{i.ToplamTutar:N0})",
                Value = i.IhracNo,
                RecordCount = i.KayitSayisi,
                TotalAmount = i.ToplamTutar
            }).ToList();

            return Ok(new ApiResponse<List<VariableOption>>
            {
                Success = true,
                Message = $"{options.Count} ihraç bulundu",
                Data = options,
                Count = options.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "İhraçlar getirilemedi: {KaynakKurulus} - {FonNo}", kaynakKurulus, fonNo);

            return BadRequest(new ApiResponse<List<VariableOption>>
            {
                Success = false,
                Message = $"İhraç listesi hatası: {ex.Message}",
                Data = new List<VariableOption>()
            });
        }
    }

    /// <summary>
    /// Hiyerarşik filtre verileri - tek seferde
    /// </summary>
    [HttpGet("hierarchy")]
    public async Task<ActionResult<ApiResponse<object>>> GetHierarchy([FromQuery] string? kaynakKurulus = null, [FromQuery] string? fonNo = null)
    {
        try
        {
            _logger.LogInformation("Hiyerarşik veriler istendi: {KaynakKurulus} - {FonNo}", kaynakKurulus, fonNo);

            // 1. Tüm kuruluşları al
            var kuruluslar = await _nakitAkisService.GetKaynakKuruluslarAsync();
            var kurulusOptions = kuruluslar.Select(k => new VariableOption
            {
                Text = $"{k.KaynakKurulus} ({k.KayitSayisi:N0} kayıt)",
                Value = k.KaynakKurulus,
                RecordCount = k.KayitSayisi,
                TotalAmount = k.ToplamTutar
            }).ToList();

            // 2. Eğer kuruluş seçilmişse fonları al
            List<VariableOption> fonOptions = new();
            if (!string.IsNullOrEmpty(kaynakKurulus))
            {
                var fonlar = await _nakitAkisService.GetFonlarAsync(kaynakKurulus);
                fonOptions = fonlar.Select(f => new VariableOption
                {
                    Text = $"Fon {f.FonNo} (₺{f.ToplamTutar:N0})",
                    Value = f.FonNo,
                    RecordCount = f.KayitSayisi,
                    TotalAmount = f.ToplamTutar
                }).ToList();
            }

            // 3. Eğer kuruluş ve fon seçilmişse ihraçları al
            List<VariableOption> ihracOptions = new();
            if (!string.IsNullOrEmpty(kaynakKurulus) && !string.IsNullOrEmpty(fonNo))
            {
                var ihraclar = await _nakitAkisService.GetIhraclarAsync(kaynakKurulus, fonNo);
                ihracOptions = ihraclar.Select(i => new VariableOption
                {
                    Text = $"İhraç {i.IhracNo} (₺{i.ToplamTutar:N0})",
                    Value = i.IhracNo,
                    RecordCount = i.KayitSayisi,
                    TotalAmount = i.ToplamTutar
                }).ToList();
            }

            var hierarchy = new
            {
                KaynakKuruluslar = kurulusOptions,
                Fonlar = fonOptions,
                Ihraclar = ihracOptions,
                HasKurulus = !string.IsNullOrEmpty(kaynakKurulus),
                HasFon = !string.IsNullOrEmpty(fonNo),
                TotalKurulus = kurulusOptions.Count,
                TotalFon = fonOptions.Count,
                TotalIhrac = ihracOptions.Count
            };

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Hiyerarşik veriler hazırlandı",
                Data = hierarchy,
                Count = kurulusOptions.Count + fonOptions.Count + ihracOptions.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Hiyerarşik veriler getirilemedi");

            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = $"Hiyerarşik veri hatası: {ex.Message}",
                Data = null
            });
        }
    }

    /// <summary>
    /// Filtre istatistikleri
    /// </summary>
    [HttpGet("stats")]
    public async Task<ActionResult<ApiResponse<object>>> GetFilterStats()
    {
        try
        {
            _logger.LogInformation("Filtre istatistikleri istendi");

            var kuruluslar = await _nakitAkisService.GetKaynakKuruluslarAsync();

            var stats = new
            {
                ToplamKurulus = kuruluslar.Count,
                ToplamKayit = kuruluslar.Sum(k => k.KayitSayisi),
                ToplamTutar = kuruluslar.Sum(k => k.ToplamTutar),
                EnBuyukKurulus = kuruluslar.OrderByDescending(k => k.ToplamTutar).FirstOrDefault()?.KaynakKurulus,
                EnAktifKurulus = kuruluslar.OrderByDescending(k => k.KayitSayisi).FirstOrDefault()?.KaynakKurulus,
                OrtalamaTutar = kuruluslar.Any() ? kuruluslar.Average(k => k.ToplamTutar) : 0,
                OrtalamaKayit = kuruluslar.Any() ? kuruluslar.Average(k => k.KayitSayisi) : 0
            };

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Filtre istatistikleri hazırlandı",
                Data = stats,
                Count = 1
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Filtre istatistikleri getirilemedi");

            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = $"İstatistik hatası: {ex.Message}",
                Data = null
            });
        }
    }
}