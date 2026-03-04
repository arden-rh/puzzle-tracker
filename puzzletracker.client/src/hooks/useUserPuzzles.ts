import { useState } from "react";
import Client from "../api/Client";
import type { UserPuzzle } from "../types/dto/puzzle.types";


const useUserPuzzles = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userPuzzles, setUserPuzzles] = useState<UserPuzzle[]>([]);

    const getAllUserPuzzles = async () => {
        setLoading(true);
        setError(null);

        try {
            const fetchedUserPuzzles = await Client.UserPuzzles.getAll();
            setUserPuzzles(fetchedUserPuzzles);
            return fetchedUserPuzzles;
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

    const addPuzzleToCollection = async (puzzleId: number) => {
        setLoading(true);
        setError(null);

        try {
            await Client.UserPuzzles.addToCollection(puzzleId);
            await getAllUserPuzzles(); // Refresh the list after adding
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || `Error adding puzzle with ID ${puzzleId} to collection`;
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



    return {
        // State
        userPuzzles,
        loading,
        error,
        // Functions
        getAllUserPuzzles,
        getUserPuzzleById,
        addPuzzleToCollection,
        markPuzzleAsCompleted,
    };
};

export default useUserPuzzles;