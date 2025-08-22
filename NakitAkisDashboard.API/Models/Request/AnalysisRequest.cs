using System.ComponentModel.DataAnnotations;

namespace NakitAkisDashboard.API.Models.Request
{
    public class AnalysisRequest
    {
        [Required]
        [Range(0.01, 100.0, ErrorMessage = "Faiz oranı 0.01 ile 100.0 arasında olmalıdır")]
        public decimal FaizOrani { get; set; }

        [Required]
        public string KaynakKurulus { get; set; } = string.Empty;

        public string? FonNo { get; set; }
        public string? IhracNo { get; set; }
        public DateTime? BaslangicTarihi { get; set; }
        public DateTime? BitisTarihi { get; set; }
    }
}
