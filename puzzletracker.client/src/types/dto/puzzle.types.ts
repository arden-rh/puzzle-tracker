export type PuzzleDiscriminator = "Official" | "JVH" | "UserCustom";

// Base puzzle type with common fields
export interface Puzzle {
    puzzleId: number;
    puzzleType: PuzzleDiscriminator;
    nameEnglish: string;
    nameLocal?: string;
    localLanguage?: string;
    productNumber?: string;
    numberOfPieces: string;
    boxImgSrc?: string;
    brandName: string;
    seriesName?: string;
    illustratorName?: string;

    // Sub-class fields
    publisher?: string; // For Official and JVH
    releaseDate?: string; // For Official and JVH
    manufacturer?: string; // For Official and JVH
    isComboPack?: boolean; // For JVH
    createdByUserId?: string; // For UserCustom
    dateAdded?: string; // For UserCustom
    isPublic: boolean; // For UserCustom

    // Collection status (calculated server-side for current user)
    isInUserCollection?: boolean;
    isCompletedByUser?: boolean;
}

// Extends Puzzle with user-specific fields for puzzles in the user's collection
export interface UserPuzzle extends Puzzle {
    userPuzzleId: number;
    isOwned: boolean;
    isCompleted: boolean;
    timesCompleted: number;
    lastCompletedDate?: string;
}

// Used creating puzzles in the user's collection (only UserCustom type)
export interface UserCustomPuzzle {
    nameEnglish: string;
    nameLocal?: string;
    localLanguage?: string;
    productNumber?: string;
    numberOfPieces: string;
    boxImgSrc?: string;
    brandName: string;
    seriesName?: string;
    illustratorName?: string;
    isPublic: boolean;
}

// For params to filter and sort puzzles in the global library
export interface PuzzleFilters {
    searchQuery?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    puzzleType?: string;
    brand?: string;
    series?: string[];
    illustrator?: string[];
    pieceRanges?: string[];
    inCollection?: boolean;
    isCompleted?: boolean;
    isOwned?: boolean,
    page?: number;
    pageSize?: number;
}


