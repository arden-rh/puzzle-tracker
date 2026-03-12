import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Checkbox, Field, Label } from "@headlessui/react";
// Types
import type { UserPuzzle } from "../types/dto/puzzle.types";
// Hooks
import useUserPuzzles from "../hooks/useUserPuzzles";
// Components
import Button from "../components/Button";

const labelClass = "uppercase font-poppins tracking-wider block mb-1 text-indigo-300";
const inputClass = "rounded ring ring-indigo-300 px-2 py-1 w-full bg-transparent text-white";

const UpdateCollectionPuzzle = () => {

    const { id } = useParams<{ id: string }>();
    const puzzleId = id || "";
    const navigate = useNavigate();

    const { getUserPuzzleById, updateUserPuzzle } = useUserPuzzles();

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [puzzle, setPuzzle] = useState<UserPuzzle | undefined>(undefined);

    const [owned, setOwned] = useState(true);
    const [completed, setCompleted] = useState(false);
    const [timesCompleted, setTimesCompleted] = useState(0);
    const [lastCompletedDate, setLastCompletedDate] = useState<string | undefined>(undefined);


    const handleCompletedChange = (value: boolean) => {
        setCompleted(value);
        if (value) {
            setTimesCompleted((prev) => prev + 1);
        } else {
            setTimesCompleted(0);
        }
    };

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
            setPuzzle(fetchedPuzzle);
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
            <h2 className="mb-2">Update Puzzle Information</h2>
            <div className="p-4 rounded bg-indigo-900/50 flex flex-col gap-4">
            <div>
                <h3>{puzzle?.nameEnglish}</h3>
                <p>{puzzle?.brandName}</p>
            </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full">
                    <Field className="flex gap-2 items-center">
                        <Checkbox
                            checked={owned}
                            onChange={setOwned}
                            className="group size-4 rounded border border-indigo-300 flex items-center justify-center data-[checked]:bg-indigo-600 data-[checked]:border-indigo-600 cursor-pointer"
                        >
                            <span className="hidden group-data-[checked]:block text-white text-xs leading-none">✓</span>
                        </Checkbox>
                        <Label className="uppercase font-poppins tracking-wider text-indigo-300 cursor-pointer">Owned</Label>
                    </Field>
                    <Field className="flex gap-2 items-center">
                        <Checkbox
                            checked={completed}
                            onChange={handleCompletedChange}
                            className="group size-4 rounded border border-indigo-300 flex items-center justify-center data-[checked]:bg-indigo-600 data-[checked]:border-indigo-600 cursor-pointer"
                        >
                            <span className="hidden group-data-[checked]:block text-white text-xs leading-none">✓</span>
                        </Checkbox>
                        <Label className="uppercase font-poppins tracking-wider text-indigo-300 cursor-pointer">Completed</Label>
                    </Field>
                    <Field>
                        <Label className={labelClass}>Times Completed</Label>
                        <input type="number" placeholder="0" className={inputClass} value={timesCompleted} onChange={(e) => setTimesCompleted(Number(e.target.value))} />
                    </Field>
                    <Field>
                        <Label className={labelClass}>Last Completed Date</Label>
                        <input type="date" className={inputClass} value={lastCompletedDate ? lastCompletedDate.split("T")[0] : ""} onChange={(e) => setLastCompletedDate(e.target.value)} />
                    </Field>

                    <Button type="submit" theme="primary" className="w-full max-w-[200px] mx-auto lg:py-2 lg:px-4 mt-4">Update information</Button>
                </form>
                {loading && <p className="w-full mt-3">Updating puzzle...</p>}
                {error && <p className="text-red-500 w-full mt-3">{error}</p>}
                {successMessage && <p className="text-green-500 w-full mt-3">{successMessage}</p>}
            </div>
        </div>

    );
}

export default UpdateCollectionPuzzle;