namespace NakitAkisDashboard.API.Models.Response
{
    public class CashFlowDataPoint
    {
        public long Timestamp { get; set; }
        public DateTime Tarih { get; set; }
        public string Period { get; set; } = string.Empty;

        // Anapara
        public decimal TotalAnapara { get; set; }

        // Faiz Türleri
        public decimal TotalBasitFaiz { get; set; }
        public decimal TotalFaizKazanci { get; set; }
        public decimal AvgBasitFaiz { get; set; }

        // Model Faiz
        public decimal TotalModelFaiz { get; set; }
        public decimal TotalModelFaizKazanci { get; set; }
        public decimal AvgModelNemaOrani { get; set; }

        // TLREF Faiz
        public decimal TotalTlrefFaiz { get; set; }
        public decimal TotalTlrefKazanci { get; set; }
        public decimal AvgTlrefFaiz { get; set; }

        // Verimlilik Yüzdeleri
        public decimal BasitFaizYieldPercentage { get; set; }
        public decimal ModelFaizYieldPercentage { get; set; }
        public decimal TlrefFaizYieldPercentage { get; set; }

        // Performans Karşılaştırmaları
        public decimal BasitVsModelPerformance { get; set; }
        public decimal BasitVsTlrefPerformance { get; set; }

        // Meta Data
        public int RecordCount { get; set; }
        public string PeriodType { get; set; } = string.Empty;
    }
}
