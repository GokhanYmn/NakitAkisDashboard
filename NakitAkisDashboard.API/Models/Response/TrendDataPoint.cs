namespace NakitAkisDashboard.API.Models.Response
{
    public class TrendDataPoint
    {
        public long Timestamp { get; set; }
        public DateTime Tarih { get; set; }
        public string Period { get; set; } = string.Empty;
        public string FonNo { get; set; } = string.Empty;

        // Mevduat Verileri
        public decimal HaftalikMevduat { get; set; }
        public decimal KumulatifMevduat { get; set; }

        // Faiz Kazancı Verileri
        public decimal HaftalikFaizKazanci { get; set; }
        public decimal KumulatifFaizKazanci { get; set; }

        // Büyüme Verileri
        public decimal HaftalikBuyumeYuzde { get; set; }
        public decimal KumulatifBuyumeYuzde { get; set; }

        // İstatistikler
        public int HaftalikIslemSayisi { get; set; }
        public decimal OrtalamaPaizOrani { get; set; }
        public string KaynakKurulus { get; set; } = string.Empty;
    }
}
