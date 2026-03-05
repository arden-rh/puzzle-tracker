import { useState } from "react";
import Client from "../api/Client";
import type { UserPuzzle } from "../types/dto/puzzle.types";


const useUserPuzzles = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userPuzzles, setUserPuzzles] = useState<UserPuzzle[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(20);


    const getAllUserPuzzles = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await Client.UserPuzzles.getAll();
            console.log("API response for user puzzles:", result);
            setUserPuzzles(result.items);
            console.log("Fetched user puzzles in hook:", result.items);
            setTotalCount(result.totalCount);
            setCurrentPage(result.page);
            setTotalPages(result.totalPages);
            setPageSize(result.pageSize);
            return result.items;

        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || "Error fetching user puzzles";
            setError(errorMsg);
            console.error("Error fetching user puzzles:", err);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const getUserPuzzleById = async (puzzleId: number) => {
        setLoading(true);
        setError(null);

        try {
            const userPuzzle = await Client.UserPuzzles.getById(puzzleId);
            return userPuzzle;
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || `Error fetching user puzzle with ID ${puzzleId}`;
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const isPuzzleInCollection = async (puzzleId: number) => {
        setLoading(true);
        setError(null);

        try {
            const isInCollection = await Client.UserPuzzles.isInCollection(puzzleId);
            return isInCollection;
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || `Error checking if puzzle with ID ${puzzleId} is in collection`;
            setError(errorMsg);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const addPuzzleToCollection = async (puzzleId: number, options?: { markOwned?: boolean; markCompleted?: boolean }) => {
        setLoading(true);
        setError(null);

        try {
            await Client.UserPuzzles.addToCollection(puzzleId);
            if (options?.markOwned) await Client.UserPuzzles.toggleOwned(puzzleId);
            if (options?.markCompleted) await Client.UserPuzzles.markAsCompleted(puzzleId);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || `Error adding puzzle with ID ${puzzleId} to collection`;
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const removePuzzleFromCollection = async (puzzleId: number) => {
        setLoading(true);
        setError(null);

        try {
            await Client.UserPuzzles.delete(puzzleId);
            await getAllUserPuzzles(); // Refresh the list after removing
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || `Error removing puzzle with ID ${puzzleId} from collection`;
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const markPuzzleAsCompleted = async (puzzleId: number) => {
        setLoading(true);
        setError(null);

        try {
            await Client.UserPuzzles.markAsCompleted(puzzleId);
            await getAllUserPuzzles(); // Refresh the list after marking as completed

        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || `Error marking puzzle with ID ${puzzleId} as completed`;
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const markPuzzleAsIncomplete = async (puzzleId: number) => {
        setLoading(true);
        setError(null);

        try {
            await Client.UserPuzzles.markAsIncomplete(puzzleId);
            await getAllUserPuzzles(); // Refresh the list after marking as incomplete
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || `Error marking puzzle with ID ${puzzleId} as incomplete`;
            setError(errorMsg);
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
        markPuzzleAsIncomplete
    };
};

export default useUserPuzzles;