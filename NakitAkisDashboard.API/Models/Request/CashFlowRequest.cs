using System.ComponentModel.DataAnnotations;

namespace NakitAkisDashboard.API.Models.Request
{
    public class CashFlowRequest
    {
        [Required]
        public string Period { get; set; } = "month"; // day, week, month, quarter, year

        [Range(1, 1000)]
        public int Limit { get; set; } = 100;
    }
}
