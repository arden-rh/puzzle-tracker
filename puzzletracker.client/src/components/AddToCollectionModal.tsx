import { useState } from "react";
import type { Puzzle } from "../types/dto/puzzle.types";
import Button from "./Button";

interface AddToCollectionModalProps {
    puzzle: Puzzle;
    onConfirm: (markOwned: boolean, markCompleted: boolean) => void;
    onCancel: () => void;
    loading: boolean;
}

const AddToCollectionModal: React.FC<AddToCollectionModalProps> = ({ puzzle, onConfirm, onCancel, loading }) => {
    const [markOwned, setMarkOwned] = useState(false);
    const [markCompleted, setMarkCompleted] = useState(false);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-indigo-800 rounded shadow-lg p-6 w-full max-w-sm mx-4">
                <h2 className="text-lg font-bold mb-1">Add to Collection</h2>
                <p className="text-indigo-300 text-sm mb-4">
                    <span className="font-medium text-indigo-50">{puzzle.nameEnglish}</span>
                    {" · "}{puzzle.brandName}{" · "}{puzzle.numberOfPieces} pieces
                </p>
                <div className="flex flex-col gap-3 mb-6">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={markOwned}
                            onChange={e => setMarkOwned(e.target.checked)}
                            className="w-4 h-4"
                        />
                        <span className="text-sm">Mark as owned</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={markCompleted}
                            onChange={e => setMarkCompleted(e.target.checked)}
                            className="w-4 h-4"
                        />
                        <span className="text-sm">Mark as completed</span>
                    </label>
                </div>
                <div className="flex gap-2 justify-end">
                    <Button
                        className="px-4 py-2 disabled:opacity-50"
                        onClick={() => onConfirm(markOwned, markCompleted)}
                        disabled={loading}
                    >
                        {loading ? "Adding..." : "Add to Collection"}
                    </Button>
                    <Button
                        className="px-4 py-2 disabled:opacity-50"
                        theme="secondary"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AddToCollectionModal;
