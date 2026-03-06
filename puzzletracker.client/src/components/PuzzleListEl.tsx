import { useNavigate } from "react-router-dom";
import type { Puzzle, UserPuzzle } from "../types/dto/puzzle.types";
import Button from "./Button";

interface PuzzleListElProps {
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

const PuzzleListEl: React.FC<PuzzleListElProps> = ({
    puzzle,
    isInCollection,
    isCompleted,
    isOwned,
    onMarkCompleted,
    onMarkIncomplete,
    onToggleOwned,
    onAddToCollection,
    onRemoveFromCollection,
    actionLoading,
    userLoggedIn,
}) => {

    const navigate = useNavigate();
    const collectionAction = isInCollection ? onRemoveFromCollection : onAddToCollection;

    return (
        <li className={`w-full p-3 shadow rounded ${isInCollection ? 'bg-indigo-900/40' : 'bg-indigo-900/90'} flex flex-col gap-2`}>
            <div className="flex flex-col gap-0.5">
                <h3 className="text-indigo-50 font-medium">{puzzle.nameEnglish}</h3>
                <p className="text-sm text-indigo-400 font-medium"><span className="text-indigo-50">Brand:</span> {puzzle.brandName}</p>
                <p className="text-sm text-indigo-400 font-medium"><span className="text-indigo-50">Pieces:</span> {puzzle.numberOfPieces}</p>
            </div>
            <div className="flex gap-1 items-center">
                {userLoggedIn &&
                    <>
                        {isCompleted ? (
                            <Button
                                onClick={() => onMarkIncomplete(puzzle.puzzleId)}
                                disabled={actionLoading}
                                theme="primary"
                                className="text-[0.8rem] sm:text-sm min-h-12"
                            >
                                Completed
                            </Button>
                        ) : (
                            <Button
                                onClick={() => onMarkCompleted(puzzle.puzzleId)}
                                disabled={actionLoading}
                                theme="secondary"
                                className="text-[0.8rem] sm:text-sm min-h-12"
                            >
                                Not Completed
                            </Button>
                        )}
                        {isOwned ? (
                            <Button
                                className="text-[0.8rem] sm:text-sm min-h-12"
                                onClick={() => onToggleOwned(puzzle.puzzleId)}
                                theme="primary"
                                disabled={actionLoading}
                            >
                                Owned
                            </Button>
                        ) : (
                            <Button
                                className="text-[0.8rem] sm:text-sm min-h-12"
                                onClick={() => onToggleOwned(puzzle.puzzleId)}
                                theme="secondary"
                                disabled={actionLoading}
                            >
                                Not Owned
                            </Button>
                        )}
                        {collectionAction && (
                            <>
                                {isInCollection ? (
                                    <Button
                                    className="text-[0.8rem] sm:text-sm min-h-12"
                                    onClick={() => collectionAction(puzzle.puzzleId)}
                                    theme="primary"
                                    disabled={actionLoading}
                                    >
                                        Remove from Collection
                                    </Button>
                                ) : (
                                    <Button
                                    className="text-[0.8rem] sm:text-sm min-h-12"
                                    onClick={() => collectionAction(puzzle.puzzleId)}
                                    theme="secondary"
                                    disabled={actionLoading}
                                    >
                                        Add to Collection
                                    </Button>
                                )}
                            </>
                        )}
                    </>}
                <Button
                    className="text-[0.8rem] sm:text-sm min-h-12 disabled:opacity-50"
                    theme="primary"
                    disabled={actionLoading}
                    onClick={() => navigate(`/puzzles/${puzzle.puzzleId}`)}
                >
                    View Details
                </Button>
            </div>
        </li>
    );
};

export default PuzzleListEl;
