import type { Puzzle } from "../types/dto/puzzle.types";

interface RemoveFromCollectionModalProps {
    puzzle: Puzzle;
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}

const RemoveFromCollectionModal: React.FC<RemoveFromCollectionModalProps> = ({ puzzle, onConfirm, onCancel, loading }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm mx-4">
                <h2 className="text-lg font-bold mb-1">Remove from Collection</h2>
                <p className="text-sm text-gray-600 mb-6">
                    Are you sure you want to remove{" "}
                    <span className="font-medium text-black">{puzzle.nameEnglish}</span>
                    {" "}from your collection? This will also clear any completion data.
                </p>
                <div className="flex gap-2 justify-end">
                    <button
                        className="px-4 py-2 text-sm rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 text-sm rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? "Removing..." : "Remove"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RemoveFromCollectionModal;
