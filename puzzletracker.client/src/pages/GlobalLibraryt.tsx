import { useEffect, useState } from "react";
import useBrands from "../hooks/useBrands";
import useIllustrators from "../hooks/useIllustrators";
import usePuzzles from "../hooks/usePuzzles";
import useSeries from "../hooks/useSeries";
import useUser from "../hooks/useUser";
import useUserPuzzles from "../hooks/useUserPuzzles";

// Components
import PuzzleGrid from "../components/PuzzleGrid";
import PuzzleList from "../components/PuzzleList";
import SortFilterBox from "../components/SortFilerBox";
import type { Series } from "../types/dto.types";

const GlobalLibrary = () => {
    const { user } = useUser();
    const { puzzles, loading, error, getAllPuzzles } = usePuzzles();
    const { getAllBrands } = useBrands();
    const { getAllIllustrators } = useIllustrators();
    const { getAllSeries } = useSeries();
    const { addPuzzleToCollection, markPuzzleAsCompleted, loading: actionLoading } = useUserPuzzles();

    const [listOfBrands, setListOfBrands] = useState<string[]>([]);
    const [listOfSeries, setListOfSeries] = useState<Series[]>([]);
    const [listOfIllustrators, setListOfIllustrators] = useState<string[]>([]);

    const [listView, setListView] = useState(false);
    const [showSortFilter, setShowSortFilter] = useState(false);

    useEffect(() => {
        getAllPuzzles();
        getAllSeries().then(fetchedSeries => setListOfSeries(fetchedSeries));
        getAllBrands().then(fetchedBrands => fetchedBrands.flatMap(brand => brand.name)).then(brandNames => setListOfBrands(brandNames));
        getAllIllustrators().then(fetchedIllustrators => fetchedIllustrators.flatMap(illustrator => illustrator.name)).then(illustratorNames => setListOfIllustrators(illustratorNames));
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
        <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Global Puzzle Library</h2>
            <div className="w-full flex gap-3">
                <button
                    className={`py-1 p-2 text-sm rounded shadow ${!listView ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
                    onClick={() => setListView(false)}
                >
                    Grid View
                </button>
                <button
                    className={`py-1 p-2 text-sm rounded shadow ${listView ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
                    onClick={() => setListView(true)}
                >
                    List View
                </button>
                <button
                    className={`py-1 p-2 text-sm rounded shadow ${showSortFilter ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
                    onClick={() => setShowSortFilter(!showSortFilter)}
                >
                    Sort & Filter
                </button>
            </div>
            {showSortFilter && (
                <SortFilterBox listOfSeries={listOfSeries} listOfBrands={listOfBrands} listOfIllustrators={listOfIllustrators} />
            )}
            {listView ? (
                <PuzzleList puzzles={puzzles} loading={loading} error={error} onMarkCompleted={handleMarkCompleted} onUnmarkCompleted={handleAddToCollection} actionLoading={actionLoading} />
            ) : (
                <PuzzleGrid puzzles={puzzles} loading={loading} error={error} onMarkCompleted={handleMarkCompleted} onUnmarkCompleted={handleAddToCollection} actionLoading={actionLoading} />
            )}
        </div>
    );
}

export default GlobalLibrary;