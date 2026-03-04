import { useState } from "react";
import Client from "../api/Client";
import type { Puzzle, PuzzleFilters } from "../types/dto/puzzle.types";

const usePuzzles = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
    const [selectedPuzzle, setSelectedPuzzle] = useState<Puzzle | null>(null);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(20);

    const getAllPuzzles = async (filters?: PuzzleFilters) => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();

            if (filters) {
                if (filters.sortBy) params.append('sortBy', filters.sortBy);
                if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
                if (filters.puzzleType) params.append('puzzleType', filters.puzzleType);
                if (filters.brand) params.append('brand', filters.brand);
                if (filters.series && filters.series.length > 0) params.append('series', filters.series.join(','));
                if (filters.illustrator && filters.illustrator.length > 0) params.append('illustrator', filters.illustrator.join(','));
                if (filters.pieceRanges && filters.pieceRanges.length > 0) params.append('pieceRanges', filters.pieceRanges.join(','));
                if (filters.inCollection !== undefined) params.append('inCollection', String(filters.inCollection));
                if (filters.isCompleted !== undefined) params.append('isCompleted', String(filters.isCompleted));
                if (filters.page) params.append('page', String(filters.page));
                if (filters.pageSize) params.append('pageSize', String(filters.pageSize));
            }

            const result = await Client.Puzzles.getAll(params.toString() ? params : undefined);
            setPuzzles(result.items);
            setTotalCount(result.totalCount);
            setCurrentPage(result.page);
            setTotalPages(result.totalPages);
            setPageSize(result.pageSize);
            return result.items;
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
        totalCount,
        currentPage,
        totalPages,
        pageSize,
        // Functions
        getAllPuzzles,
        getPuzzleById,
        clearSelectedPuzzle,
    };
};

export default usePuzzles;