export interface UserProfile {
    id: string;
    name: string;
    email: string;
    totalPuzzlesOwned: number;
    totalPuzzlesCompleted: number;
    totalPuzzlesInCollection: number;
    displayName?: string;
    profilePicUrl?: string;
    bio?: string;
}

export interface UpdateUserProfile {
    displayName?: string;
    profilePicUrl?: string;
    bio?: string;
}