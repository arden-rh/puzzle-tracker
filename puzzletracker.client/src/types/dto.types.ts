import type { PuzzleDiscriminator } from "./puzzle.types";

export interface PuzzleDto {
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

export interface UserPuzzleDto extends PuzzleDto {
    userPuzzleId: number;
    isOwned: boolean;
    isCompleted: boolean;
    timesCompleted: number;
    lastCompletedDate?: string;
}

export interface UserProfileDto {
    id: string;
    name: string;
    email: string;
    totalPuzzlesOwned: number;
    totalPuzzlesCompleted: number;
    displayName?: string;
    profilePicUrl?: string;
    bio?: string;
}