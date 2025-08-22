namespace NakitAkisDashboard.API.Models.Response
{
    public class AnalysisResponse
    {
        public decimal ToplamFaizTutari { get; set; }
        public decimal ToplamModelFaizTutari { get; set; }
        public decimal FarkTutari => ToplamFaizTutari - ToplamModelFaizTutari;
        public decimal FarkYuzdesi => ToplamModelFaizTutari != 0 ? (FarkTutari / ToplamModelFaizTutari) * 100 : 0;
        public decimal FaizOrani { get; set; }
        public string KaynakKurulus { get; set; } = string.Empty;
        public string? FonNo { get; set; }
        public string? IhracNo { get; set; }
        public DateTime CalculatedAt { get; set; } = DateTime.UtcNow;
    }
}
