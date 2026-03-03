import { useEffect, useState } from "react";
import usePuzzles from "../hooks/usePuzzles";
import useUserPuzzles from "../hooks/useUserPuzzles";
import useUser from "../hooks/useUser";

// Components
import PuzzleGrid from "../components/PuzzleGrid";
import PuzzleList from "../components/PuzzleList";

const GlobalLibrary = () => {
    const { user } = useUser();
    const { puzzles, loading, error, getAllPuzzles } = usePuzzles();
    const { addPuzzleToCollection, markPuzzleAsCompleted, loading: actionLoading } = useUserPuzzles();

    const [listView, setListView] = useState(false);

    useEffect(() => {
        getAllPuzzles();
    }, []);

    const handleAddToCollection = async (puzzleId: number) => {
        await addPuzzleToCollection(puzzleId);
        // Refresh the global puzzles list to show updated status
        await getAllPuzzles();
    };

    const handleMarkCompleted = async (puzzleId: number) => {
        await markPuzzleAsCompleted(puzzleId);
        // Refresh the global puzzles list to show updated status
        await getAllPuzzles();
    };

    if (loading) return <div>Loading puzzles...</div>;
    if (error) return <div>Error loading puzzles: {error}</div>;

    return (
        <div className="">
            <h2>Global Puzzle Library</h2>
            <div>
                <button
                    className={`px-4 py-2 rounded ${!listView ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
                    onClick={() => setListView(false)}
                >
                    Grid View
                </button>
                <button
                    className={`px-4 py-2 rounded ${listView ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
                    onClick={() => setListView(true)}
                >
                    List View
                </button>
            </div>
            {listView ? (
                <PuzzleList puzzles={puzzles} loading={loading} error={error} onMarkCompleted={handleMarkCompleted} onUnmarkCompleted={handleAddToCollection} actionLoading={actionLoading} />
            ) : (
                <PuzzleGrid puzzles={puzzles} loading={loading} error={error} onMarkCompleted={handleMarkCompleted} onUnmarkCompleted={handleAddToCollection} actionLoading={actionLoading} />
            )}
        </div>
    );
}

export default GlobalLibrary;