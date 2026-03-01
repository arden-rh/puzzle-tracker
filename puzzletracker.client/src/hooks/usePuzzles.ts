import { useState } from "react";
import Client from "../api/Client";
import type { PuzzleDto as PuzzleDtoFromApi } from "../types/dto.types";

const usePuzzles = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [puzzles, setPuzzles] = useState<PuzzleDtoFromApi[]>([]);
    const [selectedPuzzle, setSelectedPuzzle] = useState<PuzzleDtoFromApi | null>(null);

    const getAllPuzzles = async () => {
        setLoading(true);
        setError(null);

        try {
            const fetchedPuzzles = await Client.Puzzles.getAll();
            setPuzzles(fetchedPuzzles);
            return fetchedPuzzles;
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || "Error fetching puzzles";
            setError(errorMsg);
            console.error("Error fetching puzzles:", err);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const getPuzzleById = async (puzzleId: number) => {
        setLoading(true);
        setError(null);

        try {
            const puzzle = await Client.Puzzles.getById(puzzleId);
            setSelectedPuzzle(puzzle);
            return puzzle;
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || `Error fetching puzzle with ID ${puzzleId}`;
            setError(errorMsg);
            console.error(`Error fetching puzzle with ID ${puzzleId}:`, err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const clearSelectedPuzzle = () => {
        setSelectedPuzzle(null);
    };

    return {
        // State
        puzzles,
        selectedPuzzle,
        loading,
        error,
        // Functions
        getAllPuzzles,
        getPuzzleById,
        clearSelectedPuzzle,
    };
};

export default usePuzzles;