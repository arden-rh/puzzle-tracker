import type { Puzzle } from "../types/dto.types";

interface PuzzleListElProps {
    puzzle: Puzzle;
    onMarkCompleted: (puzzleId: number) => void;
    onUnmarkCompleted: (puzzleId: number) => void;
    actionLoading: boolean;
}

const PuzzleListEl: React.FC<PuzzleListElProps> = ({
    puzzle,
    onMarkCompleted,
    onUnmarkCompleted,
    actionLoading
}) => {
    return (
            
        <div className="w-full p-4 shadow-md bg-white flex flex-col justify-between">
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
                    onClick={() => onUnmarkCompleted(puzzle.id)}
                    disabled={actionLoading}
                >
                    Add to Collection
                </button>
                </div>
            </div>
    );
};

export default PuzzleListEl;
        