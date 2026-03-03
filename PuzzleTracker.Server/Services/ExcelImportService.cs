using OfficeOpenXml;
using PuzzleTracker.Server.Data;
using PuzzleTracker.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace PuzzleTracker.Server.Services
{
    public class ExcelImportService
    {
        private readonly PuzzleTrackerContext _context;

        public ExcelImportService(PuzzleTrackerContext context)
        {
            _context = context;
        }

        public async Task<ImportResult> ImportFromExcel(string filePath)
        {
            var result = new ImportResult();

            try
            {
                using var package = new ExcelPackage(new FileInfo(filePath));

                // Import in order of dependencies
                result.BrandsImported = await ImportBrands(package.Workbook.Worksheets["Brands"]);
                result.IllustratorsImported = await ImportIllustrators(package.Workbook.Worksheets["Illustrators"]);
                result.SeriesImported = await ImportSeries(package.Workbook.Worksheets["Series"]);

                var puzzleResult = await ImportPuzzles(package.Workbook.Worksheets["Puzzles"]);
                result.PuzzlesImported = puzzleResult.ImportedCount;
                result.SkippedRows = puzzleResult.SkippedRows;

                result.Success = true;
                result.Message = "Import completed successfully!";
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Message = $"Import failed: {ex.Message}";
                result.ErrorDetails = ex.ToString();
            }

            return result;
        }

        private async Task<int> ImportBrands(ExcelWorksheet worksheet)
        {
            if (worksheet == null) return 0;

            var brands = new List<Brand>();
            int rowCount = worksheet.Dimension?.Rows ?? 0;

            for (int row = 2; row <= rowCount; row++)
            {
                var id = GetIntValue(worksheet, row, 1);
                var name = GetStringValue(worksheet, row, 2);

                if (string.IsNullOrWhiteSpace(name)) continue;

                brands.Add(new Brand
                {
                    Id = id,
                    Name = name,
                    WebsiteUrl = GetStringValue(worksheet, row, 3),
                    LogoImgSrc = GetStringValue(worksheet, row, 4)
                });
            }

            if (brands.Any())
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    await _context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT Brands ON");
                    await _context.Brands.AddRangeAsync(brands);
                    await _context.SaveChangesAsync();
                    await _context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT Brands OFF");
                    await transaction.CommitAsync();
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }

            return brands.Count;
        }

        private async Task<int> ImportIllustrators(ExcelWorksheet worksheet)
        {
            if (worksheet == null) return 0;

            var illustrators = new List<Illustrator>();
            int rowCount = worksheet.Dimension?.Rows ?? 0;

            for (int row = 2; row <= rowCount; row++)
            {
                var id = GetIntValue(worksheet, row, 1);
                var name = GetStringValue(worksheet, row, 2);

                if (string.IsNullOrWhiteSpace(name)) continue;

                illustrators.Add(new Illustrator
                {
                    Id = id,
                    Name = name
                });
            }

            if (illustrators.Any())
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    await _context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT Illustrators ON");
                    await _context.Illustrators.AddRangeAsync(illustrators);
                    await _context.SaveChangesAsync();
                    await _context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT Illustrators OFF");
                    await transaction.CommitAsync();
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }

            return illustrators.Count;
        }

        private async Task<int> ImportSeries(ExcelWorksheet worksheet)
        {
            if (worksheet == null) return 0;

            var seriesList = new List<PuzzleSeries>();
            int rowCount = worksheet.Dimension?.Rows ?? 0;

            for (int row = 2; row <= rowCount; row++)
            {
                var id = GetIntValue(worksheet, row, 1);
                var name = GetStringValue(worksheet, row, 2);
                var brandId = GetIntValue(worksheet, row, 3);

                if (string.IsNullOrWhiteSpace(name) || brandId == 0) continue;

                seriesList.Add(new PuzzleSeries
                {
                    Id = id,
                    Name = name,
                    BrandId = brandId
                });
            }

            if (seriesList.Any())
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    await _context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT Series ON");
                    await _context.Series.AddRangeAsync(seriesList);
                    await _context.SaveChangesAsync();
                    await _context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT Series OFF");
                    await transaction.CommitAsync();
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }

            return seriesList.Count;
        }

        private async Task<PuzzleImportResult> ImportPuzzles(ExcelWorksheet worksheet)
        {
            var importResult = new PuzzleImportResult();

            if (worksheet == null)
            {
                importResult.SkippedRows.Add("Puzzles sheet not found in Excel file");
                return importResult;
            }

            var puzzles = new List<PuzzleBase>();
            int rowCount = worksheet.Dimension?.Rows ?? 0;

            if (rowCount < 2)
            {
                importResult.SkippedRows.Add("No data rows found in Puzzles sheet");
                return importResult;
            }

            for (int row = 2; row <= rowCount; row++)
            {
                var puzzleType = GetStringValue(worksheet, row, 1);
                if (string.IsNullOrWhiteSpace(puzzleType))
                {
                    importResult.SkippedRows.Add($"Row {row}: Empty PuzzleType");
                    continue;
                }

                // Common properties
                var id = GetIntValue(worksheet, row, 2);
                var nameEnglish = GetStringValue(worksheet, row, 3);
                var nameLocal = GetStringValue(worksheet, row, 4);
                var localLanguage = GetStringValue(worksheet, row, 5);
                var productNumber = GetStringValue(worksheet, row, 6);
                var numberOfPieces = GetStringValue(worksheet, row, 7);
                var sortablePieceCount = GetIntValue(worksheet, row, 8);
                var boxImgSrc = GetStringValue(worksheet, row, 9);
                var brandId = GetIntValue(worksheet, row, 10);
                var seriesId = GetNullableIntValue(worksheet, row, 11);
                var illustratorId = GetNullableIntValue(worksheet, row, 12);

                if (string.IsNullOrWhiteSpace(nameEnglish))
                {
                    importResult.SkippedRows.Add($"Row {row}: Empty NameEnglish");
                    continue;
                }

                if (brandId == 0)
                {
                    importResult.SkippedRows.Add($"Row {row}: Missing or invalid BrandId");
                    continue;
                }

                // Type-specific properties
                var publisher = GetStringValue(worksheet, row, 13);
                var releaseDate = GetStringValue(worksheet, row, 14);
                var manufacturer = GetStringValue(worksheet, row, 15);
                var isComboPack = GetBoolValue(worksheet, row, 16);

                PuzzleBase puzzle = puzzleType switch
                {
                    "Official" => new OfficialPuzzle
                    {
                        Id = id,
                        NameEnglish = nameEnglish,
                        NameLocal = nameLocal,
                        LocalLanguage = localLanguage,
                        ProductNumber = productNumber,
                        NumberOfPieces = numberOfPieces,
                        SortablePieceCount = sortablePieceCount,
                        BoxImgSrc = boxImgSrc,
                        BrandId = brandId,
                        PuzzleSeriesId = seriesId,
                        IllustratorId = illustratorId,
                        Publisher = publisher,
                        ReleaseDate = releaseDate,
                        Manufacturer = manufacturer
                    },
                    "JVH" => new JVHPuzzle
                    {
                        Id = id,
                        NameEnglish = nameEnglish,
                        NameLocal = nameLocal,
                        LocalLanguage = localLanguage,
                        ProductNumber = productNumber,
                        NumberOfPieces = numberOfPieces,
                        SortablePieceCount = sortablePieceCount,
                        BoxImgSrc = boxImgSrc,
                        BrandId = brandId,
                        PuzzleSeriesId = seriesId,
                        IllustratorId = illustratorId,
                        Publisher = publisher,
                        ReleaseDate = releaseDate,
                        Manufacturer = manufacturer,
                        IsComboPack = isComboPack
                    },
                    "UserCustom" => new UserCustomPuzzle
                    {
                        Id = id,
                        NameEnglish = nameEnglish,
                        NameLocal = nameLocal,
                        LocalLanguage = localLanguage,
                        ProductNumber = productNumber,
                        NumberOfPieces = numberOfPieces,
                        SortablePieceCount = sortablePieceCount,
                        BoxImgSrc = boxImgSrc,
                        BrandId = brandId,
                        PuzzleSeriesId = seriesId,
                        IllustratorId = illustratorId,
                        CreatedByUserId = GetStringValue(worksheet, row, 17) ?? "system",
                        DateAdded = DateTime.UtcNow,
                        IsPublic = GetBoolValue(worksheet, row, 18)
                    },
                    _ => null
                };

                if (puzzle == null)
                {
                    importResult.SkippedRows.Add($"Row {row}: Invalid PuzzleType '{puzzleType}' (must be 'Official', 'JVH', or 'UserCustom')");
                    continue;
                }

                puzzles.Add(puzzle);
            }

            if (puzzles.Any())
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    await _context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT Puzzles ON");
                    await _context.Puzzles.AddRangeAsync(puzzles);
                    await _context.SaveChangesAsync();
                    await _context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT Puzzles OFF");
                    await transaction.CommitAsync();
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }

            importResult.ImportedCount = puzzles.Count;
            return importResult;
        }

        #region Helper Methods

        private string? GetStringValue(ExcelWorksheet worksheet, int row, int col)
        {
            var value = worksheet.Cells[row, col].Value?.ToString()?.Trim();
            return string.IsNullOrWhiteSpace(value) ? null : value;
        }

        private int GetIntValue(ExcelWorksheet worksheet, int row, int col)
        {
            var value = worksheet.Cells[row, col].Value;
            if (value == null) return 0;
            
            if (int.TryParse(value.ToString(), out int result))
                return result;
            
            return 0;
        }

        private int? GetNullableIntValue(ExcelWorksheet worksheet, int row, int col)
        {
            var value = worksheet.Cells[row, col].Value;
            if (value == null || string.IsNullOrWhiteSpace(value.ToString())) return null;
            
            if (int.TryParse(value.ToString(), out int result))
                return result;
            
            return null;
        }

        private bool GetBoolValue(ExcelWorksheet worksheet, int row, int col)
        {
            var value = worksheet.Cells[row, col].Value?.ToString()?.Trim().ToLower();
            return value == "true" || value == "yes" || value == "1";
        }

        #endregion
    }

    public class PuzzleImportResult
    {
        public int ImportedCount { get; set; }
        public List<string> SkippedRows { get; set; } = new List<string>();
    }

    public class ImportResult
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string? ErrorDetails { get; set; }
        public int BrandsImported { get; set; }
        public int IllustratorsImported { get; set; }
        public int SeriesImported { get; set; }
        public int PuzzlesImported { get; set; }
        public List<string> SkippedRows { get; set; } = new List<string>();

        public override string ToString()
        {
            if (!Success) return $"❌ {Message}\n{ErrorDetails}";

            var message = $@"✅ {Message}
- Brands: {BrandsImported}
- Illustrators: {IllustratorsImported}
- Series: {SeriesImported}
- Puzzles: {PuzzlesImported}";

            if (SkippedRows.Any())
            {
                message += $"\n\n⚠️ Skipped {SkippedRows.Count} rows:\n" + string.Join("\n", SkippedRows);
            }

            return message;
        }
    }
}
