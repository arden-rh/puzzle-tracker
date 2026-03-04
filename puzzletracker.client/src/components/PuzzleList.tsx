import type { Puzzle } from "../types/dto.types";
import PuzzleListEl from "./PuzzleListEl";

interface PuzzleListProps {
    puzzles: Puzzle[];
    loading: boolean;
    error: string | null;
    onMarkCompleted: (puzzleId: number) => void;
    onUnmarkCompleted: (puzzleId: number) => void;
    actionLoading: boolean;
}

const PuzzleList: React.FC<PuzzleListProps> = ({
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
        <div className="grid grid-cols-1 gap-4">
            {puzzles.length === 0 && <div>No puzzles found matching the criteria.</div>}
            <p>Showing {puzzles.length} puzzles</p>
            {puzzles.map((puzzle) => (
                <PuzzleListEl puzzle={puzzle} key={puzzle.id} onMarkCompleted={onMarkCompleted} onUnmarkCompleted={onUnmarkCompleted} actionLoading={actionLoading} />
            ))}
        </div>
    );
};

export default PuzzleList;