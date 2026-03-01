namespace PuzzleTracker.Server.Data.DTOs
{
    public class PuzzleDto
    {
            public int Id { get; set; }
            public string PuzzleType { get; set; }
            public string NameEnglish { get; set; }
            public string? NameLocal { get; set; }
            public string? LocalLanguage { get; set; }
            public string? ProductNumber { get; set; }
            public string NumberOfPieces { get; set; }
            public int SortablePieceCount { get; set; }
            public string? BoxImgSrc { get; set; }
    
            // Connections to other tables and navigation properties
            public string BrandName { get; set; }
            public string? SeriesName { get; set; }
            public string? IllustratorName { get; set; }

            // Sub-class specific fields
            public string? Publisher { get; set; }
            public string? ReleaseDate { get; set; }
            public string? Manufacturer { get; set; }
            public bool? IsComboPack { get; set; }

            // Ownership Check
            public bool IsInUserCollection { get; set; }
            public bool IsCompletedByUser { get; set; }
    }
}
