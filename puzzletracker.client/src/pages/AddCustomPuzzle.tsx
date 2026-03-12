import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox, Field, Label, Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
// Types
import type { UserCustomPuzzle } from "../types/dto/puzzle.types";
// Hooks
import useCustomPuzzles from "../hooks/useCustomPuzzles";
// Components
import useBrands from "../hooks/useBrands";
import Button from "../components/Button";
import ButtonLink from "../components/ButtonLink";

const labelClass = "uppercase font-poppins tracking-wider block mb-1 text-indigo-300";
const inputClass = "rounded ring ring-indigo-300 px-2 py-1 w-full bg-transparent text-white";

const AddCustomPuzzle = () => {

    const navigate = useNavigate();
    const { createCustomPuzzle } = useCustomPuzzles();
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

        createCustomPuzzle(newPuzzle)
            .then(() => {
                setSuccessMessage("Puzzle added successfully!");
                setLoading(false);
                setTimeout(() => {
                    navigate("/profile/collection");
                }, 3000);
            })
            .catch((error) => {
                setError("Failed to add puzzle. Please try again.");
                setLoading(false);
            });
    }

    useEffect(() => {
        getAllBrands();
    }, []);

    return (
        <div className="w-full max-w-[600px] flex flex-col">
            <h2 className="mb-2">Add Custom Puzzle</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <Field>
                    <Label className={labelClass}>Puzzle Name</Label>
                    <input type="text" placeholder="My Custom Puzzle" className={inputClass} value={nameEnglish} onChange={(e) => setNameEnglish(e.target.value)} />
                </Field>
                <div className="flex flex-col">
                    <span className={labelClass}>Brand</span>
                    {brands && brands.length > 0 && (
                        <div className="flex flex-col gap-1 mb-1">
                            <span className="uppercase text-sm font-poppins tracking-wider text-indigo-200">Pick an existing brand</span>
                            <Listbox value={brandName} onChange={setBrandName}>
                                <ListboxButton className="relative rounded ring ring-indigo-300 px-2 py-1 w-full text-left bg-transparent text-white">
                                    {brandName || <span className="text-indigo-400">Select a brand</span>}
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-300">▾</span>
                                </ListboxButton>
                                <ListboxOptions anchor="bottom" className="w-[var(--button-width)] rounded border border-indigo-500 bg-indigo-950 text-white shadow-lg mt-1 z-10 overflow-auto max-h-48">
                                    <ListboxOption value="" className="px-3 py-1.5 text-indigo-400 cursor-pointer data-[focus]:bg-indigo-800">
                                        Select a brand
                                    </ListboxOption>
                                    {brands.map((brand) => (
                                        <ListboxOption key={brand.id} value={brand.name} className="px-3 py-1.5 cursor-pointer data-[focus]:bg-indigo-800 data-[selected]:text-indigo-300 data-[selected]:font-medium">
                                            {brand.name}
                                        </ListboxOption>
                                    ))}
                                </ListboxOptions>
                            </Listbox>
                            <span className="uppercase text-sm font-poppins tracking-wider text-indigo-200">or enter your own</span>
                        </div>
                    )}
                    <input type="text" placeholder="Brand Name" className={inputClass} value={brandName} onChange={(e) => setBrandName(e.target.value)} />
                </div>
                <Field>
                    <Label className={labelClass}>Number of Pieces</Label>
                    <input type="number" placeholder="500" className={inputClass} value={numberOfPieces} onChange={(e) => setNumberOfPieces(e.target.value)} />
                </Field>
                <Field className="flex gap-2 items-center mt-2">
                    <Checkbox
                        checked={isPublic}
                        onChange={setIsPublic}
                        className="group size-4 rounded border border-indigo-300 flex items-center justify-center data-[checked]:bg-indigo-600 data-[checked]:border-indigo-600 cursor-pointer"
                    >
                        <span className="hidden group-data-[checked]:block text-white text-xs leading-none">✓</span>
                    </Checkbox>
                    <Label className="uppercase font-poppins tracking-wider text-indigo-300 cursor-pointer">Make Public</Label>
                </Field>

                <Button type="button" theme="secondary" onClick={() => setShowMoreFields(!showMoreFields)} className="w-full max-w-[200px] mx-auto py-2">Show more information</Button>

                {showMoreFields && (
                    <div className="flex flex-col gap-2">
                        <Field>
                            <Label className={labelClass}>Product Number</Label>
                            <input type="text" placeholder="12345" className={inputClass} value={productNumber} onChange={(e) => setProductNumber(e.target.value)} />
                        </Field>
                        <Field>
                            <Label className={labelClass}>Series Name</Label>
                            <input type="text" placeholder="Beautiful Scenery Series" className={inputClass} value={seriesName} onChange={(e) => setSeriesName(e.target.value)} />
                        </Field>
                        <Field>
                            <Label className={labelClass}>Illustrator Name</Label>
                            <input type="text" placeholder="John Doe" className={inputClass} value={illustratorName} onChange={(e) => setIllustratorName(e.target.value)} />
                        </Field>
                        <Field>
                            <Label className={labelClass}>Local Name</Label>
                            <input type="text" placeholder="Mitt Pussel" className={inputClass} value={nameLocal} onChange={(e) => setNameLocal(e.target.value)} />
                        </Field>
                        <Field>
                            <Label className={labelClass}>Local Language</Label>
                            <input type="text" placeholder="Swedish" className={inputClass} value={localLanguage} onChange={(e) => setLocalLanguage(e.target.value)} />
                        </Field>
                        <Field>
                            <Label className={labelClass}>Box Image URL</Label>
                            <input type="text" placeholder="https://example.com/puzzle.jpg" className={inputClass} value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                        </Field>
                    </div>
                )}

                <div className="flex gap-2 justify-center items-center mt-4">
                    <Button type="submit" className="max-w-32">Add Puzzle</Button>
                    <ButtonLink route="/profile" className="max-w-32">Cancel</ButtonLink>
                </div>
            </form>

            {loading && <p className="w-full mt-3">Adding puzzle...</p>}
            {error && <p className="text-red-500 w-full mt-3">{error}</p>}
            {successMessage && <p className="text-green-500 w-full mt-3">{successMessage}</p>}
        </div>
    );
}

export default AddCustomPuzzle;