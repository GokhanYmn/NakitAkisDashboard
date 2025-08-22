using NakitAkisDashboard.API.Models;
using NakitAkisDashboard.API.Models.Request;
using NakitAkisDashboard.API.Models.Response;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System.Drawing;
using System.Text;

namespace NakitAkisDashboard.API.Services;

public class ExportService : IExportService
{
    private readonly ILogger<ExportService> _logger;

    public ExportService(ILogger<ExportService> logger)
    {
        _logger = logger;
        // EPPlus lisans ayarı
        ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
    }

    // ===== ANALYSIS EXPORTS =====
    public async Task<byte[]> ExportAnalysisToPdfAsync(AnalysisResponse analysis, AnalysisRequest request, string level = "basic")
    {
        try
        {
            var html = await GenerateAnalysisHtmlAsync(analysis, request, level);

            // HTML'i PDF'e çevirmek için iTextSharp veya başka bir kütüphane kullanılabilir
            // Şimdilik HTML bytes döndürüyoruz
            return Encoding.UTF8.GetBytes(html);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "PDF export failed");
            throw;
        }
    }

    public async Task<byte[]> ExportAnalysisToExcelAsync(AnalysisResponse analysis, AnalysisRequest request, string level = "basic")
    {
        try
        {
            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Nakit Akış Analizi");

            // Header styling
            worksheet.Cells["A1"].Value = "NAKİT AKIŞ ANALİZİ RAPORU";
            worksheet.Cells["A1"].Style.Font.Size = 16;
            worksheet.Cells["A1"].Style.Font.Bold = true;
            worksheet.Cells["A1:D1"].Merge = true;
            worksheet.Cells["A1"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            worksheet.Cells["A1"].Style.Fill.PatternType = ExcelFillStyle.Solid;
            worksheet.Cells["A1"].Style.Fill.BackgroundColor.SetColor(Color.LightBlue);

            // Report info
            worksheet.Cells["A2"].Value = $"Rapor Tarihi: {DateTime.Now:dd/MM/yyyy HH:mm}";
            worksheet.Cells["A3"].Value = $"Export Level: {GetLevelName(level)}";
            worksheet.Cells["A2:D3"].Style.Fill.PatternType = ExcelFillStyle.Solid;
            worksheet.Cells["A2:D3"].Style.Fill.BackgroundColor.SetColor(Color.LightGray);

            // Parameters section
            int row = 5;
            worksheet.Cells[$"A{row}"].Value = "PARAMETRELER";
            worksheet.Cells[$"A{row}"].Style.Font.Bold = true;
            worksheet.Cells[$"A{row}"].Style.Fill.PatternType = ExcelFillStyle.Solid;
            worksheet.Cells[$"A{row}"].Style.Fill.BackgroundColor.SetColor(Color.Yellow);

            row++;
            worksheet.Cells[$"A{row}"].Value = "Faiz Oranı:";
            worksheet.Cells[$"B{row}"].Value = $"{analysis.FaizOrani:F2}%";

            row++;
            worksheet.Cells[$"A{row}"].Value = "Kaynak Kuruluş:";
            worksheet.Cells[$"B{row}"].Value = analysis.KaynakKurulus;

            if (!string.IsNullOrEmpty(analysis.FonNo))
            {
                row++;
                worksheet.Cells[$"A{row}"].Value = "Fon No:";
                worksheet.Cells[$"B{row}"].Value = analysis.FonNo;
            }

            if (!string.IsNullOrEmpty(analysis.IhracNo))
            {
                row++;
                worksheet.Cells[$"A{row}"].Value = "İhraç No:";
                worksheet.Cells[$"B{row}"].Value = analysis.IhracNo;
            }

            // Results section
            row += 2;
            worksheet.Cells[$"A{row}"].Value = "ANALİZ SONUÇLARI";
            worksheet.Cells[$"A{row}"].Style.Font.Bold = true;
            worksheet.Cells[$"A{row}"].Style.Fill.PatternType = ExcelFillStyle.Solid;
            worksheet.Cells[$"A{row}"].Style.Fill.BackgroundColor.SetColor(Color.LightGreen);

            row++;
            worksheet.Cells[$"A{row}"].Value = "Metrik";
            worksheet.Cells[$"B{row}"].Value = "Tutar (₺)";
            worksheet.Cells[$"C{row}"].Value = "Yüzde (%)";
            worksheet.Cells[$"A{row}:C{row}"].Style.Font.Bold = true;
            worksheet.Cells[$"A{row}:C{row}"].Style.Fill.PatternType = ExcelFillStyle.Solid;
            worksheet.Cells[$"A{row}:C{row}"].Style.Fill.BackgroundColor.SetColor(Color.Gray);
            worksheet.Cells[$"A{row}:C{row}"].Style.Font.Color.SetColor(Color.White);

            row++;
            worksheet.Cells[$"A{row}"].Value = "Toplam Faiz Tutarı";
            worksheet.Cells[$"B{row}"].Value = analysis.ToplamFaizTutari;
            worksheet.Cells[$"B{row}"].Style.Numberformat.Format = "#,##0.00";

            row++;
            worksheet.Cells[$"A{row}"].Value = "Model Faiz Tutarı";
            worksheet.Cells[$"B{row}"].Value = analysis.ToplamModelFaizTutari;
            worksheet.Cells[$"B{row}"].Style.Numberformat.Format = "#,##0.00";

            row++;
            worksheet.Cells[$"A{row}"].Value = "Fark Tutarı";
            worksheet.Cells[$"B{row}"].Value = analysis.FarkTutari;
            worksheet.Cells[$"B{row}"].Style.Numberformat.Format = "#,##0.00";

            // Fark rengini ayarla
            if (analysis.FarkTutari >= 0)
            {
                worksheet.Cells[$"B{row}"].Style.Font.Color.SetColor(Color.Green);
            }
            else
            {
                worksheet.Cells[$"B{row}"].Style.Font.Color.SetColor(Color.Red);
            }

            row++;
            worksheet.Cells[$"A{row}"].Value = "Fark Yüzdesi";
            worksheet.Cells[$"C{row}"].Value = analysis.FarkYuzdesi / 100;
            worksheet.Cells[$"C{row}"].Style.Numberformat.Format = "0.00%";

            // Yüzde rengini ayarla
            if (analysis.FarkYuzdesi >= 0)
            {
                worksheet.Cells[$"C{row}"].Style.Font.Color.SetColor(Color.Green);
            }
            else
            {
                worksheet.Cells[$"C{row}"].Style.Font.Color.SetColor(Color.Red);
            }

            // Level'a göre ek bilgiler
            if (level == "detailed" || level == "full")
            {
                row += 2;
                worksheet.Cells[$"A{row}"].Value = "DETAYLI ANALİZ";
                worksheet.Cells[$"A{row}"].Style.Font.Bold = true;
                worksheet.Cells[$"A{row}"].Style.Fill.PatternType = ExcelFillStyle.Solid;
                worksheet.Cells[$"A{row}"].Style.Fill.BackgroundColor.SetColor(Color.Orange);

                row++;
                worksheet.Cells[$"A{row}"].Value = "Faiz Verimliliği";
                worksheet.Cells[$"B{row}"].Value = analysis.ToplamModelFaizTutari != 0 ?
                    (analysis.ToplamFaizTutari / analysis.ToplamModelFaizTutari) : 0;
                worksheet.Cells[$"B{row}"].Style.Numberformat.Format = "0.00%";

                row++;
                worksheet.Cells[$"A{row}"].Value = "Performans Skoru";
                worksheet.Cells[$"B{row}"].Value = GetPerformanceScore(analysis.FarkYuzdesi);

                row++;
                worksheet.Cells[$"A{row}"].Value = "Risk Seviyesi";
                worksheet.Cells[$"B{row}"].Value = GetRiskLevel(analysis.FarkYuzdesi);
            }

            if (level == "full")
            {
                row += 2;
                worksheet.Cells[$"A{row}"].Value = "ÖNERİLER";
                worksheet.Cells[$"A{row}"].Style.Font.Bold = true;
                worksheet.Cells[$"A{row}"].Style.Fill.PatternType = ExcelFillStyle.Solid;
                worksheet.Cells[$"A{row}"].Style.Fill.BackgroundColor.SetColor(Color.LightCoral);

                var recommendations = GetRecommendations(analysis.FarkYuzdesi);
                foreach (var recommendation in recommendations)
                {
                    row++;
                    worksheet.Cells[$"A{row}"].Value = $"• {recommendation}";
                }
            }

            // Auto-fit columns
            worksheet.Cells.AutoFitColumns();

            return await Task.FromResult(package.GetAsByteArray());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Excel export failed");
            throw;
        }
    }

    // ===== TRENDS EXPORTS =====
    public async Task<byte[]> ExportTrendsToExcelAsync(List<TrendDataPoint> trends, TrendsRequest request)
    {
        try
        {
            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Trend Analizi");

            // Header
            worksheet.Cells["A1"].Value = $"TREND ANALİZİ - {request.KaynakKurulus}";
            worksheet.Cells["A1"].Style.Font.Size = 16;
            worksheet.Cells["A1"].Style.Font.Bold = true;
            worksheet.Cells["A1:H1"].Merge = true;
            worksheet.Cells["A1"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

            worksheet.Cells["A2"].Value = $"Periyot: {request.Period} | Tarih: {DateTime.Now:dd/MM/yyyy}";
            worksheet.Cells["A2:H2"].Merge = true;

            // Column headers
            int row = 4;
            var headers = new[] { "Tarih", "Fon No", "Haftalık Mevduat", "Kümülatif Mevduat",
                                 "Haftalık Faiz", "Kümülatif Faiz", "Büyüme %", "İşlem Sayısı" };

            for (int i = 0; i < headers.Length; i++)
            {
                worksheet.Cells[row, i + 1].Value = headers[i];
                worksheet.Cells[row, i + 1].Style.Font.Bold = true;
                worksheet.Cells[row, i + 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
                worksheet.Cells[row, i + 1].Style.Fill.BackgroundColor.SetColor(Color.LightBlue);
            }

            // Data rows
            foreach (var trend in trends)
            {
                row++;
                worksheet.Cells[row, 1].Value = trend.Tarih.ToString("dd/MM/yyyy");
                worksheet.Cells[row, 2].Value = trend.FonNo;
                worksheet.Cells[row, 3].Value = trend.HaftalikMevduat;
                worksheet.Cells[row, 3].Style.Numberformat.Format = "#,##0.00";
                worksheet.Cells[row, 4].Value = trend.KumulatifMevduat;
                worksheet.Cells[row, 4].Style.Numberformat.Format = "#,##0.00";
                worksheet.Cells[row, 5].Value = trend.HaftalikFaizKazanci;
                worksheet.Cells[row, 5].Style.Numberformat.Format = "#,##0.00";
                worksheet.Cells[row, 6].Value = trend.KumulatifFaizKazanci;
                worksheet.Cells[row, 6].Style.Numberformat.Format = "#,##0.00";
                worksheet.Cells[row, 7].Value = trend.HaftalikBuyumeYuzde / 100;
                worksheet.Cells[row, 7].Style.Numberformat.Format = "0.00%";
                worksheet.Cells[row, 8].Value = trend.HaftalikIslemSayisi;
            }

            worksheet.Cells.AutoFitColumns();
            return await Task.FromResult(package.GetAsByteArray());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Trends excel export failed");
            throw;
        }
    }

    public async Task<byte[]> ExportTrendsToCsvAsync(List<TrendDataPoint> trends, TrendsRequest request)
    {
        try
        {
            var csv = new StringBuilder();

            // Header
            csv.AppendLine($"Trend Analizi - {request.KaynakKurulus}");
            csv.AppendLine($"Periyot: {request.Period}");
            csv.AppendLine($"Tarih: {DateTime.Now:dd/MM/yyyy HH:mm}");
            csv.AppendLine();

            // Column headers
            csv.AppendLine("Tarih,Fon No,Haftalık Mevduat,Kümülatif Mevduat,Haftalık Faiz,Kümülatif Faiz,Büyüme %,İşlem Sayısı");

            // Data rows
            foreach (var trend in trends)
            {
                csv.AppendLine($"{trend.Tarih:dd/MM/yyyy},{trend.FonNo},{trend.HaftalikMevduat:F2}," +
                              $"{trend.KumulatifMevduat:F2},{trend.HaftalikFaizKazanci:F2}," +
                              $"{trend.KumulatifFaizKazanci:F2},{trend.HaftalikBuyumeYuzde:F2},{trend.HaftalikIslemSayisi}");
            }

            return await Task.FromResult(Encoding.UTF8.GetBytes(csv.ToString()));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Trends CSV export failed");
            throw;
        }
    }

    // ===== CASH FLOW EXPORTS =====
    public async Task<byte[]> ExportCashFlowToExcelAsync(List<CashFlowDataPoint> cashFlow, CashFlowRequest request)
    {
        try
        {
            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Cash Flow Analizi");

            // Header
            worksheet.Cells["A1"].Value = "CASH FLOW ANALİZİ";
            worksheet.Cells["A1"].Style.Font.Size = 16;
            worksheet.Cells["A1"].Style.Font.Bold = true;
            worksheet.Cells["A1:J1"].Merge = true;
            worksheet.Cells["A1"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

            worksheet.Cells["A2"].Value = $"Periyot: {request.Period} | Tarih: {DateTime.Now:dd/MM/yyyy}";
            worksheet.Cells["A2:J2"].Merge = true;

            // Column headers
            int row = 4;
            var headers = new[] { "Tarih", "Anapara", "Basit Faiz", "Model Faiz", "TLREF Faiz",
                                 "Basit Verimlilik %", "Model Verimlilik %", "TLREF Verimlilik %",
                                 "Basit vs Model %", "Kayıt Sayısı" };

            for (int i = 0; i < headers.Length; i++)
            {
                worksheet.Cells[row, i + 1].Value = headers[i];
                worksheet.Cells[row, i + 1].Style.Font.Bold = true;
                worksheet.Cells[row, i + 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
                worksheet.Cells[row, i + 1].Style.Fill.BackgroundColor.SetColor(Color.LightGreen);
            }

            // Data rows
            foreach (var item in cashFlow)
            {
                row++;
                worksheet.Cells[row, 1].Value = item.Tarih.ToString("dd/MM/yyyy");
                worksheet.Cells[row, 2].Value = item.TotalAnapara;
                worksheet.Cells[row, 2].Style.Numberformat.Format = "#,##0.00";
                worksheet.Cells[row, 3].Value = item.TotalFaizKazanci;
                worksheet.Cells[row, 3].Style.Numberformat.Format = "#,##0.00";
                worksheet.Cells[row, 4].Value = item.TotalModelFaizKazanci;
                worksheet.Cells[row, 4].Style.Numberformat.Format = "#,##0.00";
                worksheet.Cells[row, 5].Value = item.TotalTlrefKazanci;
                worksheet.Cells[row, 5].Style.Numberformat.Format = "#,##0.00";
                worksheet.Cells[row, 6].Value = item.BasitFaizYieldPercentage / 100;
                worksheet.Cells[row, 6].Style.Numberformat.Format = "0.00%";
                worksheet.Cells[row, 7].Value = item.ModelFaizYieldPercentage / 100;
                worksheet.Cells[row, 7].Style.Numberformat.Format = "0.00%";
                worksheet.Cells[row, 8].Value = item.TlrefFaizYieldPercentage / 100;
                worksheet.Cells[row, 8].Style.Numberformat.Format = "0.00%";
                worksheet.Cells[row, 9].Value = item.BasitVsModelPerformance / 100;
                worksheet.Cells[row, 9].Style.Numberformat.Format = "0.00%";
                worksheet.Cells[row, 10].Value = item.RecordCount;
            }

            worksheet.Cells.AutoFitColumns();
            return await Task.FromResult(package.GetAsByteArray());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Cash flow excel export failed");
            throw;
        }
    }

    public async Task<byte[]> ExportCashFlowToCsvAsync(List<CashFlowDataPoint> cashFlow, CashFlowRequest request)
    {
        try
        {
            var csv = new StringBuilder();

            // Header
            csv.AppendLine("Cash Flow Analizi");
            csv.AppendLine($"Periyot: {request.Period}");
            csv.AppendLine($"Tarih: {DateTime.Now:dd/MM/yyyy HH:mm}");
            csv.AppendLine();

            // Column headers
            csv.AppendLine("Tarih,Anapara,Basit Faiz,Model Faiz,TLREF Faiz,Basit Verimlilik %,Model Verimlilik %,TLREF Verimlilik %,Basit vs Model %,Kayıt Sayısı");

            // Data rows
            foreach (var item in cashFlow)
            {
                csv.AppendLine($"{item.Tarih:dd/MM/yyyy},{item.TotalAnapara:F2},{item.TotalFaizKazanci:F2}," +
                              $"{item.TotalModelFaizKazanci:F2},{item.TotalTlrefKazanci:F2}," +
                              $"{item.BasitFaizYieldPercentage:F2},{item.ModelFaizYieldPercentage:F2}," +
                              $"{item.TlrefFaizYieldPercentage:F2},{item.BasitVsModelPerformance:F2},{item.RecordCount}");
            }

            return await Task.FromResult(Encoding.UTF8.GetBytes(csv.ToString()));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Cash flow CSV export failed");
            throw;
        }
    }

    // ===== HTML GENERATION =====
    public async Task<string> GenerateAnalysisHtmlAsync(AnalysisResponse analysis, AnalysisRequest request, string level = "basic")
    {
        var levelName = GetLevelName(level);
        var html = $@"
<!DOCTYPE html>
<html lang='tr'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Nakit Akış Analizi - {levelName}</title>
    <style>
        body {{ font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; line-height: 1.6; }}
        .header {{ text-align: center; border-bottom: 3px solid #007bff; padding-bottom: 20px; margin-bottom: 30px; }}
        .level-badge {{ background: #007bff; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; }}
        .section {{ margin: 30px 0; padding: 20px; border-left: 4px solid #007bff; background: #f8f9fa; }}
        .metric-positive {{ color: #28a745; font-weight: bold; }}
        .metric-negative {{ color: #dc3545; font-weight: bold; }}
        .metric-neutral {{ color: #6c757d; font-weight: bold; }}
        table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
        th, td {{ border: 1px solid #dee2e6; padding: 12px; text-align: left; }}
        th {{ background-color: #007bff; color: white; font-weight: bold; }}
        .summary-card {{ background: #ffffff; padding: 20px; margin: 15px 0; border-radius: 8px; border: 1px solid #dee2e6; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
    </style>
</head>
<body>
    <div class='header'>
        <h1>💰 Nakit Akış Dashboard Analizi</h1>
        <span class='level-badge'>{levelName}</span>
        <p>Rapor Tarihi: {DateTime.Now:dd.MM.yyyy HH:mm}</p>
    </div>

    <div class='section'>
        <h2>📊 Analiz Parametreleri</h2>
        <table>
            <tr><th>Parametre</th><th>Değer</th></tr>
            <tr><td>Kaynak Kuruluş</td><td><strong>{analysis.KaynakKurulus}</strong></td></tr>
            <tr><td>Faiz Oranı</td><td><strong>%{analysis.FaizOrani:F2}</strong></td></tr>";

        if (!string.IsNullOrEmpty(analysis.FonNo))
        {
            html += $"<tr><td>Fon Numarası</td><td><strong>{analysis.FonNo}</strong></td></tr>";
        }

        if (!string.IsNullOrEmpty(analysis.IhracNo))
        {
            html += $"<tr><td>İhraç Numarası</td><td><strong>{analysis.IhracNo}</strong></td></tr>";
        }

        html += $@"
            <tr><td>Hesaplama Zamanı</td><td>{analysis.CalculatedAt:dd.MM.yyyy HH:mm}</td></tr>
        </table>
    </div>

    <div class='section'>
        <h2>💰 Analiz Sonuçları</h2>
        <div class='summary-card'>
            <h3>Gerçek Faiz Tutarı</h3>
            <p style='font-size: 24px; margin: 0;' class='metric-positive'>₺{analysis.ToplamFaizTutari:N2}</p>
        </div>
        
        <div class='summary-card'>
            <h3>Model Faiz Tutarı</h3>
            <p style='font-size: 24px; margin: 0;' class='metric-neutral'>₺{analysis.ToplamModelFaizTutari:N2}</p>
        </div>
        
        <div class='summary-card'>
            <h3>Fark</h3>
            <p style='font-size: 24px; margin: 0;' class='{(analysis.FarkTutari >= 0 ? "metric-positive" : "metric-negative")}'>
                ₺{analysis.FarkTutari:N2} ({analysis.FarkYuzdesi:F2}%)
            </p>
        </div>
    </div>";

        if (level == "detailed" || level == "full")
        {
            html += $@"
    <div class='section'>
        <h2>📈 Detaylı İstatistikler</h2>
        <table>
            <tr><th>İstatistik</th><th>Değer</th></tr>
            <tr><td>Faiz Verimliliği</td><td>{(analysis.ToplamModelFaizTutari != 0 ? (analysis.ToplamFaizTutari / analysis.ToplamModelFaizTutari * 100) : 0):F2}%</td></tr>
            <tr><td>Performans Skoru</td><td><strong>{GetPerformanceScore(analysis.FarkYuzdesi)}</strong></td></tr>
            <tr><td>Risk Seviyesi</td><td><strong>{GetRiskLevel(analysis.FarkYuzdesi)}</strong></td></tr>
        </table>
    </div>";
        }

        if (level == "full")
        {
            var recommendations = GetRecommendations(analysis.FarkYuzdesi);
            html += $@"
    <div class='section'>
        <h2>🎯 Öneriler</h2>
        <ul>";

            foreach (var recommendation in recommendations)
            {
                html += $"<li>{recommendation}</li>";
            }

            html += @"
        </ul>
    </div>";
        }

        html += @"
    <div style='text-align: center; margin-top: 50px; padding: 20px; background: #e9ecef; border-radius: 8px;'>
        <p><strong>🚀 NakitAkış Dashboard Suite</strong></p>
        <p>Clean React + .NET API | Grafana-Free Analytics</p>
    </div>
</body>
</html>";

        return await Task.FromResult(html);
    }

    // ===== HELPER METHODS =====
    private string GetLevelName(string level)
    {
        return level switch
        {
            "basic" => "📋 Basit Özet",
            "detailed" => "📊 Detaylı Analiz",
            "full" => "📈 Tam Rapor",
            _ => "Bilinmeyen"
        };
    }

    private string GetPerformanceScore(decimal farkYuzdesi)
    {
        return farkYuzdesi switch
        {
            > 10 => "🌟 Mükemmel",
            > 5 => "✅ İyi",
            > 0 => "📊 Orta",
            > -5 => "⚠️ Zayıf",
            _ => "🔴 Çok Zayıf"
        };
    }

    private string GetRiskLevel(decimal farkYuzdesi)
    {
        return Math.Abs(farkYuzdesi) switch
        {
            < 5 => "🟢 Düşük Risk",
            < 15 => "🟡 Orta Risk",
            _ => "🔴 Yüksek Risk"
        };
    }

    private List<string> GetRecommendations(decimal farkYuzdesi)
    {
        var recommendations = new List<string>();

        if (farkYuzdesi < -10)
        {
            recommendations.Add("🚨 ACIL: Faiz stratejisi gözden geçirilmeli");
            recommendations.Add("📊 Model faiz oranı güncellenmeli");
        }
        else if (farkYuzdesi < -5)
        {
            recommendations.Add("⚠️ Faiz politikası optimize edilmeli");
            recommendations.Add("📈 Performans iyileştirme planı yapılmalı");
        }
        else if (farkYuzdesi < 0)
        {
            recommendations.Add("📊 Küçük performans iyileştirmeleri yapılabilir");
        }
        else if (farkYuzdesi < 5)
        {
            recommendations.Add("✅ Mevcut stratejiye devam edilebilir");
            recommendations.Add("🔍 Performans izlemeye devam edilmeli");
        }
        else
        {
            recommendations.Add("🌟 Mükemmel performans, mevcut stratejiye devam");
            recommendations.Add("📈 Bu başarı diğer kuruluşlara örnek alınabilir");
        }

        recommendations.Add("📊 Düzenli analiz raporu alınması önerilir");
        recommendations.Add("🎯 Dashboard üzerinden real-time takip yapılmalı");

        return recommendations;
    }
}