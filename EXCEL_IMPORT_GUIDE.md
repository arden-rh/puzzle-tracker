# Excel Import Template Guide

This document describes the exact Excel structure needed to import data into PuzzleTracker.

## File Requirements

- **File format:** `.xlsx` (Excel 2007+)
- **Sheets required:** Brands, Illustrators, Series, Puzzles
- **Row 1:** Column headers (exact names shown below)
- **Row 2+:** Your data
- **No empty rows** between data records
- **No merged cells**
- **Remove formulas** - convert to values only

---

## Sheet 1: Brands

Column order and names:

| Column | Header | Type | Required | Example |
|--------|--------|------|----------|---------|
| A | Id | Integer | Yes | 1 |
| B | Name | Text | Yes | Ravensburger |
| C | WebsiteUrl | Text | No | https://www.ravensburger.com |
| D | LogoImgSrc | Text | No | /images/logos/ravensburger.png |

### Example:
```
Id  Name            WebsiteUrl                      LogoImgSrc
1   Ravensburger    https://www.ravensburger.com    /images/ravensburger.png
2   Jumbo Games     https://www.jumbogames.com      /images/jumbo.png
3   Buffalo Games   https://buffalogames.com        /images/buffalo.png
```

---

## Sheet 2: Illustrators

Column order and names:

| Column | Header | Type | Required | Example |
|--------|--------|------|----------|---------|
| A | Id | Integer | Yes | 1 |
| B | Name | Text | Yes | Jan van Haasteren |

### Special Values:
- Use "Combo" for combo packs with multiple illustrators
- Use "Unknown" for puzzles without known illustrator

### Example:
```
Id  Name
1   Jan van Haasteren
2   Thomas Kinkade
3   Unknown
4   Combo
```

---

## Sheet 3: Series

Column order and names:

| Column | Header | Type | Required | Example |
|--------|--------|------|----------|---------|
| A | Id | Integer | Yes | 1 |
| B | Name | Text | Yes | Disney Collection |
| C | BrandId | Integer | Yes | 1 |

**Note:** BrandId must exist in the Brands sheet!

### Example:
```
Id  Name                BrandId
1   Disney Collection   1
2   Scenic Art          1
3   JVH Classics        2
```

---

## Sheet 4: Puzzles

### Core Columns (Required for all types):

| Column | Header | Type | Required | Notes |
|--------|--------|------|----------|-------|
| A | PuzzleType | Text | Yes | "Official", "JVH", or "UserCustom" |
| B | Id | Integer | Yes | Unique ID |
| C | NameEnglish | Text | Yes | English name |
| D | NameLocal | Text | No | Local language name |
| E | LocalLanguage | Text | No | Language code (e.g., "Dutch", "German") |
| F | ProductNumber | Text | No | Manufacturer's product code |
| G | NumberOfPieces | Text | Yes | Display value (e.g., "1000", "Combo") |
| H | SortablePieceCount | Integer | Yes | Use 999999 for combo packs |
| I | BoxImgSrc | Text | No | Image URL or path |
| J | BrandId | Integer | Yes | Must exist in Brands sheet |
| K | PuzzleSeriesId | Integer | No | Must exist in Series sheet |
| L | IllustratorId | Integer | No | Must exist in Illustrators sheet |

### Additional Columns (For Official/JVH puzzles):

| Column | Header | Type | Required | Notes |
|--------|--------|------|----------|-------|
| M | Publisher | Text | Recommended | Publisher name |
| N | ReleaseDate | Text | Recommended | "Unknown", "2023", or "2023-05-15" |
| O | Manufacturer | Text | Recommended | Manufacturer name |
| P | IsComboPack | Boolean | No | TRUE/FALSE (only for JVH type) |

### Additional Columns (For UserCustom puzzles only - SKIP if not needed):

| Column | Header | Type | Required | Notes |
|--------|--------|------|----------|-------|
| Q | CreatedByUserId | Text | No | Only for UserCustom type |
| R | IsPublic | Boolean | No | TRUE/FALSE (only for UserCustom type) |

**📌 Note:** If you're only importing Official/JVH puzzles, **stop at Column P**. Columns Q and R are not needed.

### Date Format Standards:
- **Unknown:** Use exactly "Unknown"
- **Year only:** Use "2023" (4 digits)
- **Full date:** Use "2023-05-15" (ISO format: YYYY-MM-DD)

### Combo Pack Convention:
- **NumberOfPieces:** "Combo"
- **SortablePieceCount:** 999999
- **IsComboPack:** TRUE (for JVH puzzles)

### Example Data:
```
PuzzleType  Id  NameEnglish       NameLocal    LocalLanguage  ProductNumber  NumberOfPieces  SortablePieceCount  BoxImgSrc        BrandId  PuzzleSeriesId  IllustratorId  Publisher      ReleaseDate  Manufacturer   IsComboPack
Official    1   Disney Castle                                   12345          1000            1000                /img/castle.jpg  1        1               1              Ravensburger   2023-05-15   Ravensburger   
JVH         2   The Kitchen       De Keuken    Dutch           19234          1000            1000                /img/kitchen.jpg 2                        1              Jumbo Games    2020         Jumbo          FALSE
JVH         3   Holiday Pack                                    COMBO-01       Combo           999999              /img/combo.jpg   2                        4              Jumbo Games    2022         Jumbo          TRUE
```

**Note:** The example above stops at column P (IsComboPack). If you have UserCustom puzzles, add columns Q (CreatedByUserId) and R (IsPublic).

---

## Pre-Import Checklist

Before importing, verify:

1. ✅ All required columns have values (no empty cells)
2. ✅ Foreign keys reference existing IDs:
   - BrandId exists in Brands sheet
   - PuzzleSeriesId exists in Series sheet (if specified)
   - IllustratorId exists in Illustrators sheet (if specified)
3. ✅ PuzzleType is exactly: "Official", "JVH", or "UserCustom"
4. ✅ Date format is: "Unknown", "YYYY", or "YYYY-MM-DD"
5. ✅ Boolean values are: TRUE/FALSE (or 1/0, yes/no)
6. ✅ IDs are sequential and unique within each sheet
7. ✅ No leading/trailing spaces in text values
8. ✅ Combo packs have SortablePieceCount = 999999
9. ✅ Save file as `.xlsx` format

---

## Import Methods

### Method 1: Via API (Upload File)
```bash
POST /api/import/upload-excel
Content-Type: multipart/form-data

file: [your-excel-file.xlsx]
```

### Method 2: Via API (Direct Path - Development Only)
```bash
POST /api/import/import-from-path
Content-Type: application/json

{
  "filePath": "C:\\path\\to\\your\\puzzles.xlsx"
}
```

### Method 3: Programmatically (In Code)
```csharp
var importer = new ExcelImportService(context);
var result = await importer.ImportFromExcel("path/to/file.xlsx");
Console.WriteLine(result.ToString());
```

---

## Common Issues & Solutions

### Issue: "Foreign key constraint violation"
**Solution:** Ensure Brands/Illustrators/Series exist before importing Puzzles

### Issue: "Duplicate key error"
**Solution:** Clear database first or use unique IDs

### Issue: "Invalid date format"
**Solution:** Use YYYY-MM-DD format or "Unknown"

### Issue: "Boolean not recognized"
**Solution:** Use TRUE/FALSE (not Yes/No or 1/0)

### Issue: "Row skipped"
**Solution:** Check that required fields (Name, BrandId, etc.) have values
