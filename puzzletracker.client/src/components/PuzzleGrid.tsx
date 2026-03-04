import type { Puzzle } from "../types/dto/puzzle.types";
import PuzzleCard from "./PuzzleCard";

interface PuzzleGridProps {
    puzzles: Puzzle[];
    loading: boolean;
    error: string | null;
    onMarkCompleted: (puzzleId: number) => void;
    onUnmarkCompleted: (puzzleId: number) => void;
    actionLoading: boolean;
}

const PuzzleGrid: React.FC<PuzzleGridProps> = ({
    puzzles,
    loading,
    error,
    onMarkCompleted,
    onUnmarkCompleted,
    actionLoading
}) => {
    if (loading) return <div>Loading puzzles...</div>;
    if (error) return <div>Error loading puzzles: {error}</div>;


    return (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {puzzles.length === 0 && <div>No puzzles found matching the criteria.</div>}
            {puzzles.map((puzzle) => (
                <PuzzleCard puzzle={puzzle} key={puzzle.id} onMarkCompleted={onMarkCompleted} onAddToCollection={onUnmarkCompleted} actionLoading={actionLoading} />
            ))}
        </div>
    );
};

export default PuzzleGrid;