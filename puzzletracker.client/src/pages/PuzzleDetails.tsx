import { useEffect, useState } from "react";
import usePuzzles from "../hooks/usePuzzles";
import type { Puzzle } from "../types/dto/puzzle.types";
import { useParams } from "react-router";


const PuzzleDetails = () => {
    const { id } = useParams<{ id: string }>();
    const puzzleId = id || "";
    
    const { getPuzzleById } = usePuzzles();
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [puzzle, setPuzzle] = useState<Puzzle | null>(null);

    const fetchPuzzleDetails = async () => {
        setLoading(true);
        setError(null);

        try {
            const fetchedPuzzle = await getPuzzleById(Number(puzzleId));
            setPuzzle(fetchedPuzzle);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || `Error fetching puzzle details for ID ${puzzleId}`;
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };
    

    useEffect(() => {
        console.log("Fetching details for puzzle ID:", puzzleId);
        fetchPuzzleDetails();
    }, [puzzleId]);

    return (

        <div className="puzzle-details">
            <h2>Puzzle Details</h2>
            <div>
                {loading && <p>Loading...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {puzzle && (
                    <div>
                        <h3>{puzzle.nameEnglish}</h3>
                        <p>Brand: {puzzle.brandName}</p>
                        <p>Pieces: {puzzle.numberOfPieces}</p>
                        <p>Series: {puzzle.seriesName || "N/A"}</p>
                        <p>Illustrator: {puzzle.illustratorName || "N/A"}</p>
                        <p>Release Date: {puzzle.releaseDate || "N/A"}</p>
                        <p>Product Number: {puzzle.productNumber || "N/A"}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PuzzleDetails;