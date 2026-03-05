export type PuzzleDiscriminator = "Official" | "JVH" | "UserCustom";

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
    isPublic?: boolean; // For UserCustom

    // Collection status (calculated server-side for current user)
    isInUserCollection?: boolean;
    isCompletedByUser?: boolean;
}

export interface UserPuzzle extends Puzzle {
    userPuzzleId: number;
    isOwned: boolean;
    isCompleted: boolean;
    timesCompleted: number;
    lastCompletedDate?: string;
}

export interface PuzzleFilters {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    puzzleType?: string;
    brand?: string;
    series?: string[];
    illustrator?: string[];
    pieceRanges?: string[];
    inCollection?: boolean;
    isCompleted?: boolean;
    page?: number;
    pageSize?: number;
}


