import type { Puzzle } from "../types/dto/puzzle.types";
import PuzzleCard from "./PuzzleCard";

interface PuzzleGridProps {
    puzzles: Puzzle[];
    loading: boolean;
    error: string | null;
    collectionIds: Set<number>;
    completedIds: Set<number>;
    userPuzzleIds: Set<number>;
    ownedIds: Set<number>;
    userLoggedIn: boolean;
    isCollection?: boolean;
    onMarkCompleted: (puzzleId: number) => void;
    onMarkIncomplete: (puzzleId: number) => void;
    onToggleOwned: (puzzleId: number) => void;
    onAddToCollection?: (puzzleId: number) => void;
    onRemoveFromCollection: (puzzleId: number) => void;
    actionLoading: boolean;
}

const PuzzleGrid: React.FC<PuzzleGridProps> = ({
    puzzles,
    loading,
    error,
    collectionIds,
    completedIds,
    ownedIds,
    userPuzzleIds,
    userLoggedIn,
    isCollection = false,
    onMarkCompleted,
    onMarkIncomplete,
    onToggleOwned,
    onAddToCollection,
    onRemoveFromCollection,
    actionLoading
}) => {
    if (loading) return <div className="w-full flex items-center justify-center text-center">
        <span>Loading...</span>
    </div>;
    if (error) return <div className="w-full flex items-center justify-center text-center"><span>Error loading puzzles: {error}</span></div>;

    if (puzzles.length === 0) {
        const emptyMessage = isCollection
            ? "You don't have any puzzles in your collection yet. Start adding some!"
            : "No puzzles found matching the criteria.";
        return <div className="w-full flex items-center justify-center text-center">{emptyMessage}</div>;
    }

    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {puzzles.map((puzzle) => (
                <PuzzleCard puzzle={puzzle} key={puzzle.puzzleId} isInCollection={collectionIds.has(puzzle.puzzleId)} isCompleted={completedIds.has(puzzle.puzzleId)} isOwned={ownedIds.has(puzzle.puzzleId)} isCustomPuzzle={userPuzzleIds.has(puzzle.puzzleId)} onMarkCompleted={onMarkCompleted} onMarkIncomplete={onMarkIncomplete} onToggleOwned={onToggleOwned} onAddToCollection={onAddToCollection} onRemoveFromCollection={onRemoveFromCollection} actionLoading={actionLoading} userLoggedIn={userLoggedIn} />
            ))}
        </div>
    );
};

export default PuzzleGrid;