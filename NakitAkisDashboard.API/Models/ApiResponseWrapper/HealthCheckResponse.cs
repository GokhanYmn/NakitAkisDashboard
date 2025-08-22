namespace NakitAkisDashboard.API.Models.ApiResponseWrapper
{
    public class HealthCheckResponse
    {
        public string Status { get; set; } = "healthy";
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string Version { get; set; } = "1.0";
        public Dictionary<string, object> Details { get; set; } = new();
    }
}
