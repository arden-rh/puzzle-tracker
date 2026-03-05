import { useState } from "react";

import type { UserCustomPuzzle } from "../types/dto/puzzle.types";

import useUserPuzzles from "../hooks/useUserPuzzles";

const AddCustomPuzzle = () => {

    const { createCustomUserPuzzle } = useUserPuzzles();

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

        const newPuzzle: UserCustomPuzzle = {
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

        createCustomUserPuzzle(newPuzzle)
            .then(() => {
                setSuccessMessage("Puzzle added successfully!");
                setLoading(false);
            })
            .catch((error) => {
                setError("Failed to add puzzle. Please try again.");
                setLoading(false);
            });
    }


    return (

        <div className="">
            <h2>Add Custom Puzzle</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <div>
                    <label htmlFor="nameEnglish" className="">Puzzle Name</label>
                    <input type="text" name="nameEnglish" id="nameEnglish" placeholder="My Custom Puzzle" className="ml-2" value={nameEnglish} onChange={(e) => setNameEnglish(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="brandName" className="">Brand</label>
                    <input type="text" name="brandName" id="brandName" placeholder="Brand Name" className="ml-2" value={brandName} onChange={(e) => setBrandName(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="numberOfPieces" className="">Number of Pieces</label>
                    <input type="number" name="numberOfPieces" id="numberOfPieces" placeholder="500" className="ml-2" value={numberOfPieces} onChange={(e) => setNumberOfPieces(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="isPublic" className="">Make Public</label>
                    <input type="checkbox" name="isPublic" id="isPublic" className="ml-2" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                </div>
                <button type="button" className="" onClick={() => setShowMoreFields(!showMoreFields)}>Add more information</button>
                
                {showMoreFields &&
                    <div className="flex flex-col gap-2">
                        <div>
                            <label htmlFor="productNumber" className="">Product Number</label>
                            <input type="text" name="productNumber" id="productNumber" placeholder="12345" className="ml-2" value={productNumber} onChange={(e) => setProductNumber(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="seriesName" className="">Series Name</label>
                            <input type="text" name="seriesName" id="seriesName" placeholder="Beautiful Scenery Series" className="ml-2" value={seriesName} onChange={(e) => setSeriesName(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="illustratorName" className="">Illustrator Name</label>
                            <input type="text" name="illustratorName" id="illustratorName" placeholder="John Doe" className="ml-2" value={illustratorName} onChange={(e) => setIllustratorName(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="nameLocal" className="">Local Name</label>
                            <input type="text" name="nameLocal" id="nameLocal" placeholder="Mitt Pussel" className="ml-2" value={nameLocal} onChange={(e) => setNameLocal(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="localLanguage" className="">Local Language</label>
                            <input type="text" name="localLanguage" id="localLanguage" placeholder="Swedish" className="ml-2" value={localLanguage} onChange={(e) => setLocalLanguage(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="boxImgSrc" className="">Box Image Url</label>
                            <input type="text" name="boxImgSrc" id="boxImgSrc" placeholder="https://example.com/puzzle.jpg" className="ml-2" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                        </div>
                    </div>
                }
                
                <button type="submit" className="">Add Puzzle</button>
            </form>
            {loading && <p>Adding puzzle...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {successMessage && <p className="text-green-500">{successMessage}</p>}
        </div>

    );
}

export default AddCustomPuzzle;