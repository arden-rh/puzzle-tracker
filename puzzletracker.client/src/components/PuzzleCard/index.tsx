// Types
import type { Puzzle, UserPuzzle } from "../../types/dto/puzzle.types";
// Components
import ButtonLink from "../ButtonLink";
import CustomActions from "./CustomActions";
import Details from "./Details";
import StatusSection from "./StatusSection";

interface PuzzleCardProps {
    puzzle: Puzzle | UserPuzzle;
    isInCollection: boolean;
    isCompleted: boolean;
    isOwned: boolean;
    isCustomPuzzle?: boolean;
    userLoggedIn: boolean;
    onProfilePage?: boolean;
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
    userLoggedIn,
    actionLoading,
    isCustomPuzzle = false,
    onProfilePage = false,
    onMarkCompleted,
    onMarkIncomplete,
    onToggleOwned,
    onAddToCollection,
    onRemoveFromCollection
}) => {

    const deleteCustomPuzzle = () => {

    }

    return (
        <div className={`relative w-full p-3 shadow rounded ${isInCollection ? 'bg-indigo-900/40' : 'bg-indigo-900/90'} hover:ring hover:ring-indigo-300 flex flex-col gap-2 justify-between tracking-wide`}>
            <p className="text-sm bg-indigo-700/40 rounded ring ring-indigo-500 p-1 pr-2 text-white font-medium absolute top-2 right-2"><span className="grayscale">🧩</span>{puzzle.numberOfPieces}</p>
            <Details puzzle={puzzle} />
            <div>
                {userLoggedIn &&
                    <StatusSection
                        puzzleId={puzzle.puzzleId}
                        isCustom={isCustomPuzzle}
                        isCompleted={isCompleted}
                        isOwned={isOwned}
                        isInCollection={isInCollection}
                        actionLoading={actionLoading}
                        onMarkCompleted={onMarkCompleted}
                        onMarkIncomplete={onMarkIncomplete}
                        onToggleOwned={onToggleOwned}
                        onAddToCollection={onAddToCollection}
                        onRemoveFromCollection={onRemoveFromCollection}
                    />
                }
                {isCustomPuzzle && (
                    <CustomActions puzzleId={puzzle.puzzleId} actionLoading={actionLoading} deleteCustomPuzzle={deleteCustomPuzzle} />
                )}
            </div>
            <ButtonLink
                className="mt-2 px-4 py-2 text-center"
                theme="primary"
                route={onProfilePage ? `/profile/collection/${puzzle.puzzleId}` : `/puzzles/${puzzle.puzzleId}`}
            >
                View Details
            </ButtonLink>
        </div >
    );
};

export default PuzzleCard;
