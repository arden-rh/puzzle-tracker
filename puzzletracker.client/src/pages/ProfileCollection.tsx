import { useEffect, useState } from "react";
// Types
import type { UserPuzzle } from "../types/dto/puzzle.types";

// Hooks
import useUserPuzzles from "../hooks/useUserPuzzles";

// Components
import SearchBox from "../components/SearchBox";
import PuzzleGrid from "../components/PuzzleGrid";
import RemoveFromCollectionModal from "../components/RemoveFromCollectionModal";

const ProfileCollection = () => {

    const { getAllUserPuzzles, markPuzzleAsCompleted, markPuzzleAsIncomplete, toggleOwnedStatus, removePuzzleFromCollection, userPuzzles, loading, error, totalCount, currentPage, totalPages, pageSize } = useUserPuzzles();

    const [currentQuery, setCurrentQuery] = useState<string>();

    const handleMarkCompleted = async (puzzleId: number) => {
        await markPuzzleAsCompleted(puzzleId);
        await getAllUserPuzzles();
    };

    const handleMarkIncomplete = async (puzzleId: number) => {
        await markPuzzleAsIncomplete(puzzleId);
        await getAllUserPuzzles();
    };
    
    const handleToggleOwned = async (puzzleId: number) => {
        await toggleOwnedStatus(puzzleId);
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

    const handleResetSearch = async () => {
        setCurrentQuery("");
        await getAllUserPuzzles();
    };

    const collectionIds = new Set(userPuzzles.map(p => p.puzzleId));
    const completedIds = new Set(userPuzzles.filter(p => p.isCompleted).map(p => p.puzzleId));
    const ownedIds = new Set(userPuzzles.filter(p => p.isOwned).map(p => p.puzzleId));
    const [removeModalPuzzle, setRemoveModalPuzzle] = useState<UserPuzzle | null>(null);

    useEffect(() => {
        getAllUserPuzzles()
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
            <h2 className="text-xl font-bold">Personal Collection</h2>
            <SearchBox onSearch={handleApplySearchQuery} initialQuery={currentQuery} onReset={handleResetSearch} />
            <div className="text-sm text-indigo-300">
                Page {currentPage} of {totalPages} | Showing {userPuzzles.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, totalCount)} of {totalCount} puzzles
            </div>
            <PuzzleGrid puzzles={userPuzzles} loading={loading} error={error} collectionIds={collectionIds} completedIds={completedIds} ownedIds={ownedIds} onMarkCompleted={handleMarkCompleted} onMarkIncomplete={handleMarkIncomplete} onToggleOwned={handleToggleOwned} onRemoveFromCollection={handleRemoveFromCollection} actionLoading={false} userLoggedIn={true} isCollection={true} />
        </div>
    );
}

export default ProfileCollection;