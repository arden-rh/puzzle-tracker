namespace PuzzleTracker.Server.Data.DTOs
{
    public class UserCustomPuzzleDto
    {
        public string NameEnglish { get; set; }
        public string? NameLocal { get; set; }
        public string? LocalLanguage { get; set; }
        public string? ProductNumber { get; set; }
        public string NumberOfPieces { get; set; }
        public string? BoxImgSrc { get; set; }
        public string BrandName { get; set; }
        public string? SeriesName { get; set; }
        public string? IllustratorName { get; set; }
        public bool IsPublic { get; set; } = false;
    }
}
