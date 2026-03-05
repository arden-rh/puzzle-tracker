import { useEffect, useState } from "react";
// Types
import type { UserPuzzle } from "../types/dto/puzzle.types";

// Hooks
import useUserPuzzles from "../hooks/useUserPuzzles";

// Components
import SearchBox from "../components/SearchBox";
import PuzzleList from "../components/PuzzleList";
import RemoveFromCollectionModal from "../components/RemoveFromCollectionModal";

const ProfileCollection = () => {

    const { getAllUserPuzzles, markPuzzleAsCompleted, markPuzzleAsIncomplete, removePuzzleFromCollection, userPuzzles, loading, error, totalCount, currentPage, totalPages, pageSize } = useUserPuzzles();

    const [currentQuery, setCurrentQuery] = useState<string>();


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

    const handleApplySearchQuery = async (query: string) => {
        setCurrentQuery(query);
        await getAllUserPuzzles(query);
    };

    const collectionIds = new Set(userPuzzles.map(p => p.puzzleId));
    const completedIds = new Set(userPuzzles.filter(p => p.isCompleted).map(p => p.puzzleId));
    const [removeModalPuzzle, setRemoveModalPuzzle] = useState<UserPuzzle | null>(null);

    useEffect(() => {
        getAllUserPuzzles()
    }, []);

    return (
        <div>
            {removeModalPuzzle && (
                <RemoveFromCollectionModal
                    puzzle={removeModalPuzzle}
                    onConfirm={handleConfirmRemove}
                    onCancel={() => setRemoveModalPuzzle(null)}
                    loading={loading}
                />
            )}
            <h2>Profile Collection Page</h2>
            <SearchBox onSearch={handleApplySearchQuery} initialQuery={currentQuery} />
            <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} | Showing {userPuzzles.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, totalCount)} of {totalCount} puzzles
            </div>
            <PuzzleList puzzles={userPuzzles} loading={loading} error={error} collectionIds={collectionIds} completedIds={completedIds} onMarkCompleted={handleMarkCompleted} onMarkIncomplete={handleMarkIncomplete} onRemoveFromCollection={handleRemoveFromCollection} actionLoading={false} />
        </div>
    );
}

export default ProfileCollection;