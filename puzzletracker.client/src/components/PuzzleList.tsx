import type { Puzzle, UserPuzzle } from "../types/dto/puzzle.types";
import PuzzleListEl from "./PuzzleListEl";

interface PuzzleListProps {
    puzzles: Puzzle[] | UserPuzzle[];
    loading: boolean;
    error: string | null;
    collectionIds: Set<number>;
    completedIds: Set<number>;
    ownedIds: Set<number>;
    userLoggedIn: boolean;
    onMarkCompleted: (puzzleId: number) => void;
    onMarkIncomplete: (puzzleId: number) => void;
    onToggleOwned: (puzzleId: number) => void;
    onAddToCollection?: (puzzleId: number) => void;
    onRemoveFromCollection?: (puzzleId: number) => void;
    actionLoading: boolean;
}

const PuzzleList: React.FC<PuzzleListProps> = ({
    puzzles,
    loading,
    error,
    collectionIds,
    completedIds,
    ownedIds,
    userLoggedIn,
    onMarkCompleted,
    onMarkIncomplete,
    onAddToCollection,
    onRemoveFromCollection,
    onToggleOwned,
    actionLoading,
}) => {
    if (loading) return <div className="w-full flex items-center justify-center text-center"><span>Loading...</span></div>;
    if (error) return <div className="w-full flex items-center justify-center text-center"><span>Error loading puzzles: {error}</span></div>;

    return (
        <div className="grid grid-cols-1 gap-4">
            {puzzles.length === 0 && <div className="w-full flex items-center justify-center text-center"><span>No puzzles found matching the criteria.</span></div>}
            <ul className="flex flex-col gap-4">
                {puzzles.map((puzzle) => (
                    <PuzzleListEl puzzle={puzzle} key={puzzle.puzzleId} isInCollection={collectionIds.has(puzzle.puzzleId)} isCompleted={completedIds.has(puzzle.puzzleId)} isOwned={ownedIds.has(puzzle.puzzleId)} onMarkCompleted={onMarkCompleted} onMarkIncomplete={onMarkIncomplete} onToggleOwned={onToggleOwned} onAddToCollection={onAddToCollection} onRemoveFromCollection={onRemoveFromCollection} actionLoading={actionLoading} userLoggedIn={userLoggedIn} />
                ))}
            </ul>
        </div>
    );
};

export default PuzzleList;