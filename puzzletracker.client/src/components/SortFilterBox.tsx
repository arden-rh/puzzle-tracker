import { useState } from "react";
import { Checkbox, Field, Fieldset, Label, Legend, Radio, RadioGroup, Select } from "@headlessui/react";
import type { PuzzleFilters } from "../types/dto/puzzle.types";
import type { Series } from "../types/dto/series.types";

import Button from "./Button";

interface SortFilterBoxProps {
    listOfSeries: Series[];
    listOfBrands: string[];
    listOfIllustrators: string[];
    onApplyFilters: (filters: PuzzleFilters, isReset?: boolean) => void;
}

const getSeriesBrands = (series: Series[]): string[] =>
    [...new Set(series.map((s) => s.brandName))];



const checkboxClass = "group size-4 rounded border border-indigo-300 flex items-center justify-center data-[checked]:bg-indigo-600 data-[checked]:border-indigo-600 cursor-pointer flex-shrink-0";
const radioClass = "group size-4 rounded-full border border-indigo-300 flex items-center justify-center data-[checked]:border-indigo-400 cursor-pointer flex-shrink-0";

const SortFilterBox: React.FC<SortFilterBoxProps> = ({ listOfSeries, listOfBrands, listOfIllustrators, onApplyFilters }) => {

    const [selectedSeriesBrand, setSelectedSeriesBrand] = useState<string>("Jan van Haasteren");
    const [selectedBrand, setSelectedBrand] = useState<string>("all-brands");
    const [sortOption, setSortOption] = useState<string>("dateDesc");
    const [puzzleType, setPuzzleType] = useState<string>("all");
    const [pieceRanges, setPieceRanges] = useState<string[]>([]);
    const [selectedSeries, setSelectedSeries] = useState<string[]>([]);
    const [selectedIllustrators, setSelectedIllustrators] = useState<string[]>([]);
    const [inCollection, setInCollection] = useState<boolean>(false);
    const [isCompleted, setIsCompleted] = useState<boolean>(false);
    const [isOwned, setIsOwned] = useState<boolean>(false);

    const seriesBrands = getSeriesBrands(listOfSeries);

    const filteredSeries = selectedSeriesBrand
        ? listOfSeries.filter((s) => s.brandName === selectedSeriesBrand)
        : listOfSeries;

    const handlePieceRangeChange = (range: string, checked: boolean) => {
        setPieceRanges(prev =>
            checked ? [...prev, range] : prev.filter(r => r !== range)
        );
    };

    const handleSeriesChange = (seriesName: string, checked: boolean) => {
        setSelectedSeries(prev =>
            checked ? [...prev, seriesName] : prev.filter(s => s !== seriesName)
        );
    };

    const handleIllustratorChange = (illustratorName: string, checked: boolean) => {
        setSelectedIllustrators(prev =>
            checked ? [...prev, illustratorName] : prev.filter(i => i !== illustratorName)
        );
    };

    const handleApply = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();

        const [sortBy, sortOrder] = sortOption.includes("name")
            ? ["name", sortOption.includes("Asc") ? "asc" : "desc"]
            : sortOption.includes("pieces")
                ? ["pieces", sortOption.includes("Asc") ? "asc" : "desc"]
                : ["date", sortOption.includes("Asc") ? "asc" : "desc"];

        const filters: PuzzleFilters = {
            sortBy: sortBy as "name" | "pieces" | "date",
            sortOrder: sortOrder as "asc" | "desc",
            puzzleType: puzzleType !== "all" ? puzzleType : undefined,
            brand: selectedBrand !== "all-brands" ? selectedBrand : undefined,
            series: selectedSeries.length > 0 ? selectedSeries : undefined,
            illustrator: selectedIllustrators.length > 0 ? selectedIllustrators : undefined,
            pieceRanges: pieceRanges.length > 0 ? pieceRanges : undefined,
            inCollection: inCollection || undefined,
            isCompleted: isCompleted || undefined,
            isOwned: isOwned || undefined,
        };

        onApplyFilters(filters);
    };

    const handleReset = () => {
        setSortOption("releaseDateAsc");
        setPuzzleType("all");
        setSelectedBrand("all-brands");
        setPieceRanges([]);
        setSelectedSeries([]);
        setSelectedIllustrators([]);
        setInCollection(false);
        setIsCompleted(false);
        setIsOwned(false);
        onApplyFilters({}, true);
    };

    return (
        <div className="flex flex-col gap-4 items-start justify-start w-full bg-indigo-800/70 rounded p-4 shadow-md mb-4">
            <Field className="flex items-center gap-2">
                <Label className="font-medium">Sort by:</Label>
                <Select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="rounded ring ring-indigo-300 px-2 py-1 bg-indigo-900 text-indigo-50 cursor-pointer data-[focus]:ring-indigo-200"
                >
                    <option value="dateDesc">Date (Newest to Oldest)</option>
                    <option value="dateAsc">Date (Oldest to Newest)</option>
                    <option value="nameAsc">Name (A-Z)</option>
                    <option value="nameDesc">Name (Z-A)</option>
                    <option value="piecesAsc">Number of Pieces (Low to High)</option>
                    <option value="piecesDesc">Number of Pieces (High to Low)</option>
                </Select>
            </Field>
            <form onSubmit={handleApply} onReset={handleReset} className="w-full text-sm">
                <h3 className="text-base mb-2">Filter by:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:grid-cols-3">
                    <div className="bg-indigo-950/50 rounded p-2 md:p-3">
                        <Fieldset className="flex flex-col">
                            <Legend className="font-medium mb-1">Puzzle Type</Legend>
                            <RadioGroup value={puzzleType} onChange={setPuzzleType} className="grid grid-cols-2 gap-1 sm:gap-2 w-full md:w-auto lg:w-full">
                                <Field className="flex items-center gap-2">
                                    <Radio value="all" className={radioClass}>
                                        <span className="hidden group-data-[checked]:block size-2 rounded-full bg-indigo-400" />
                                    </Radio>
                                    <Label className="cursor-pointer">All Puzzles</Label>
                                </Field>
                                <Field className="flex items-center gap-2">
                                    <Radio value="official-p" className={radioClass}>
                                        <span className="hidden group-data-[checked]:block size-2 rounded-full bg-indigo-400" />
                                    </Radio>
                                    <Label className="cursor-pointer">Official Puzzles</Label>
                                </Field>
                                <Field className="flex items-center gap-2">
                                    <Radio value="user-p" className={radioClass}>
                                        <span className="hidden group-data-[checked]:block size-2 rounded-full bg-indigo-400" />
                                    </Radio>
                                    <Label className="cursor-pointer">User Puzzles</Label>
                                </Field>
                            </RadioGroup>
                        </Fieldset>
                    </div>
                    <div className="bg-indigo-950/50 rounded p-2 md:p-3">
                        <Fieldset>
                            <Legend className="font-medium mb-1">Number of Pieces</Legend>
                            <div className="grid grid-cols-2 gap-1">
                                {(["0-100", "100-500", "500-1000", "1000-3000", "3000+", "combo-box"] as const).map((range) => (
                                    <Field key={range} className="flex items-center gap-2">
                                        <Checkbox
                                            checked={pieceRanges.includes(range)}
                                            onChange={(checked) => handlePieceRangeChange(range, checked)}
                                            className={checkboxClass}
                                        >
                                            <span className="hidden group-data-[checked]:block text-white text-xs leading-none">✓</span>
                                        </Checkbox>
                                        <Label className="cursor-pointer">{range}</Label>
                                    </Field>
                                ))}
                            </div>
                        </Fieldset>
                    </div>
                    <div className="bg-indigo-950/50 rounded p-2 md:p-3">
                        <Fieldset>
                            <Legend className="font-medium mb-1">Collection Status</Legend>
                            <div className="grid grid-cols-2 gap-1">
                                <Field className="flex items-center gap-2">
                                    <Checkbox checked={inCollection} onChange={setInCollection} className={checkboxClass}>
                                        <span className="hidden group-data-[checked]:block text-white text-xs leading-none">✓</span>
                                    </Checkbox>
                                    <Label className="cursor-pointer">In Collection</Label>
                                </Field>
                                <Field className="flex items-center gap-2">
                                    <Checkbox checked={isCompleted} onChange={setIsCompleted} className={checkboxClass}>
                                        <span className="hidden group-data-[checked]:block text-white text-xs leading-none">✓</span>
                                    </Checkbox>
                                    <Label className="cursor-pointer">Completed</Label>
                                </Field>
                                <Field className="flex items-center gap-2">
                                    <Checkbox checked={isOwned} onChange={setIsOwned} className={checkboxClass}>
                                        <span className="hidden group-data-[checked]:block text-white text-xs leading-none">✓</span>
                                    </Checkbox>
                                    <Label className="cursor-pointer">Owned</Label>
                                </Field>
                            </div>
                        </Fieldset>
                    </div>
                    <div className="bg-indigo-950/50 rounded p-2 md:p-3">
                        <Fieldset>
                            <Legend className="font-medium mb-1">Brand</Legend>
                            <RadioGroup value={selectedBrand} onChange={setSelectedBrand} className="grid grid-cols-[repeat(2,max-content)] md:grid-cols-2 gap-1 gap-x-3">
                                <Field className="flex items-center gap-2">
                                    <Radio value="all-brands" className={radioClass}>
                                        <span className="hidden group-data-[checked]:block size-2 rounded-full bg-indigo-400" />
                                    </Radio>
                                    <Label className="cursor-pointer">All Brands</Label>
                                </Field>
                                {listOfBrands.map((brand, index) => (
                                    <Field key={index} className="flex items-center gap-2">
                                        <Radio value={brand} className={radioClass}>
                                            <span className="hidden group-data-[checked]:block size-2 rounded-full bg-indigo-400" />
                                        </Radio>
                                        <Label className="cursor-pointer">{brand}</Label>
                                    </Field>
                                ))}
                            </RadioGroup>
                        </Fieldset>
                    </div>
                    {(selectedBrand === selectedSeriesBrand || selectedBrand === "all-brands") &&
                        <div className="bg-indigo-950/50 rounded p-2 md:p-3">
                            <Fieldset>
                                <Legend className="font-medium mb-1">Series</Legend>
                                <RadioGroup value={selectedSeriesBrand} onChange={setSelectedSeriesBrand} className="flex gap-3 mb-2">
                                    {seriesBrands.map((b) => (
                                        <Field key={b} className="flex items-center gap-2">
                                            <Radio value={b} className={radioClass}>
                                                <span className="hidden group-data-[checked]:block size-2 rounded-full bg-indigo-400" />
                                            </Radio>
                                            <Label className="cursor-pointer text-sm">{b}</Label>
                                        </Field>
                                    ))}
                                </RadioGroup>
                                {selectedSeriesBrand && filteredSeries.length > 0 && (
                                    <>
                                        <span className="block mb-1">Select Series:</span>
                                        <div className="grid grid-cols-[repeat(2,max-content)] md:grid-cols-2 gap-1 gap-x-3">
                                            {filteredSeries.map((series, index) => (
                                                <Field key={index} className="flex items-center gap-2">
                                                    <Checkbox
                                                        checked={selectedSeries.includes(series.name)}
                                                        onChange={(checked) => handleSeriesChange(series.name, checked)}
                                                        className={checkboxClass}
                                                    >
                                                        <span className="hidden group-data-[checked]:block text-white text-xs leading-none">✓</span>
                                                    </Checkbox>
                                                    <Label className="cursor-pointer">{series.name}</Label>
                                                </Field>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </Fieldset>
                        </div>
                    }
                    <div className="bg-indigo-950/50 rounded p-2 md:p-3">
                        <Fieldset>
                            <Legend className="font-medium mb-1">Illustrators</Legend>
                            <div className="grid grid-cols-[repeat(2,max-content)] lg:grid-cols-2 gap-1 gap-x-3">
                                {listOfIllustrators.map((illustrator, index) => (
                                    <Field key={index} className="flex items-center gap-2">
                                        <Checkbox
                                            checked={selectedIllustrators.includes(illustrator)}
                                            onChange={(checked) => handleIllustratorChange(illustrator, checked)}
                                            className={checkboxClass}
                                        >
                                            <span className="hidden group-data-[checked]:block text-white text-xs leading-none">✓</span>
                                        </Checkbox>
                                        <Label className="cursor-pointer">{illustrator}</Label>
                                    </Field>
                                ))}
                            </div>
                        </Fieldset>
                    </div>
                </div>
                <span className="flex gap-2 mt-4">
                    <Button type="submit" className="px-4 py-2">
                        Apply
                    </Button>
                    <Button type="reset" className="px-4 py-2" theme="secondary">
                        Reset
                    </Button>
                </span>
            </form>
        </div>
    );
};

export default SortFilterBox;