import { useState } from "react";
import Client from "../api/Client";
import { getErrorMessage } from "../api/errors";
import type { UserPuzzle } from "../types/dto/puzzle.types";

const useUserPuzzles = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userPuzzles, setUserPuzzles] = useState<UserPuzzle[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(20);

    // Fetches all user puzzles with optional search query and pagination. This is the main function for displaying the user's puzzle collection, including custom puzzles.
    const getAllUserPuzzles = async (searchQuery?: string) => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
    
            if (searchQuery) params.append("searchQuery", searchQuery);

            const result = await Client.UserPuzzles.getAll(params);
            setUserPuzzles(result.items);
            setTotalCount(result.totalCount);
            setCurrentPage(result.page);
            setTotalPages(result.totalPages);
            setPageSize(result.pageSize);
            return result.items;

        } catch (err: unknown) {
            setError(getErrorMessage(err, "Error fetching user puzzles"));
            console.error("Error fetching user puzzles:", err);
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Fetches a specific user puzzle by its ID. This is useful for viewing details of a puzzle or editing a custom puzzle.
    const getUserPuzzleById = async (puzzleId: number) => {
        setLoading(true);
        setError(null);

        try {
            const userPuzzle = await Client.UserPuzzles.getById(puzzleId);
            return userPuzzle;
        } catch (err: unknown) {
            setError(getErrorMessage(err, `Error fetching user puzzle with ID ${puzzleId}`));
        } finally {
            setLoading(false);
        }
    };

    // Adds a puzzle to the user's collection. By default, it will be marked as owned and not completed, but this can be overridden with options.
    const addPuzzleToCollection = async (puzzleId: number, options?: { markOwned?: boolean; markCompleted?: boolean }) => {
        setLoading(true);
        setError(null);

        try {
            await Client.UserPuzzles.addToCollection(puzzleId);
            if (options?.markOwned === false) await Client.UserPuzzles.toggleOwned(puzzleId);
            if (options?.markCompleted) await Client.UserPuzzles.markAsCompleted(puzzleId);
        } catch (err: unknown) {
            setError(getErrorMessage(err, `Error adding puzzle with ID ${puzzleId} to collection`));
        } finally {
            setLoading(false);
        }
    };

    // Checks if a puzzle is in the user's collection. This is useful for determining whether to show "Add to Collection" or "Remove from Collection" buttons, among other things.
    const isPuzzleInCollection = async (puzzleId: number) => {
        setLoading(true);
        setError(null);

        try {
            const isInCollection = await Client.UserPuzzles.isInCollection(puzzleId);
            return isInCollection;
        } catch (err: unknown) {
            setError(getErrorMessage(err, `Error checking if puzzle with ID ${puzzleId} is in collection`));
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Marks a puzzle as completed. If the puzzle is not in the collection, it will be added first.
    const markPuzzleAsCompleted = async (puzzleId: number) => {
        setLoading(true);
        setError(null);

        try {
            const inCollection = userPuzzles.some(p => p.puzzleId === puzzleId);
            if (!inCollection) await Client.UserPuzzles.addToCollection(puzzleId);
            await Client.UserPuzzles.markAsCompleted(puzzleId);
            await getAllUserPuzzles();
        } catch (err: unknown) {
            setError(getErrorMessage(err, `Error marking puzzle with ID ${puzzleId} as completed`));
        } finally {
            setLoading(false);
        }
    };

    // Marks a puzzle as incomplete (not completed). The puzzle must be in the collection to be marked as incomplete.
    const markPuzzleAsIncomplete = async (puzzleId: number) => {
        setLoading(true);
        setError(null);

        try {
            await Client.UserPuzzles.markAsIncomplete(puzzleId);
            await getAllUserPuzzles(); // Refresh the list after marking as incomplete
        } catch (err: unknown) {
            setError(getErrorMessage(err, `Error marking puzzle with ID ${puzzleId} as incomplete`));
        } finally {
            setLoading(false);
        }
    };

    // Toggles the owned status of a puzzle. If the puzzle is not in the collection, it will be added first.
    const toggleOwnedStatus = async (puzzleId: number) => {
        setLoading(true);
        setError(null);

        try {
            const inCollection = userPuzzles.some(p => p.puzzleId === puzzleId);
            if (!inCollection) await Client.UserPuzzles.addToCollection(puzzleId);
            await Client.UserPuzzles.toggleOwned(puzzleId);
            await getAllUserPuzzles();
        } catch (err: unknown) {
            setError(getErrorMessage(err, `Error toggling owned status for puzzle with ID ${puzzleId}`));
        } finally {
            setLoading(false);
        }
    };

    // Updates a user puzzle with the given updates
    const updateUserPuzzle = async (puzzleId: number, updates: Partial<UserPuzzle>) => {
        setLoading(true);
        setError(null);

        try {
            await Client.UserPuzzles.update(puzzleId, updates);
            await getAllUserPuzzles(); // Refresh the list after updating
        } catch (err: unknown) {
            setError(getErrorMessage(err, `Error updating user puzzle with ID ${puzzleId}`));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Removes a puzzle from the user's collection. This will also mark the puzzle as incomplete and not owned.
    const removePuzzleFromCollection = async (puzzleId: number) => {
        setLoading(true);
        setError(null);

        try {
            await Client.UserPuzzles.remove(puzzleId);
            await getAllUserPuzzles(); // Refresh the list after removing
        } catch (err: unknown) {
            setError(getErrorMessage(err, `Error removing puzzle with ID ${puzzleId} from collection`));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        // State
        userPuzzles,
        loading,
        error,
        totalCount,
        currentPage,
        totalPages,
        pageSize,
        // Functions
        getAllUserPuzzles,
        getUserPuzzleById,
        isPuzzleInCollection,
        addPuzzleToCollection,
        removePuzzleFromCollection,
        markPuzzleAsCompleted,
        markPuzzleAsIncomplete,
        toggleOwnedStatus,
        updateUserPuzzle
    };
};

export default useUserPuzzles;