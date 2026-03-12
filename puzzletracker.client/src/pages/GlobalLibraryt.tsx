import { useEffect, useState } from "react";

// Types
import type { Puzzle, PuzzleFilters } from "../types/dto/puzzle.types";
import type { Series } from "../types/dto/series.types";

// Hooks
import useBrands from "../hooks/useBrands";
import useIllustrators from "../hooks/useIllustrators";
import usePuzzles from "../hooks/usePuzzles";
import useSeries from "../hooks/useSeries";
import useUserPuzzles from "../hooks/useUserPuzzles";
import useUser from "../hooks/useUser";

// Components
import AddToCollectionModal from "../components/modals/AddToCollectionModal";
import RemoveFromCollectionModal from "../components/modals/RemoveFromCollectionModal";
import Pagination from "../components/Pagination";
import PuzzleGrid from "../components/PuzzleGrid";
import PuzzleList from "../components/PuzzleList";
import SearchBox from "../components/SearchBox";
import SortFilterBox from "../components/SortFilterBox";
import Button from "../components/Button";


const GlobalLibrary = () => {
    const { puzzles, loading, error, getAllPuzzles, totalCount, currentPage, totalPages, pageSize } = usePuzzles();
    const { getAllBrands } = useBrands();
    const { getAllIllustrators } = useIllustrators();
    const { getAllSeries } = useSeries();
    const { addPuzzleToCollection, removePuzzleFromCollection, markPuzzleAsCompleted, markPuzzleAsIncomplete, toggleOwnedStatus, getAllUserPuzzles, userPuzzles, loading: actionLoading } = useUserPuzzles();
    const { user } = useUser();

    const collectionIds = new Set(userPuzzles.map(p => p.puzzleId));
    const completedIds = new Set(userPuzzles.filter(p => p.isCompleted).map(p => p.puzzleId));
    const ownedIds = new Set(userPuzzles.filter(p => p.isOwned).map(p => p.puzzleId));

    const [listOfBrands, setListOfBrands] = useState<string[]>([]);
    const [listOfSeries, setListOfSeries] = useState<Series[]>([]);
    const [listOfIllustrators, setListOfIllustrators] = useState<string[]>([]);
    const [currentFilters, setCurrentFilters] = useState<PuzzleFilters>({});

    const [listView, setListView] = useState(false);
    const [showSortFilter, setShowSortFilter] = useState(false);
    const [addModalPuzzle, setAddModalPuzzle] = useState<Puzzle | null>(null);
    const [removeModalPuzzle, setRemoveModalPuzzle] = useState<Puzzle | null>(null);

    useEffect(() => {
        getAllPuzzles();
        getAllUserPuzzles();
        getAllSeries().then(fetchedSeries => setListOfSeries(fetchedSeries));
        getAllBrands().then(fetchedBrands => fetchedBrands.flatMap(brand => brand.name)).then(brandNames => setListOfBrands(brandNames));
        getAllIllustrators().then(fetchedIllustrators => fetchedIllustrators.flatMap(illustrator => illustrator.name)).then(illustratorNames => setListOfIllustrators(illustratorNames));
    }, []);

    const handleApplyFilters = async (filters: PuzzleFilters, isReset?: boolean) => {
        setCurrentFilters({ ...filters, page: 1 }); // Reset to page 1 when filters change
        if (!isReset) setShowSortFilter(false);
        await getAllPuzzles({ ...filters, page: 1 });
    };

    const handleResetSearch = async () => {
        setCurrentFilters({});
        await getAllPuzzles({});
    };

    const handlePageChange = async (page: number) => {
        const updatedFilters = { ...currentFilters, page };
        setCurrentFilters(updatedFilters);
        await getAllPuzzles(updatedFilters);
    };

    const handleAddToCollection = (puzzleId: number) => {
        const puzzle = puzzles.find(p => p.puzzleId === puzzleId);
        if (puzzle) setAddModalPuzzle(puzzle);
    };

    const handleConfirmAdd = async (markOwned: boolean, markCompleted: boolean) => {
        if (!addModalPuzzle) return;
        await addPuzzleToCollection(addModalPuzzle.puzzleId, { markOwned, markCompleted });
        await Promise.all([getAllPuzzles(currentFilters), getAllUserPuzzles()]);
        setAddModalPuzzle(null);
    };

    const handleRemoveFromCollection = (puzzleId: number) => {
        const puzzle = puzzles.find(p => p.puzzleId === puzzleId);
        if (puzzle) setRemoveModalPuzzle(puzzle);
    };

    const handleConfirmRemove = async () => {
        if (!removeModalPuzzle) return;
        await removePuzzleFromCollection(removeModalPuzzle.puzzleId);
        await getAllPuzzles(currentFilters);
        setRemoveModalPuzzle(null);
    };

    const handleMarkCompleted = async (puzzleId: number) => {
        await markPuzzleAsCompleted(puzzleId);
    };

    const handleMarkIncomplete = async (puzzleId: number) => {
        await markPuzzleAsIncomplete(puzzleId);
    };

    const handleToggleOwned = async (puzzleId: number) => {
        await toggleOwnedStatus(puzzleId);
    };

    const userLoggedIn = !!user;

    return (
        <div className="flex flex-col gap-4 w-full">
            {addModalPuzzle && (
                <AddToCollectionModal
                    puzzle={addModalPuzzle}
                    onConfirm={handleConfirmAdd}
                    onCancel={() => setAddModalPuzzle(null)}
                    loading={actionLoading}
                />
            )}
            {removeModalPuzzle && (
                <RemoveFromCollectionModal
                    puzzle={removeModalPuzzle}
                    onConfirm={handleConfirmRemove}
                    onCancel={() => setRemoveModalPuzzle(null)}
                    loading={actionLoading}
                />
            )}            
            <h2 className="text-2xl font-bold">Global Puzzle Library</h2>
            <div className="w-full flex gap-3">
                <Button
                    onClick={() => setListView(false)}
                    theme={listView ? "secondary" : "primary"}
                >
                    Grid View
                </Button>
                <Button
                    onClick={() => setListView(true)}
                    theme={listView ? "primary" : "secondary"}
                >
                    List View
                </Button>
                <Button
                    theme={showSortFilter ? "primary" : "secondary"}
                    onClick={() => setShowSortFilter(!showSortFilter)}
                >
                    Sort & Filter
                </Button>
            </div>
            <SearchBox onSearch={(query) => handleApplyFilters({ ...currentFilters, searchQuery: query })} onReset={handleResetSearch} />
            <div className={showSortFilter ? "" : "hidden"}>
                <SortFilterBox 
                    listOfSeries={listOfSeries} 
                    listOfBrands={listOfBrands} 
                    listOfIllustrators={listOfIllustrators}
                    onApplyFilters={handleApplyFilters}
                />
            </div>

            <div className="text-sm text-indigo-300">
                Page {currentPage} of {totalPages} | Showing {puzzles.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, totalCount)} of {totalCount} puzzles
            </div>

            {listView ? (
                <PuzzleList puzzles={puzzles} loading={loading} error={error} collectionIds={collectionIds} completedIds={completedIds} ownedIds={ownedIds} onMarkCompleted={handleMarkCompleted} onMarkIncomplete={handleMarkIncomplete} onToggleOwned={handleToggleOwned} onAddToCollection={handleAddToCollection} onRemoveFromCollection={handleRemoveFromCollection} actionLoading={actionLoading} userLoggedIn={userLoggedIn} />
            ) : (
                <PuzzleGrid puzzles={puzzles} loading={loading} error={error} collectionIds={collectionIds} completedIds={completedIds} ownedIds={ownedIds} onMarkCompleted={handleMarkCompleted} onMarkIncomplete={handleMarkIncomplete} onToggleOwned={handleToggleOwned} onAddToCollection={handleAddToCollection} onRemoveFromCollection={handleRemoveFromCollection} actionLoading={actionLoading} userLoggedIn={userLoggedIn} />
            )}

            <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
            />
        </div>
    );
}

export default GlobalLibrary;