namespace NakitAkisDashboard.API.Models.Response
{
    public class VariableOption
    {
        public string Text { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public int? RecordCount { get; set; }
        public decimal? TotalAmount { get; set; }
    }
}
