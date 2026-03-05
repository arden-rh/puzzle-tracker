namespace PuzzleTracker.Server.Data.DTOs
{
    public class UserCustomPuzzleDto
    {
        public string NameEnglish { get; set; }
        public string? NameLocal { get; set; }
        public string? LocalLanguage { get; set; }
        public string? ProductNumber { get; set; }
        public string NumberOfPieces { get; set; }
        public int SortablePieceCount { get; set; }
        public string? BoxImgSrc { get; set; }
        public int BrandId { get; set; }
        public int? PuzzleSeriesId { get; set; }
        public int? IllustratorId { get; set; }
        public bool IsPublic { get; set; } = false;
    }
}
