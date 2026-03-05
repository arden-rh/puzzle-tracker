import type { Puzzle, UserPuzzle } from "../types/dto/puzzle.types";
import PuzzleListEl from "./PuzzleListEl";

interface PuzzleListProps {
    puzzles: Puzzle[] | UserPuzzle[];
    loading: boolean;
    error: string | null;
    collectionIds: Set<number>;
    completedIds: Set<number>;
    onMarkCompleted: (puzzleId: number) => void;
    onMarkIncomplete: (puzzleId: number) => void;
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
    onMarkCompleted,
    onMarkIncomplete,
    onAddToCollection,
    onRemoveFromCollection,
    actionLoading,
}) => {
    if (loading) return <div>Loading puzzles...</div>;
    if (error) return <div>Error loading puzzles: {error}</div>;

    return (
        <div className="grid grid-cols-1 gap-4">
            {puzzles.length === 0 && <div>No puzzles found matching the criteria.</div>}
            {puzzles.map((puzzle) => (
                <PuzzleListEl puzzle={puzzle} key={puzzle.puzzleId} isInCollection={collectionIds.has(puzzle.puzzleId)} isCompleted={completedIds.has(puzzle.puzzleId)} onMarkCompleted={onMarkCompleted} onMarkIncomplete={onMarkIncomplete} onAddToCollection={onAddToCollection} onRemoveFromCollection={onRemoveFromCollection} actionLoading={actionLoading} />
            ))}
        </div>
    );
};

export default PuzzleList;