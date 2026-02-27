namespace PuzzleTracker.Server.Data.DTOs
{
    public class UserPuzzleDto
    {
        // Collection stats
        public int UserPuzzleId { get; set; }
        public bool IsOwned { get; set; }
        public bool IsCompleted { get; set; }
        public int TimesCompleted { get; set; }
        public DateTime? LastCompletedDate { get; set; }

        // Flattened Puzzle Info
        public int PuzzleId { get; set; }
        public string NameEnglish { get; set; }
        public string? NameLocal { get; set; }
        public string? LocalLanguage { get; set; }
        public string? ProductNumber { get; set; }
        public string NumberOfPieces { get; set; }
        public int SortablePieceCount { get; set; }
        public string? BoxImgSrc { get; set; }
        public string BrandName { get; set; }
        public string? SeriesName { get; set; }
        public string? IllustratorName { get; set; }

        // The Discriminator for your TS Union
        public string PuzzleType { get; set; }

        // Sub-class specific fields
        // OfficialPuzzle and JVHPuzzle fields
        public string? Publisher { get; set; } 
        public string? ReleaseDate { get; set; }
        public string? Manufacturer { get; set; }
        public bool? IsComboPack { get; set; }
        // UserCustomPuzzle fields
        public string? CreatedByUserId { get; set; }
        public DateTime? DateAdded { get; set; }
        public bool? IsPublic { get; set; } = false;
    }
}
