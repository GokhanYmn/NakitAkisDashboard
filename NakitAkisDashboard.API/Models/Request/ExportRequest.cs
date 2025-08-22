using System.ComponentModel.DataAnnotations;

namespace NakitAkisDashboard.API.Models.Request
{
    public class ExportRequest
    {
        [Required]
        public string Level { get; set; } = "basic"; // basic, detailed, full

        [Required]
        public string Format { get; set; } = "pdf"; // pdf, excel

        [Required]
        public AnalysisRequest AnalysisData { get; set; } = new();
    }

}
