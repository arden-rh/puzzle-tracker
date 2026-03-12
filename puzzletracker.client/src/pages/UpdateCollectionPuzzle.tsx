import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
//
import type { UserPuzzle } from "../types/dto/puzzle.types";
//
import useUserPuzzles from "../hooks/useUserPuzzles";
//
import Button from "../components/Button";

const UpdateCollectionPuzzle = () => {

    const { id } = useParams<{ id: string }>();
    const puzzleId = id || "";
    const navigate = useNavigate();

    const { getUserPuzzleById, updateUserPuzzle } = useUserPuzzles();

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [owned, setOwned] = useState(true);
    const [completed, setCompleted] = useState(false);
    const [timesCompleted, setTimesCompleted] = useState(0);
    const [lastCompletedDate, setLastCompletedDate] = useState<string | undefined>(undefined);


    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();

        const updatedPuzzle: Partial<UserPuzzle> = {
            isOwned: owned,
            isCompleted: completed,
            timesCompleted,
            lastCompletedDate,
        };

        setLoading(true);

        updateUserPuzzle(Number(puzzleId), updatedPuzzle)
            .then(() => {
                setSuccessMessage("Puzzle updated successfully!");
                setLoading(false);
                setTimeout(() => {
                    navigate("/profile/collection");
                }, 3000);
            })
            .catch((error) => {
                setError("Failed to update puzzle. Please try again.");
                setLoading(false);
            });
    }

    const fetchPuzzle = async () => {
        setLoading(true);
        setError(null);

        try {
            const fetchedPuzzle = await getUserPuzzleById(Number(puzzleId));
            if (!fetchedPuzzle) {
                setError("Puzzle not found.");
                return;
            }
            // Pre-fill form fields with existing puzzle data
            setOwned(fetchedPuzzle.isOwned);
            setCompleted(fetchedPuzzle.isCompleted);
            if (fetchedPuzzle.timesCompleted) setTimesCompleted(fetchedPuzzle.timesCompleted);
            if (fetchedPuzzle.lastCompletedDate) setLastCompletedDate(fetchedPuzzle.lastCompletedDate);
        } catch (error) {
            setError("Failed to fetch puzzle details. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPuzzle();
    }, [puzzleId]);


    return (

        <div className="w-full max-w-[600px] flex flex-col">
            <h2 className="mb-2">Update Puzzle</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full">
                <div>
                    <label htmlFor="isOwned" className="uppercase font-poppins tracking-wider block mb-1 text-indigo-300">Owned</label>
                    <input type="radio" name="isOwned" id="isOwned" className="mb-0.5" value="true" checked={owned} onChange={(e) => setOwned(true)} />
                    <input type="radio" name="isOwned" id="isNotOwned" className="mb-0.5" value="false" checked={!owned} onChange={(e) => setOwned(false)} />
                </div>
                <div>
                    <label htmlFor="isCompleted" className="uppercase font-poppins tracking-wider block mb-1 text-indigo-300">Completed</label>
                    <input type="radio" name="isCompleted" id="isCompleted" className="mb-0.5" value="true" checked={completed} onChange={(e) => setCompleted(true)} />
                    <input type="radio" name="isCompleted" id="isNotCompleted" className="mb-0.5" value="false" checked={!completed} onChange={(e) => setCompleted(false)} />
                </div>
                <div>
                    <label htmlFor="timesCompleted" className="uppercase font-poppins tracking-wider block mb-1 text-indigo-300">Times Completed</label>
                    <input type="number" name="timesCompleted" id="timesCompleted" placeholder="0" className="rounded ring ring-indigo-300 px-2 py-1 w-full" value={timesCompleted} onChange={(e) => setTimesCompleted(Number(e.target.value))} />
                </div>
                <div>
                    <label htmlFor="lastCompletedDate" className="uppercase font-poppins tracking-wider block mb-1 text-indigo-300">Last Completed Date</label>
                    <input type="date" name="lastCompletedDate" id="lastCompletedDate" className="rounded ring ring-indigo-300 px-2 py-1 w-full" value={lastCompletedDate ? lastCompletedDate.split("T")[0] : ""} onChange={(e) => setLastCompletedDate(e.target.value)} />
                </div>

                <Button type="submit" theme="primary" className="w-full max-w-[200px] mx-auto lg:py-2 lg:px-4">Edit Puzzle</Button>
            </form>
            {loading && <p className="w-full mt-3">Updating puzzle...</p>}
            {error && <p className="text-red-500 w-full mt-3">{error}</p>}
            {successMessage && <p className="text-green-500 w-full mt-3">{successMessage}</p>}
        </div>

    );
}

export default UpdateCollectionPuzzle;