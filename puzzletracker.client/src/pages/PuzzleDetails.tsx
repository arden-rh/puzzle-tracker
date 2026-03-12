import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
// Types
import type { Puzzle, UserPuzzle } from "../types/dto/puzzle.types";
// Hooks
import usePuzzles from "../hooks/usePuzzles";
import useUserPuzzles from "../hooks/useUserPuzzles";
// Components
import Button from "../components/Button";


const PuzzleDetails = () => {
    const { id } = useParams<{ id: string }>();
    const puzzleId = id || "";
    const location = useLocation();

    const isInCollection = location.pathname.startsWith("/profile/collection");
    const navigate = useNavigate();

    const { getPuzzleById } = usePuzzles();
    const { getUserPuzzleById } = useUserPuzzles();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [puzzle, setPuzzle] = useState<Puzzle | UserPuzzle | undefined>(undefined);

    const isUserPuzzle = (puzzle: Puzzle | UserPuzzle): puzzle is UserPuzzle => {
        return (puzzle as UserPuzzle).userPuzzleId !== undefined;
    }

    const fetchPuzzleDetails = async () => {
        setLoading(true);
        setError(null);

        try {
            if (isInCollection) {
                const fetchedPuzzle = await getUserPuzzleById(Number(puzzleId));
                setPuzzle(fetchedPuzzle);
            } else {
                const fetchedPuzzle = await getPuzzleById(Number(puzzleId));
                setPuzzle(fetchedPuzzle);
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || `Error fetching puzzle details for ID ${puzzleId}`;
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPuzzleDetails();
    }, [puzzleId]);

    return (

        <div className="puzzle-details flex flex-col gap-3 w-full max-w-3xl m-auto">
            <h2 className="text-xl font-bold">Puzzle Details</h2>
            <div>
                {loading && <div className="w-full flex items-center justify-center text-center"><span>Loading...</span></div>}
                {error && <p className="text-red-500">{error}</p>}

                {puzzle && (
                    <div className="flex flex-col md:flex-row gap-4">
                        {puzzle.boxImgSrc ? (
                            <img src={puzzle.boxImgSrc} alt={puzzle.nameEnglish} className="rounded-md w-full max-w-[400px]" />
                        ) : (
                            <div className="w-full max-w-[400px] h-[400px] bg-indigo-900/50 rounded-md flex items-center justify-center">
                                <p className="text-indigo-200 uppercase text-sm">No box img</p>
                            </div> 
                        )}
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2 lg:flex-col">
                                <div className="bg-indigo-900/70 p-4 rounded-lg">
                                    <h3>{puzzle.nameEnglish}</h3>
                                    <p>Brand: {puzzle.brandName}</p>
                                    <p>Pieces: {puzzle.numberOfPieces}</p>
                                    <p>Series: {puzzle.seriesName || "N/A"}</p>
                                    <p>Illustrator: {puzzle.illustratorName || "N/A"}</p>
                                    <p>Release Date: {puzzle.releaseDate || "N/A"}</p>
                                    <p>Product Number: {puzzle.productNumber || "N/A"}</p>
                                </div>
                                {isUserPuzzle(puzzle) &&
                                    <div className="bg-indigo-900/70 p-4 rounded-lg">
                                        <h4>Collection details</h4>

                                        <p>Owned: {puzzle.isOwned ? "Yes" : "No"}</p>
                                        <p>Completed: {puzzle.isCompleted ? "Yes" : "No"}</p>
                                        <p>Times completed: {puzzle.timesCompleted}</p>
                                        <p>Last time completed: {puzzle.lastCompletedDate ? new Date(puzzle.lastCompletedDate).toLocaleDateString("sv-SE") : "N/A"}</p>
                                    </div>}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={isInCollection ? () => navigate("/profile/collection") : () => navigate("/puzzles")}
                                    theme="primary"
                                >
                                    Back to {isInCollection ? "My Collection" : "Puzzles"}
                                </Button>
                                {puzzle.puzzleType === "UserCustom" &&
                                    <Button
                                        onClick={() => navigate(`/profile/collection/${puzzle.puzzleId}/edit`)}
                                        theme="primary"
                                    >
                                        Edit Puzzle
                                    </Button>
                                }
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PuzzleDetails;