import type { Puzzle } from "../../types/dto/puzzle.types";
import Button from "../Button";

interface RemoveFromCollectionModalProps {
    puzzle: Puzzle ;
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}

const RemoveFromCollectionModal: React.FC<RemoveFromCollectionModalProps> = ({ puzzle, onConfirm, onCancel, loading }) => {

    const isCustomPuzzle = (puzzle as Puzzle).createdByUserId !== null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-indigo-900 rounded shadow-lg p-6 w-full max-w-sm mx-4">
                <h2 className="text-lg font-bold mb-1">Remove from Collection</h2>
                <p className="text-sm text-indigo-300 mb-6">
                    Are you sure you want to {isCustomPuzzle ? "delete " : "remove "}
                    <span className="font-medium text-white">{puzzle.nameEnglish}</span>
                    {" "}from your collection? This will also clear any completion data.
                </p>
                <div className="flex gap-2 justify-end">
                    <Button
                        className="px-4 py-2 text-sm disabled:opacity-50"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? (isCustomPuzzle ? "Deleting..." : "Removing...") : (isCustomPuzzle ? "Delete" : "Remove")}
                    </Button>
                    <Button
                        className="px-4 py-2 disabled:opacity-50"
                        onClick={onCancel}
                        disabled={loading}
                        theme="secondary"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default RemoveFromCollectionModal;
