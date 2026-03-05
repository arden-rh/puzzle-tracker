import type { Puzzle } from "../types/dto/puzzle.types";

interface PuzzleCardProps {
    puzzle: Puzzle;
    isInCollection: boolean;
    isCompleted: boolean;
    onMarkCompleted: (puzzleId: number) => void;
    onMarkIncomplete: (puzzleId: number) => void;
    onAddToCollection: (puzzleId: number) => void;
    onRemoveFromCollection: (puzzleId: number) => void;
    actionLoading: boolean;
}

const PuzzleCard: React.FC<PuzzleCardProps> = ({
    puzzle,
    isInCollection,
    isCompleted,
    onMarkCompleted,
    onMarkIncomplete,
    onAddToCollection,
    onRemoveFromCollection,
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
                {isCompleted ? (
                    <button
                        className="bg-gray-500 text-white px-2 py-1 rounded mr-2 text-sm"
                        onClick={() => onMarkIncomplete(puzzle.puzzleId)}
                        disabled={actionLoading}
                    >
                        Mark as Incomplete
                    </button>
                ) : (
                    <button
                        className="bg-blue-500 text-white px-2 py-1 rounded mr-2 text-sm"
                        onClick={() => onMarkCompleted(puzzle.puzzleId)}
                        disabled={actionLoading}
                    >
                    Mark as Completed
                </button>
                )}
                {!isInCollection ? (
                    <button
                        className="bg-yellow-500 text-white px-2 py-1 rounded text-sm"
                        onClick={() => onAddToCollection(puzzle.puzzleId)}
                        disabled={actionLoading}
                    >
                    Add to Collection
                </button>
                ) : (
                    <button
                        className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                        onClick={() => onRemoveFromCollection(puzzle.puzzleId)}
                        disabled={actionLoading}
                    >
                    Remove from Collection
                </button>
                )}
            </div>
        </div>
    );
};

export default PuzzleCard;