import { useNavigate } from "react-router-dom";
import type { Puzzle, UserPuzzle } from "../types/dto/puzzle.types";
import Button from "./Button";

interface PuzzleCardProps {
    puzzle: Puzzle | UserPuzzle;
    isInCollection: boolean;
    isCompleted: boolean;
    isOwned: boolean;
    userLoggedIn: boolean;
    onMarkCompleted: (puzzleId: number) => void;
    onMarkIncomplete: (puzzleId: number) => void;
    onToggleOwned: (puzzleId: number) => void;
    onAddToCollection?: (puzzleId: number) => void;
    onRemoveFromCollection?: (puzzleId: number) => void;
    actionLoading: boolean;
}

const PuzzleCard: React.FC<PuzzleCardProps> = ({
    puzzle,
    isInCollection,
    isCompleted,
    isOwned,
    onMarkCompleted,
    onMarkIncomplete,
    onToggleOwned,
    onAddToCollection,
    onRemoveFromCollection,
    userLoggedIn,
    actionLoading,
}) => {

    const navigate = useNavigate();

    const collectionAction = isInCollection ? onRemoveFromCollection : onAddToCollection;

    return (
        <div className={`relative w-full p-3 shadow rounded ${isInCollection ? 'bg-indigo-900/40' : 'bg-indigo-900/90'} flex flex-col gap-2 justify-between tracking-wide`}>
            <p className="text-sm bg-indigo-700/40 rounded ring ring-indigo-500 p-1 pr-2 text-white font-medium absolute top-2 right-2"><span className="grayscale">🧩</span>{puzzle.numberOfPieces}</p>
            <div className="flex flex-col gap-0.5">
                <h3 className="text-indigo-50 font-medium max-w-[65%]">{puzzle.nameEnglish}</h3>
                {puzzle.puzzleType == "JVH" && <p className="text-sm text-indigo-400">{puzzle.nameLocal}</p>}
            </div>
            <div className="flex flex-col gap-0.5">
                <p className="text-[0.95rem] text-indigo-50 font-medium">{puzzle.brandName}</p>
                {puzzle.releaseDate && <p className="text-sm text-indigo-400"><span className="text-indigo-50">Release date:</span> {puzzle.releaseDate}</p>}
                {puzzle.seriesName && <p className="text-sm text-indigo-400"><span className="text-indigo-50">Series:</span> {puzzle.seriesName}</p>}
                {puzzle.illustratorName && <p className="text-sm text-indigo-400"><span className="text-indigo-50">Illustrator:</span> {puzzle.illustratorName}</p>}
                {puzzle.productNumber && <p className="text-sm text-indigo-400"><span className="text-indigo-50">Product number:</span> {puzzle.productNumber}</p>}
            </div>
            {userLoggedIn && <div className="flex flex-col gap-0.5">
                <h4 className="font-medium">Status</h4>
                <div className="status grid grid-cols-[max-content_auto] gap-x-3 gap-y-2 items-center">
                    <span className="text-[0.95rem]">Completion:</span>
                    {isCompleted ? (
                        <Button
                            onClick={() => onMarkIncomplete(puzzle.puzzleId)}
                            disabled={actionLoading}
                            theme="primary"
                            className="justify-self-start"
                        >
                            Completed
                        </Button>
                    ) : (
                        <Button
                            onClick={() => onMarkCompleted(puzzle.puzzleId)}
                            disabled={actionLoading}
                            theme="secondary"
                            className="justify-self-start"
                        >
                            Not Completed
                        </Button>
                    )}
                    <span className="text-[0.95rem]">Ownership:</span>
                    {isOwned ? (
                        <Button
                            className="justify-self-start"
                            onClick={() => onToggleOwned(puzzle.puzzleId)}
                            theme="primary"
                            disabled={actionLoading}
                        >
                            Owned
                        </Button>
                    ) : (
                        <Button
                            className="justify-self-start"
                            onClick={() => onToggleOwned(puzzle.puzzleId)}
                            theme="secondary"
                            disabled={actionLoading}
                        >
                            Not Owned
                        </Button>
                    )}
                    {collectionAction && (
                        <>
                            <span className="text-[0.95rem]">Collection:</span>
                            {isInCollection ? (
                                <Button
                                    className="justify-self-start"
                                    onClick={() => collectionAction(puzzle.puzzleId)}
                                    theme="primary"
                                    disabled={actionLoading}
                                >
                                    Remove
                                </Button>
                            ) : (
                                <Button
                                    className="justify-self-start"
                                    onClick={() => collectionAction(puzzle.puzzleId)}
                                    theme="secondary"
                                    disabled={actionLoading}
                                >
                                    Add
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>}
            <Button
                className="mt-2 px-4 py-2 disabled:opacity-50"
                theme="primary"
                disabled={actionLoading}
                onClick={() => navigate(`/puzzles/${puzzle.puzzleId}`)}
            >
                View Details
            </Button>
        </div>
    );
};

export default PuzzleCard;
