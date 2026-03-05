import type { Puzzle, UserPuzzle } from "../types/dto/puzzle.types";

interface PuzzleListElProps {
    puzzle: Puzzle | UserPuzzle;
    isInCollection: boolean;
    isCompleted: boolean;
    onMarkCompleted: (puzzleId: number) => void;
    onMarkIncomplete: (puzzleId: number) => void;
    onAddToCollection?: (puzzleId: number) => void;
    onRemoveFromCollection?: (puzzleId: number) => void;
    actionLoading: boolean;
}

const PuzzleListEl: React.FC<PuzzleListElProps> = ({
    puzzle,
    isInCollection,
    isCompleted,
    onMarkCompleted,
    onMarkIncomplete,
    onAddToCollection,
    onRemoveFromCollection,
    actionLoading,
}) => {

    return (
        <div className="relative w-full p-3 shadow bg-white flex flex-col justify-between">
            <p className="text-sm bg-blue-800 p-1 pr-2 text-white font-medium absolute top-2 right-2"><span className="grayscale">🧩</span>{puzzle.numberOfPieces}</p>
            <h3 className="text-black font-medium max-w-[65%]">{puzzle.nameEnglish}</h3>
            {puzzle.puzzleType == "JVH" && <h4 className="text-sm text-gray-600">{puzzle.nameLocal}</h4>}
            <div>
                <p className="text-sm text-black font-medium">{puzzle.brandName}</p>
                {puzzle.releaseDate && <p className="text-sm text-gray-600"><span className="text-black">Release date:</span> {puzzle.releaseDate}</p>}
                {puzzle.seriesName && <p className="text-sm text-gray-600"><span className="text-black">Series:</span> {puzzle.seriesName}</p>}
                {puzzle.illustratorName && <p className="text-sm text-gray-600"><span className="text-black">Illustrator:</span> {puzzle.illustratorName}</p>}
                {puzzle.productNumber && <p className="text-sm text-gray-600"><span className="text-black">Product number:</span> {puzzle.productNumber}</p>}
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

                {isInCollection && onRemoveFromCollection ? (
                    <button
                        className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                        onClick={() => onRemoveFromCollection(puzzle.puzzleId)}
                        disabled={actionLoading}
                    >
                        Remove from Collection
                    </button>
                ) : (
                    onAddToCollection && (
                        <button
                            className="bg-yellow-500 text-white px-2 py-1 rounded text-sm"
                            onClick={() => onAddToCollection(puzzle.puzzleId)}
                            disabled={actionLoading}
                        >
                            Add to Collection
                        </button>
                    )
                )}
            </div>
        </div>
    );
};

export default PuzzleListEl;
