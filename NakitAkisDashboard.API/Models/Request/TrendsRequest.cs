using System.ComponentModel.DataAnnotations;

namespace NakitAkisDashboard.API.Models.Request
{
    public class TrendsRequest
    {
        [Required]
        public string KaynakKurulus { get; set; } = string.Empty;

        public string? FonNo { get; set; }
        public string? IhracNo { get; set; }

        [Required]
        public string Period { get; set; } = "week"; // day, week, month

        [Range(1, 1000)]
        public int Limit { get; set; } = 100;
    }

}
