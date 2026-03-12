import { useEffect, useState } from "react";
// Types
import type { UserPuzzle } from "../types/dto/puzzle.types";

// Hooks
import useCustomPuzzles from "../hooks/useCustomPuzzles";
import useUserPuzzles from "../hooks/useUserPuzzles";

// Components
import PuzzleList from "../components/PuzzleList";
import RemoveFromCollectionModal from "../components/modals/RemoveFromCollectionModal";

const CustomPuzzles = () => {

    const { getAllUserPuzzles, markPuzzleAsCompleted, markPuzzleAsIncomplete, removePuzzleFromCollection, userPuzzles, loading, error, totalCount, currentPage, totalPages, pageSize } = useUserPuzzles();
    const { getAllCustomPuzzles, customPuzzles } = useCustomPuzzles();

    const handleMarkCompleted = async (puzzleId: number) => {
        await markPuzzleAsCompleted(puzzleId);
        await getAllUserPuzzles();
    };

    const handleMarkIncomplete = async (puzzleId: number) => {
        await markPuzzleAsIncomplete(puzzleId);
        await getAllUserPuzzles();
    };
    
    const handleRemoveFromCollection = (puzzleId: number) => {
        const puzzle = userPuzzles.find((p: UserPuzzle) => p.puzzleId === puzzleId);
        if (puzzle) setRemoveModalPuzzle(puzzle);
    };

    const handleConfirmRemove = async () => {
        if (!removeModalPuzzle) return;
        await removePuzzleFromCollection(removeModalPuzzle.puzzleId);
        setRemoveModalPuzzle(null);
    };

    const completedIds = new Set(userPuzzles.filter(p => p.isCompleted).map(p => p.puzzleId));
    const [removeModalPuzzle, setRemoveModalPuzzle] = useState<UserPuzzle | null>(null);

    useEffect(() => {
        getAllCustomPuzzles()
    }, []);

    return (
        <div className="flex flex-col gap-4">
            {removeModalPuzzle && (
                <RemoveFromCollectionModal
                    puzzle={removeModalPuzzle}
                    onConfirm={handleConfirmRemove}
                    onCancel={() => setRemoveModalPuzzle(null)}
                    loading={loading}
                />
            )}
            <h2 className="text-xl font-bold">My Custom Puzzles</h2>
            <PuzzleList puzzles={customPuzzles} loading={loading} error={error} completedIds={completedIds} onMarkCompleted={handleMarkCompleted} onMarkIncomplete={handleMarkIncomplete} onRemoveFromCollection={handleRemoveFromCollection} actionLoading={false} userLoggedIn={true} isCollection={true} />
        </div>
    );
}

export default CustomPuzzles;