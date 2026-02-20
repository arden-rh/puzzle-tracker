namespace PuzzleTracker.Server.Models
{
    public abstract class PuzzleBase
    {
        public int Id { get; set; }
        public string NameEnglish { get; set; }
        public string? NameLocal { get; set; }
        public string? LocalLanguage { get; set; }
        public string? ProductNumber { get; set; }
        public string NumberOfPieces { get; set; }
        public int SortablePieceCount { get; set; } = 0;
        public string? BoxImgSrc { get; set; }

        // Connections to other tables and navigation properties
        public int BrandId { get; set; }
        public Brand Brand { get; set; }
        public int? PuzzleSeriesId { get; set; }
        public PuzzleSeries? Series { get; set; }

        public int? IllustratorId { get; set; }
        public Illustrator? Illustrator { get; set; }

    }

    public class OfficialPuzzle : PuzzleBase
    {
        public string Publisher { get; set; }
        public string ReleaseDate { get; set; }
        public string Manufacturer { get; set; }
    }

    public class  JVHPuzzle : OfficialPuzzle
    {
        public bool IsComboPack { get; set; } = false;
    }

    public class UserCustomPuzzle : PuzzleBase
    {
        public string CreatedByUserId { get; set; }
        public DateTime DateAdded { get; set; }
        public bool IsPublic { get; set; } = false;
    }    
}
