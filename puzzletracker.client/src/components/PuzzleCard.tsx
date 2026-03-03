import type { Puzzle } from "../types/dto.types";

interface PuzzleCardProps {
    puzzle: Puzzle;
    onMarkCompleted: (puzzleId: number) => void;
    onAddToCollection: (puzzleId: number) => void;
    actionLoading: boolean;
}

const PuzzleCard: React.FC<PuzzleCardProps> = ({
    puzzle,
    onMarkCompleted,
    onAddToCollection,
    actionLoading
}) => {
    return (
        <div className="w-40 p-4 shadow-md bg-white flex flex-col justify-between">
            <h3 className="text-center">{puzzle.nameEnglish}</h3>
            <div>
                <p className="text-sm text-gray-600">{puzzle.brandName}</p>
                <p className="text-sm text-gray-600">{puzzle.numberOfPieces} pieces</p>
            </div>
            <div>
                <button
                    className="bg-blue-500 text-white px-2 py-1 rounded mr-2 text-sm"
                    onClick={() => onMarkCompleted(puzzle.id)}
                    disabled={actionLoading}
                >
                    Mark as Completed
                </button>
                <button
                    className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                    onClick={() => onAddToCollection(puzzle.id)}
                    disabled={actionLoading}
                >
                    Add to Collection
                </button>
            </div>
        </div>
    );
};

export default PuzzleCard;