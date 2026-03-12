import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
//
import type { UserCustomPuzzle } from "../types/dto/puzzle.types";
//
import useUserPuzzles from "../hooks/useUserPuzzles";
import useBrands from "../hooks/useBrands";
//
import Button from "../components/Button";

const EditCustomPuzzle = () => {

    const { id } = useParams<{ id: string }>();
    const puzzleId = id || "";
    const navigate = useNavigate();

    const { editCustomUserPuzzle, getUserPuzzleById } = useUserPuzzles();
    const { brands, getAllBrands } = useBrands();

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [showMoreFields, setShowMoreFields] = useState(false);

    const [nameEnglish, setNameEnglish] = useState("");
    const [brandName, setBrandName] = useState("");
    const [numberOfPieces, setNumberOfPieces] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [productNumber, setProductNumber] = useState("");
    const [seriesName, setSeriesName] = useState("");
    const [illustratorName, setIllustratorName] = useState("");
    const [nameLocal, setNameLocal] = useState("");
    const [localLanguage, setLocalLanguage] = useState("");

    const validateForm = () => {
        if (!nameEnglish.trim()) {
            setError("Puzzle name is required.");
            return false;
        }

        if (!numberOfPieces.trim() || isNaN(Number(numberOfPieces)) || Number(numberOfPieces) <= 0) {
            setError("Please enter a valid number of pieces.");
            return false;
        }
        if (imageUrl.trim() && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(imageUrl.trim())) {
            setError("Please enter a valid image URL.");
            return false;
        }
        setError(null);
        return true;
    }


    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();

        const isValid = validateForm();

        if (!isValid) return;

        const updatedPuzzle: UserCustomPuzzle = {
            nameEnglish,
            brandName: brandName.trim() || "Unknown Brand",
            numberOfPieces: numberOfPieces.trim(),
            isPublic,
            boxImgSrc: imageUrl.trim() || undefined,
            productNumber: productNumber.trim() || undefined,
            seriesName: seriesName.trim() || undefined,
            illustratorName: illustratorName.trim() || "Unknown",
            nameLocal: nameLocal.trim() || undefined,
            localLanguage: localLanguage.trim() || undefined
        };

        setLoading(true);

        editCustomUserPuzzle(Number(puzzleId), updatedPuzzle)
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
            setNameEnglish(fetchedPuzzle.nameEnglish);
            setBrandName(fetchedPuzzle.brandName);
            setNumberOfPieces(fetchedPuzzle.numberOfPieces);
            setIsPublic(fetchedPuzzle.isPublic);
            if (fetchedPuzzle.boxImgSrc) setImageUrl(fetchedPuzzle.boxImgSrc);
            if (fetchedPuzzle.productNumber) setProductNumber(fetchedPuzzle.productNumber);
            if (fetchedPuzzle.seriesName) setSeriesName(fetchedPuzzle.seriesName);
            if (fetchedPuzzle.illustratorName) setIllustratorName(fetchedPuzzle.illustratorName);
            if (fetchedPuzzle.nameLocal) setNameLocal(fetchedPuzzle.nameLocal);
            if (fetchedPuzzle.localLanguage) setLocalLanguage(fetchedPuzzle.localLanguage);
        } catch (error) {
            setError("Failed to fetch puzzle details. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPuzzle();
        getAllBrands();
    }, [puzzleId]);


    return (

        <div className="w-full max-w-[600px] flex flex-col">
            <h2 className="mb-2">Edit Custom Puzzle</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full">
                <div>
                    <label htmlFor="nameEnglish" className="uppercase font-poppins tracking-wider block mb-1 text-indigo-300">Puzzle Name</label>
                    <input type="text" name="nameEnglish" id="nameEnglish" placeholder="My Custom Puzzle" className="rounded ring ring-indigo-300 px-2 py-1 w-full" value={nameEnglish} onChange={(e) => setNameEnglish(e.target.value)} />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="brandName" className="uppercase font-poppins tracking-wider block text-indigo-300">Brand</label>
                    {brands && brands.length > 0 &&
                        <div className="flex flex-col gap-1 mb-1">
                            <span className="uppercase text-sm font-poppins tracking-wider text-indigo-400">Pick an excisting brand</span>
                            <select name="brandName" id="brandName" className="rounded ring ring-indigo-300 px-2 py-1 w-full" value={brandName} onChange={(e) => setBrandName(e.target.value)}>
                                <option value="">Select a brand</option>
                                {brands.map((brand) => (
                                    <option key={brand.id} value={brand.name}>{brand.name}</option>
                                ))}
                            </select>
                            <span className="uppercase text-sm font-poppins tracking-wider text-indigo-400">or enter your own</span>
                        </div>
                    }
                    
                    <input type="text" name="brandName" id="brandName" placeholder="Brand Name" className="rounded ring ring-indigo-300 px-2 py-1 w-full" value={brandName} onChange={(e) => setBrandName(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="numberOfPieces" className="uppercase font-poppins tracking-wider block mb-1 text-indigo-300">Number of Pieces</label>
                    <input type="number" name="numberOfPieces" id="numberOfPieces" placeholder="500" className="rounded ring ring-indigo-300 px-2 py-1 w-full" value={numberOfPieces} onChange={(e) => setNumberOfPieces(e.target.value)} />
                </div>
                <div className="flex gap-2 mt-2">
                    <label htmlFor="isPublic" className="uppercase font-poppins tracking-wider text-indigo-300">Make Public</label>
                    <input type="checkbox" name="isPublic" id="isPublic" className="mb-0.5" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                </div>
                <Button type="button" theme="secondary" onClick={() => setShowMoreFields(!showMoreFields)} className="w-full max-w-[200px] mx-auto lg:py-2 lg:px-4">Show more information</Button>

                {showMoreFields &&
                    <div className="flex flex-col gap-2 mb-4">
                        <div>
                            <label htmlFor="productNumber" className="uppercase font-poppins tracking-wider block mb-1 text-indigo-300">Product Number</label>
                            <input type="text" name="productNumber" id="productNumber" placeholder="12345" className="rounded ring ring-indigo-300 px-2 py-1 w-full" value={productNumber} onChange={(e) => setProductNumber(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="seriesName" className="uppercase font-poppins tracking-wider block mb-1 text-indigo-300">Series Name</label>
                            <input type="text" name="seriesName" id="seriesName" placeholder="Beautiful Scenery Series" className="rounded ring ring-indigo-300 px-2 py-1 w-full" value={seriesName} onChange={(e) => setSeriesName(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="illustratorName" className="uppercase font-poppins tracking-wider block mb-1 text-indigo-300">Illustrator Name</label>
                            <input type="text" name="illustratorName" id="illustratorName" placeholder="John Doe" className="rounded ring ring-indigo-300 px-2 py-1 w-full" value={illustratorName} onChange={(e) => setIllustratorName(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="nameLocal" className="uppercase font-poppins tracking-wider block mb-1 text-indigo-300">Local Name</label>
                            <input type="text" name="nameLocal" id="nameLocal" placeholder="Mitt Pussel" className="rounded ring ring-indigo-300 px-2 py-1 w-full" value={nameLocal} onChange={(e) => setNameLocal(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="localLanguage" className="uppercase font-poppins tracking-wider block mb-1 text-indigo-300">Local Language</label>
                            <input type="text" name="localLanguage" id="localLanguage" placeholder="Swedish" className="rounded ring ring-indigo-300 px-2 py-1 w-full" value={localLanguage} onChange={(e) => setLocalLanguage(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="boxImgSrc" className="uppercase font-poppins tracking-wider block mb-1 text-indigo-300">Box Image Url</label>
                            <input type="text" name="boxImgSrc" id="boxImgSrc" placeholder="https://example.com/puzzle.jpg" className="rounded ring ring-indigo-300 px-2 py-1 w-full" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                        </div>
                    </div>
                }

                <Button type="submit" theme="primary" className="w-full max-w-[200px] mx-auto lg:py-2 lg:px-4">Edit Puzzle</Button>
            </form>
            {loading && <p className="w-full mt-3">Editing puzzle...</p>}
            {error && <p className="text-red-500 w-full mt-3">{error}</p>}
            {successMessage && <p className="text-green-500 w-full mt-3">{successMessage}</p>}
        </div>

    );
}

export default EditCustomPuzzle;