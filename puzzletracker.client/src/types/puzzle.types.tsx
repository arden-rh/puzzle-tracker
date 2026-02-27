import type { Brand, Illustrator, PuzzleSeries } from "./puzzle-properties.types";

export type PuzzleDiscriminator = "Official" | "JVH" | "UserCustom";

// Shared base properties
export interface PuzzleBase {
    id: number;
    nameEnglish: string;
    nameLocal?: string;
    localLanguage?: string;
    productNumber?: string;
    numberOfPieces: string;
    boxImgSrc?: string;
    brandId: number;
    brand?: Brand;
    illustratorId?: number;
    illustrator?: Illustrator;
    seriesId?: number;
    series?: PuzzleSeries;
    puzzleType: PuzzleDiscriminator;
}

export interface OfficialPuzzle extends PuzzleBase {
    puzzleType: "Official";
    publisher: string;
    releaseDate: string;
}

export interface JVHPuzzle extends Omit<OfficialPuzzle, 'puzzleType'> {
    puzzleType: "JVH";
    isComboPack: boolean;
}

export interface UserCustomPuzzle extends PuzzleBase {
    puzzleType: "UserCustom";
    createdByUserId: string;
    dateAdded: string;
    isPublic: boolean;
}

export type Puzzle = OfficialPuzzle | JVHPuzzle | UserCustomPuzzle; // Discriminated Union

