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