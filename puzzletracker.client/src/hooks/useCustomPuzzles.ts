import { useState } from "react";
import type { UserCustomPuzzle, UserPuzzle } from "../types/dto/puzzle.types";

import Client from "../api/Client";
import useUserPuzzles from "./useUserPuzzles";

const useCustomPuzzles = () => {
    const { getAllUserPuzzles } = useUserPuzzles();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [customPuzzles, setCustomPuzzles] = useState<UserPuzzle[]>([]);

    // Get all custom puzzles created by the user
    const getAllCustomPuzzles = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await Client.CustomPuzzles.getAll();
            setCustomPuzzles(result);
            return result;
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || `Error fetching custom puzzles`;
            setError(errorMsg);
            setLoading(false);
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Creates a new custom puzzle
    const createCustomPuzzle = async (puzzle: UserCustomPuzzle) => {
        setLoading(true);
        setError(null);

        try {
            await Client.CustomPuzzles.createCustom(puzzle);
            await getAllUserPuzzles(); 
            await getAllCustomPuzzles(); 
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || `Error creating custom puzzle`;
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Updates an existing custom puzzle
    const editCustomPuzzle = async (puzzleId: number, puzzle: UserCustomPuzzle) => {
        setLoading(true);
        setError(null);

        try {
            await Client.CustomPuzzles.editCustom(puzzleId, puzzle);
            await getAllUserPuzzles(); 
            await getAllCustomPuzzles(); 
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || `Error editing custom puzzle`;
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Deletes a custom puzzle by its ID
    const deleteCustomPuzzle = async (puzzleId: number) => {
        setLoading(true);
        setError(null);

        try {
            await Client.CustomPuzzles.deleteCustom(puzzleId);
            await getAllUserPuzzles();
            await getAllCustomPuzzles(); 
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || `Error deleting custom puzzle`;
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        // State
        customPuzzles,
        loading,
        error,
        // Actions
        getAllCustomPuzzles,
        createCustomPuzzle,
        editCustomPuzzle,
        deleteCustomPuzzle,
    };
}

export default useCustomPuzzles;