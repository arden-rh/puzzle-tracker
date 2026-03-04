export type PuzzleDiscriminator = "Official" | "JVH" | "UserCustom";

export interface Puzzle {
    id: number;
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

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    totalPuzzlesOwned: number;
    totalPuzzlesCompleted: number;
    displayName?: string;
    profilePicUrl?: string;
    bio?: string;
}

export interface Brand {
    id: number;
    name: string;
    websiteUrl?: string;
    logoImgSrc?: string;
    numberOfPuzzles: number;
}

export interface Illustrator {
    id: number;
    name: string;
    numberOfPuzzles: number;
}

export interface Series {
    id: number;
    name: string;
    brandName: string;
    numberOfPuzzles: number;
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
}
