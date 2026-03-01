import { useEffect } from "react";
import usePuzzles from "../hooks/usePuzzles";
import useUserPuzzles from "../hooks/useUserPuzzles";
import useUser from "../hooks/useUser";

const GlobalLibrary = () => {
    const { user } = useUser();
    const { puzzles, loading, error, getAllPuzzles } = usePuzzles();
    const { addPuzzleToCollection, markPuzzleAsCompleted, loading: actionLoading } = useUserPuzzles();

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
        <div style={{ padding: '20px' }}>
            <h1>Global Puzzle Library</h1>
            <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {puzzles.map((puzzle) => (
                    <div
                        key={puzzle.id}
                        style={{
                            border: '1px solid #ccc',
                            padding: '15px',
                            borderRadius: '8px',
                            backgroundColor: puzzle.isInUserCollection ? 'blue' : 'grey'
                        }}
                    >
                        <h3>{puzzle.nameEnglish}</h3>
                        <p><strong>Pieces:</strong> {puzzle.numberOfPieces}</p>
                        <p><strong>Brand:</strong> {puzzle.brandName}</p>
                        {puzzle.seriesName && <p><strong>Series:</strong> {puzzle.seriesName}</p>}

                        {user && (
                            <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexDirection: 'column' }}>
                                {puzzle.isInUserCollection && <span style={{ color: 'green', fontWeight: 'bold' }}>✓ In Your Collection</span>}

                                <button
                                    onClick={() => handleMarkCompleted(puzzle.id)}
                                    disabled={actionLoading}
                                    style={{
                                        padding: '8px',
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: actionLoading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {actionLoading ? 'Processing...' : 'Mark as Completed'}
                                </button>

                                <button
                                    onClick={() => handleAddToCollection(puzzle.id)}
                                    disabled={actionLoading}
                                    style={{
                                        padding: '8px',
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: actionLoading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {actionLoading ? 'Adding...' : 'Add to Collection'}
                                </button>

                            </div>
                        )}

                        {!user && (
                            <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
                                <a href="/login">Login</a> to add to your collection
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default GlobalLibrary;