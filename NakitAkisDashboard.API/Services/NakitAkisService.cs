using Dapper;
using NakitAkisDashboard.API.Models.ApiResponseWrapper;
using NakitAkisDashboard.API.Models.Info;
using NakitAkisDashboard.API.Models.Request;
using NakitAkisDashboard.API.Models.Response;
using Npgsql;

namespace NakitAkisDashboard.API.Services
{
    public class NakitAkisService : INakitAkisService
    {
        private readonly string _connectionString;
        private readonly ILogger<NakitAkisService> _logger;

        public NakitAkisService(IConfiguration configuration, ILogger<NakitAkisService> logger)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") ??
                throw new ArgumentNullException("DefaultConnection string is required");
            _logger = logger;
        }

        // ===== ANALYSIS METHODS =====
        public async Task<AnalysisResponse> CalculateAnalysisAsync(AnalysisRequest request)
        {
            try
            {
                using var connection = new NpgsqlConnection(_connectionString);
                await connection.OpenAsync();

                var sql = BuildAnalysisQuery(request);
                _logger.LogInformation("Executing analysis query for {KaynakKurulus} with {FaizOrani}%",
                    request.KaynakKurulus, request.FaizOrani);

                var result = await connection.QueryFirstOrDefaultAsync<dynamic>(sql, new
                {
                    FaizOrani = (double)request.FaizOrani / 100.0, // Yüzde olarak
                    ModelFaizOrani = (double)request.FaizOrani / 100.0,
                    KaynakKurulus = request.KaynakKurulus,
                    BaslangicTarihi = request.BaslangicTarihi,
                    BitisTarihi = request.BitisTarihi,
                    SecilenFonNo = request.FonNo,
                    SecilenIhracNo = request.IhracNo
                });

                decimal toplamFaiz = 0;
                decimal modelFaiz = 0;

                if (result != null)
                {
                    toplamFaiz = SafeConvertToDecimal(result.sum);
                    modelFaiz = SafeConvertToDecimal(result.sum1);
                }

                return new AnalysisResponse
                {
                    ToplamFaizTutari = toplamFaiz,
                    ToplamModelFaizTutari = modelFaiz,
                    FaizOrani = request.FaizOrani,
                    KaynakKurulus = request.KaynakKurulus,
                    FonNo = request.FonNo,
                    IhracNo = request.IhracNo,
                    CalculatedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Analysis calculation failed for {KaynakKurulus}", request.KaynakKurulus);

                // Hata durumunda default değerler döndür
                return new AnalysisResponse
                {
                    ToplamFaizTutari = 0,
                    ToplamModelFaizTutari = 0,
                    FaizOrani = request.FaizOrani,
                    KaynakKurulus = request.KaynakKurulus,
                    FonNo = request.FonNo,
                    IhracNo = request.IhracNo,
                    CalculatedAt = DateTime.UtcNow
                };
            }
        }

        public async Task<List<AnalysisResponse>> CompareAnalysisAsync(List<AnalysisRequest> requests)
        {
            var results = new List<AnalysisResponse>();

            foreach (var request in requests)
            {
                var result = await CalculateAnalysisAsync(request);
                results.Add(result);
            }

            return results;
        }

        // ===== TRENDS METHODS =====
        public async Task<List<TrendDataPoint>> GetTrendsAsync(TrendsRequest request)
        {
            try
            {
                using var connection = new NpgsqlConnection(_connectionString);
                await connection.OpenAsync();

                var sql = BuildTrendsQuery(request);
                _logger.LogInformation("Getting trends for {KaynakKurulus} with period {Period}",
                    request.KaynakKurulus, request.Period);

                var result = await connection.QueryAsync<dynamic>(sql, new
                {
                    KaynakKurulus = request.KaynakKurulus,
                    FonNo = request.FonNo,
                    IhracNo = request.IhracNo,
                    FromDate = DateTime.UtcNow.AddMonths(-12), // Son 12 ay
                    ToDate = DateTime.UtcNow,
                    Limit = request.Limit
                });

                return result.Select(r => new TrendDataPoint
                {
                    Timestamp = ((DateTimeOffset)((DateTime)r.hafta)).ToUnixTimeMilliseconds(),
                    Tarih = (DateTime)r.hafta,
                    Period = ((DateTime)r.hafta).ToString("yyyy-MM-dd"),
                    FonNo = r.fon_no_str?.ToString() ?? "bilinmiyor",
                    HaftalikMevduat = Convert.ToDecimal(r.haftalik_mevduat ?? 0),
                    KumulatifMevduat = Convert.ToDecimal(r.kumulatif_mevduat ?? 0),
                    HaftalikFaizKazanci = Convert.ToDecimal(r.haftalik_faiz_kazanci ?? 0),
                    KumulatifFaizKazanci = Convert.ToDecimal(r.kumulatif_faiz_kazanci ?? 0),
                    HaftalikBuyumeYuzde = Convert.ToDecimal(r.haftalik_buyume_yuzde ?? 0),
                    KumulatifBuyumeYuzde = Convert.ToDecimal(r.kumulatif_buyume_yuzde ?? 0),
                    HaftalikIslemSayisi = Convert.ToInt32(r.haftalik_islem_sayisi ?? 0),
                    OrtalamaPaizOrani = Convert.ToDecimal(r.ortalama_faiz_orani ?? 0),
                    KaynakKurulus = request.KaynakKurulus
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Trends query failed for {KaynakKurulus}", request.KaynakKurulus);
                return new List<TrendDataPoint>();
            }
        }

        public async Task<List<CashFlowDataPoint>> GetCashFlowAnalysisAsync(CashFlowRequest request)
        {
            try
            {
                using var connection = new NpgsqlConnection(_connectionString);
                await connection.OpenAsync();

                var sql = BuildCashFlowQuery(request);
                _logger.LogInformation("Getting cash flow analysis with period {Period}", request.Period);

                var result = await connection.QueryAsync<dynamic>(sql, new
                {
                    Limit = request.Limit
                });

                return result.Select(r => new CashFlowDataPoint
                {
                    Timestamp = ((DateTimeOffset)((DateTime)r.period_date)).ToUnixTimeMilliseconds(),
                    Tarih = (DateTime)r.period_date,
                    Period = ((DateTime)r.period_date).ToString("yyyy-MM-dd"),
                    TotalAnapara = SafeConvertToDecimal(r.total_anapara),
                    TotalBasitFaiz = SafeConvertToDecimal(r.total_basit_faiz),
                    TotalFaizKazanci = SafeConvertToDecimal(r.total_faiz_kazanci),
                    AvgBasitFaiz = SafeConvertToDecimal(r.avg_basit_faiz),
                    TotalModelFaiz = SafeConvertToDecimal(r.total_model_faiz),
                    TotalModelFaizKazanci = SafeConvertToDecimal(r.total_model_faiz_kazanci),
                    AvgModelNemaOrani = SafeConvertToDecimal(r.avg_model_nema_orani),
                    TotalTlrefFaiz = SafeConvertToDecimal(r.total_tlref_faiz),
                    TotalTlrefKazanci = SafeConvertToDecimal(r.total_tlref_kazanci),
                    AvgTlrefFaiz = SafeConvertToDecimal(r.avg_tlref_faiz),
                    BasitFaizYieldPercentage = SafeConvertToDecimal(r.basit_faiz_yield_percentage),
                    ModelFaizYieldPercentage = SafeConvertToDecimal(r.model_faiz_yield_percentage),
                    TlrefFaizYieldPercentage = SafeConvertToDecimal(r.tlref_faiz_yield_percentage),
                    BasitVsModelPerformance = SafeConvertToDecimal(r.basit_vs_model_performance),
                    BasitVsTlrefPerformance = SafeConvertToDecimal(r.basit_vs_tlref_performance),
                    RecordCount = Convert.ToInt32(r.record_count ?? 0),
                    PeriodType = request.Period
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Cash flow analysis failed");
                return new List<CashFlowDataPoint>();
            }
        }

        // ===== VARIABLES METHODS =====
        public async Task<List<KaynakKurulusBilgi>> GetKaynakKuruluslarAsync()
        {
            try
            {
                using var connection = new NpgsqlConnection(_connectionString);
                await connection.OpenAsync();

                var sql = @"
                SELECT 
                    kaynak_kurulus as KaynakKurulus, 
                    COUNT(*) as KayitSayisi,
                    SUM(COALESCE(mevduat_tutari, 0)) as ToplamTutar
                FROM nakit_akis 
                WHERE kaynak_kurulus IS NOT NULL 
                  AND kaynak_kurulus != ''
                GROUP BY kaynak_kurulus
                ORDER BY kaynak_kurulus";

                var result = await connection.QueryAsync<KaynakKurulusBilgi>(sql);
                return result.ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting kaynak kurulus");
                return new List<KaynakKurulusBilgi>();
            }
        }

        public async Task<List<FonBilgi>> GetFonlarAsync(string kaynakKurulus)
        {
            try
            {
                using var connection = new NpgsqlConnection(_connectionString);
                await connection.OpenAsync();

                var sql = @"
                SELECT DISTINCT 
                    fon_no as FonNo, 
                    COUNT(*) as KayitSayisi,
                    SUM(COALESCE(mevduat_tutari, 0)) as ToplamTutar
                FROM nakit_akis 
                WHERE kaynak_kurulus = @KaynakKurulus
                  AND fon_no IS NOT NULL 
                GROUP BY fon_no
                ORDER BY fon_no
                LIMIT 50";

                var result = await connection.QueryAsync<FonBilgi>(sql, new { KaynakKurulus = kaynakKurulus });
                return result.ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting fonlar for {KaynakKurulus}", kaynakKurulus);
                return new List<FonBilgi>();
            }
        }

        public async Task<List<IhracBilgi>> GetIhraclarAsync(string kaynakKurulus, string fonNo)
        {
            try
            {
                using var connection = new NpgsqlConnection(_connectionString);
                await connection.OpenAsync();

                var sql = @"
                SELECT 
                    ihrac_no as IhracNo,
                    COUNT(*) as KayitSayisi,
                    SUM(COALESCE(mevduat_tutari, 0)) as ToplamTutar
                FROM nakit_akis 
                WHERE kaynak_kurulus = @KaynakKurulus
                  AND fon_no::text = @FonNo
                  AND ihrac_no IS NOT NULL 
                  AND mevduat_tutari > 0
                GROUP BY ihrac_no
                ORDER BY ihrac_no
                LIMIT 20";

                var result = await connection.QueryAsync<IhracBilgi>(sql, new
                {
                    KaynakKurulus = kaynakKurulus,
                    FonNo = fonNo
                });

                return result.ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting ihraclar for {KaynakKurulus} - {FonNo}", kaynakKurulus, fonNo);
                return new List<IhracBilgi>();
            }
        }

        // ===== UTILITY METHODS =====
        public async Task<bool> TestConnectionAsync()
        {
            try
            {
                using var connection = new NpgsqlConnection(_connectionString);
                await connection.OpenAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database connection test failed");
                return false;
            }
        }

        public async Task<HealthCheckResponse> GetHealthAsync()
        {
            var isConnected = await TestConnectionAsync();

            return new HealthCheckResponse
            {
                Status = isConnected ? "healthy" : "unhealthy",
                Timestamp = DateTime.UtcNow,
                Version = "1.0",
                Details = new Dictionary<string, object>
            {
                { "database", isConnected ? "connected" : "disconnected" },
                { "connectionString", _connectionString.Substring(0, Math.Min(50, _connectionString.Length)) + "..." }
            }
            };
        }

        // ===== PRIVATE HELPER METHODS =====
        private string BuildAnalysisQuery(AnalysisRequest request)
        {
            var fonFilter = BuildFonFilter(request.FonNo);
            var ihracFilter = BuildIhracFilter(request.IhracNo);
            var tarihFilter = BuildTarihFilter(request.BaslangicTarihi, request.BitisTarihi);

            return $@"
            SELECT 
                SUM(faiz_tutari) as sum,
                SUM(model_faiz_tutari) as sum1
            FROM (
                SELECT *,
                       donus_tarihi - baslangic_tarihi as vade,
                       mevduat_tutari * (1 + model_bilesik)^((donus_tarihi - baslangic_tarihi) / 365.00) - mevduat_tutari as model_faiz_tutari                  
                FROM (      
                    SELECT id, kaynak_kurulus, fon_no, ihrac_no, vdmk_isin_kodu, banka_adi,
                           baslangic_tarihi, mevduat_tutari, @ModelFaizOrani as faiz_orani, donus_tarihi,
                           mevduat_tutari * @ModelFaizOrani * (donus_tarihi - baslangic_tarihi) / 365.00 as faiz_tutari,
                           toplam_donus,
                           (1 + @ModelFaizOrani / 365.00)^365.00 - 1 as model_bilesik  
                    FROM nakit_akis na 
                    WHERE banka_adi LIKE '%ZBJ%' 
                      {tarihFilter}
                      {fonFilter}
                      {ihracFilter}
                    
                    UNION
                    
                    SELECT id, kaynak_kurulus, fon_no, ihrac_no, vdmk_isin_kodu, banka_adi,
                           baslangic_tarihi, mevduat_tutari,
                           CASE WHEN faiz_tutari = 0 THEN @ModelFaizOrani ELSE faiz_orani END as faiz_orani,
                           donus_tarihi,
                           CASE WHEN faiz_tutari = 0 THEN mevduat_tutari * @ModelFaizOrani * (donus_tarihi - baslangic_tarihi) / 365.00 
                                ELSE faiz_tutari END as faiz_tutari,
                           toplam_donus,
                           (1 + @ModelFaizOrani / 365.00)^365.00 - 1 as model_bilesik       
                    FROM nakit_akis na 
                    WHERE banka_adi NOT LIKE '%ZBJ%' 
                      AND toplam_donus > 0
                      {tarihFilter}
                      {fonFilter}
                      {ihracFilter}
                ) K            
                WHERE toplam_donus > 0
                  AND kaynak_kurulus = @KaynakKurulus
            ) K";
        }

        private string BuildTrendsQuery(TrendsRequest request)
        {
            var fonFilter = BuildFonFilter(request.FonNo);
            var ihracFilter = BuildIhracFilter(request.IhracNo);

            var dateTrunc = request.Period switch
            {
                "day" => "day",
                "week" => "week",
                "month" => "month",
                "quarter" => "quarter",
                "year" => "year",
                _ => "week"
            };

            return $@"
            WITH haftalik_veriler AS (
                SELECT 
                    DATE_TRUNC('{dateTrunc}', baslangic_tarihi) as hafta,
                    COALESCE(fon_no::text, 'bilinmiyor') as fon_no_str,
                    SUM(COALESCE(mevduat_tutari, 0)) as haftalik_mevduat,
                    SUM(COALESCE(faiz_tutari, 0)) as haftalik_faiz_kazanci,
                    COUNT(*) as haftalik_islem_sayisi,
                    AVG(COALESCE(faiz_orani, 0)) * 100 as ortalama_faiz_orani_yuzde
                FROM nakit_akis 
                WHERE kaynak_kurulus = @KaynakKurulus
                  AND baslangic_tarihi >= @FromDate
                  AND baslangic_tarihi <= @ToDate
                  AND baslangic_tarihi IS NOT NULL
                  AND COALESCE(mevduat_tutari, 0) > 0
                  {fonFilter}
                  {ihracFilter}
                GROUP BY DATE_TRUNC('{dateTrunc}', baslangic_tarihi), COALESCE(fon_no::text, 'bilinmiyor')
            ),
            kumulatif_hesaplamalar AS (
                SELECT 
                    hafta,
                    fon_no_str,
                    haftalik_mevduat,
                    haftalik_faiz_kazanci,
                    haftalik_islem_sayisi,
                    ortalama_faiz_orani_yuzde,
                    SUM(haftalik_mevduat) OVER (
                        PARTITION BY fon_no_str 
                        ORDER BY hafta 
                        ROWS UNBOUNDED PRECEDING
                    ) as kumulatif_mevduat,
                    SUM(haftalik_faiz_kazanci) OVER (
                        PARTITION BY fon_no_str 
                        ORDER BY hafta 
                        ROWS UNBOUNDED PRECEDING
                    ) as kumulatif_faiz_kazanci,
                    CASE 
                        WHEN LAG(haftalik_mevduat) OVER (PARTITION BY fon_no_str ORDER BY hafta) > 0 THEN
                            ((haftalik_mevduat - LAG(haftalik_mevduat) OVER (PARTITION BY fon_no_str ORDER BY hafta)) / 
                             LAG(haftalik_mevduat) OVER (PARTITION BY fon_no_str ORDER BY hafta)) * 100
                        ELSE 0
                    END as haftalik_buyume_yuzde,
                    CASE 
                        WHEN FIRST_VALUE(haftalik_mevduat) OVER (PARTITION BY fon_no_str ORDER BY hafta ROWS UNBOUNDED PRECEDING) > 0 THEN
                            ((haftalik_mevduat - FIRST_VALUE(haftalik_mevduat) OVER (PARTITION BY fon_no_str ORDER BY hafta ROWS UNBOUNDED PRECEDING)) / 
                             FIRST_VALUE(haftalik_mevduat) OVER (PARTITION BY fon_no_str ORDER BY hafta ROWS UNBOUNDED PRECEDING)) * 100
                        ELSE 0
                    END as kumulatif_buyume_yuzde
                FROM haftalik_veriler
            )
            SELECT 
                hafta,
                fon_no_str,
                haftalik_mevduat,
                haftalik_faiz_kazanci,
                kumulatif_mevduat,
                kumulatif_faiz_kazanci,
                haftalik_buyume_yuzde,
                kumulatif_buyume_yuzde,
                haftalik_islem_sayisi,
                ortalama_faiz_orani_yuzde
            FROM kumulatif_hesaplamalar
            WHERE hafta IS NOT NULL
            ORDER BY hafta DESC
            LIMIT @Limit";
        }

        private string BuildCashFlowQuery(CashFlowRequest request)
        {
            var dateTrunc = request.Period switch
            {
                "day" => "day",
                "week" => "week",
                "month" => "month",
                "quarter" => "quarter",
                "year" => "year",
                _ => "month"
            };

            return $@"
            SELECT 
                DATE_TRUNC('{dateTrunc}', tarih) as period_date,
                AVG(COALESCE(anapara, 0))::float8 as total_anapara,
                AVG(COALESCE(basit_faiz, 0))::float8 as total_basit_faiz,
                AVG(COALESCE(faiz_kznc, 0))::float8 as total_faiz_kazanci,
                AVG(COALESCE(model_faiz_kznc, 0))::float8 as total_model_faiz_kazanci,
                AVG(COALESCE(tlref_faiz_kazanci, 0))::float8 as total_tlref_kazanci,
                COUNT(*) as record_count,
                AVG(COALESCE(model_nema_orani, 0))::float8 as avg_model_nema_orani,
                AVG(COALESCE(tlref_faiz, 0))::float8 as avg_tlref_faiz,
                AVG(COALESCE(basit_faiz, 0))::float8 as avg_basit_faiz,
                0.0 as total_model_faiz,
                0.0 as total_tlref_faiz,
                -- Verimlilik hesaplamaları
                CASE WHEN AVG(COALESCE(anapara, 0)) > 0 THEN
                    (AVG(COALESCE(faiz_kznc, 0)) / AVG(COALESCE(anapara, 0)) * 100)
                ELSE 0.0 END as basit_faiz_yield_percentage,
                CASE WHEN AVG(COALESCE(anapara, 0)) > 0 THEN
                    (AVG(COALESCE(model_faiz_kznc, 0)) / AVG(COALESCE(anapara, 0)) * 100)
                ELSE 0.0 END as model_faiz_yield_percentage,
                CASE WHEN AVG(COALESCE(anapara, 0)) > 0 THEN
                    (AVG(COALESCE(tlref_faiz_kazanci, 0)) / AVG(COALESCE(anapara, 0)) * 100)
                ELSE 0.0 END as tlref_faiz_yield_percentage,
                -- Performans hesaplamaları
                CASE WHEN AVG(COALESCE(model_faiz_kznc, 0)) > 0 THEN
                    ((AVG(COALESCE(faiz_kznc, 0)) - AVG(COALESCE(model_faiz_kznc, 0))) / AVG(COALESCE(model_faiz_kznc, 0)) * 100)
                ELSE 0.0 END as basit_vs_model_performance,
                CASE WHEN AVG(COALESCE(tlref_faiz_kazanci, 0)) > 0 THEN
                    ((AVG(COALESCE(faiz_kznc, 0)) - AVG(COALESCE(tlref_faiz_kazanci, 0))) / AVG(COALESCE(tlref_faiz_kazanci, 0)) * 100)
                ELSE 0.0 END as basit_vs_tlref_performance
            FROM cash_flow_analysis 
            WHERE tarih IS NOT NULL 
              AND anapara > 0
            GROUP BY DATE_TRUNC('{dateTrunc}', tarih)
            ORDER BY DATE_TRUNC('{dateTrunc}', tarih) DESC
            LIMIT @Limit";
        }

        private string BuildFonFilter(string? fonNo)
        {
            if (string.IsNullOrEmpty(fonNo))
                return string.Empty;

            return " AND fon_no::text = @FonNo";
        }

        private string BuildIhracFilter(string? ihracNo)
        {
            if (string.IsNullOrEmpty(ihracNo))
                return string.Empty;

            return " AND ihrac_no::text = @IhracNo";
        }

        private string BuildTarihFilter(DateTime? baslangic, DateTime? bitis)
        {
            var conditions = new List<string>();

            if (baslangic.HasValue)
                conditions.Add("baslangic_tarihi >= @BaslangicTarihi");

            if (bitis.HasValue)
                conditions.Add("baslangic_tarihi <= @BitisTarihi");

            return conditions.Any() ? $" AND {string.Join(" AND ", conditions)}" : string.Empty;
        }

        private decimal SafeConvertToDecimal(object? value)
        {
            if (value == null || value == DBNull.Value)
                return 0m;

            try
            {
                return Convert.ToDecimal(value);
            }
            catch (OverflowException)
            {
                _logger.LogWarning("Decimal overflow detected, returning max safe value");
                return decimal.MaxValue / 1000;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Decimal conversion failed, returning 0");
                return 0m;
            }
        }
    }
}
