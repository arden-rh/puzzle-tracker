import { useState } from "react";
import type { Series } from "../types/dto.types";

interface SortFilterBoxProps {
    listOfSeries: Series[];
    listOfBrands: string[];
    listOfIllustrators: string[];
}

const getSeriesBrands = (series: Series[]): string[] =>
    [...new Set(series.map((s) => s.brandName))];

const SortFilterBox: React.FC<SortFilterBoxProps> = ({ listOfSeries, listOfBrands, listOfIllustrators }) => {

    const [selectedSeriesBrand, setSelectedSeriesBrand] = useState<string>("Jan van Haasteren");
    const [selectedBrand, setSelectedBrand] = useState<string>("all-brands");

    const seriesBrands = getSeriesBrands(listOfSeries);

    const filteredSeries = selectedSeriesBrand
        ? listOfSeries.filter((s) => s.brandName === selectedSeriesBrand)
        : listOfSeries;

    return (
        <div className="flex flex-col gap-4 items-start justify-start w-full bg-white p-4 shadow-md mb-4">
            <form action="">
                <h3 className="mr-2 inline">Sort by:</h3>
                <select id="sort" name="sort" className="border border-gray-300 rounded px-2 py-1">
                    <option value="nameAsc">Name (A-Z)</option>
                    <option value="nameDesc">Name (Z-A)</option>
                    <option value="piecesAsc">Number of Pieces (Low to High)</option>
                    <option value="piecesDesc">Number of Pieces (High to Low)</option>
                </select>
            </form>
            <form action="" className="w-full text-sm">
                <h3 className="border-b border-gray-300 pb-1 mb-2 text-base">Filter by:</h3>
                <div className="flex flex-col gap-2">
                    <fieldset className="grid grid-cols-2 gap-1 w-full md:w-auto">
                        <legend className="font-medium mb-1">Puzzle Type</legend>
                        <span>
                            <input type="radio" name="puzzle-type" id="all-puzzles" value="all" defaultChecked />
                            <label htmlFor="all-puzzles" className="ml-2">All Puzzles</label>
                        </span>
                        <span>
                            <input type="radio" name="puzzle-type" id="official-puzzle" value="official-p" />
                            <label htmlFor="official-puzzle" className="ml-2">Official Puzzles</label>
                        </span>
                        <span>
                            <input type="radio" name="puzzle-type" id="user-puzzle" value="user-p" />
                            <label htmlFor="user-puzzle" className="ml-2">User Puzzles</label>
                        </span>
                    </fieldset>
                    <fieldset>
                        <legend className="font-medium mb-1">Number of Pieces</legend>
                        <div className="grid grid-cols-2 gap-1">
                            <span>
                                <input type="checkbox" id="0-100" name="pieces" value="0-100" />
                                <label htmlFor="0-100" className="ml-2">0-100</label>
                            </span>
                            <span>
                                <input type="checkbox" id="100-500" name="pieces" value="100-500" />
                                <label htmlFor="100-500" className="ml-2">100-500</label>
                            </span>
                            <span>
                                <input type="checkbox" id="500-1000" name="pieces" value="500-1000" />
                                <label htmlFor="500-1000" className="ml-2">500-1000</label>
                            </span>
                            <span>
                                <input type="checkbox" id="1000-3000" name="pieces" value="1000-3000" />
                                <label htmlFor="1000-3000" className="ml-2">1000-3000</label>
                            </span>
                            <span>
                                <input type="checkbox" id=">3000" name="pieces" value=">3000" />
                                <label htmlFor=">3000" className="ml-2">3000+</label>
                            </span>
                        </div>
                    </fieldset>
                    <fieldset>
                        <legend className="font-medium mb-1">Collection Status</legend>
                        <div className="grid grid-cols-2 gap-1">
                            <span>
                                <input type="checkbox" id="in-collection" name="in-collection" value="in-collection" />
                                <label htmlFor="in-collection" className="ml-2">In Collection</label>
                            </span>
                            <span>
                                <input type="checkbox" id="completed" name="completed" value="completed" />
                                <label htmlFor="completed" className="ml-2">Completed</label>
                            </span>
                        </div>
                    </fieldset>
                    <fieldset>
                        <legend className="font-medium mb-1">Brand</legend>
                        <div className="grid grid-cols-[repeat(2,max-content)] gap-1 gap-x-3">
                            <span>
                                <input type="radio" id="all-brands" name="brand" value="all-brands" checked={selectedBrand === "all-brands"} onChange={() => setSelectedBrand("all-brands")} />
                                <label htmlFor="all-brands" className="ml-2">All Brands</label>
                            </span>
                            {listOfBrands.map((brand, index) => (
                                <span key={index}>
                                    <input type="radio" id={`brand-${brand}`} name="brand" value={brand} checked={selectedBrand === brand} onChange={() => setSelectedBrand(brand)} />
                                    <label htmlFor={`brand-${brand}`} className="ml-2">{brand}</label>
                                </span>
                            ))}
                        </div>
                    </fieldset>
                    {(selectedBrand === selectedSeriesBrand || selectedBrand === "all-brands") &&
                        <fieldset>
                            <legend className="font-medium mb-1">Series</legend>
                            <div className="flex gap-3 mb-2">
                                {seriesBrands.map((b) => (
                                    <span key={b}>
                                        <input
                                            type="radio"
                                            id={`series-brand-${b}`}
                                            name="series-brand"
                                            value={b}
                                            checked={selectedSeriesBrand === b}
                                            onChange={() => setSelectedSeriesBrand(b)}
                                        />
                                        <label htmlFor={`series-brand-${b}`} className="ml-2 text-sm">{b}</label>
                                    </span>
                                ))}
                            </div>
                            {selectedSeriesBrand && filteredSeries.length > 0 && (
                                <>
                                    <label htmlFor="series">Select Series:</label>
                                    <div className="grid grid-cols-[repeat(2,max-content)] gap-1 gap-x-3">
                                        {filteredSeries.map((series, index) => (
                                            <span key={index}>
                                                <input type="checkbox" id={`series-${series.name}`} name="series" value={series.name} />
                                                <label htmlFor={`series-${series.name}`} className="ml-2">{series.name}</label>
                                            </span>
                                        ))}
                                    </div>
                                </>
                            )}
                        </fieldset>
                    }
                    <fieldset>
                        <legend className="font-medium mb-1">Illustrators</legend>
                        <div className="grid grid-cols-[repeat(2,max-content)] gap-1 gap-x-3">
                            {listOfIllustrators.map((illustrator, index) => (
                                <span key={index}>
                                    <input type="checkbox" id={`illustrator-${illustrator}`} name="illustrators" value={illustrator} />
                                    <label htmlFor={`illustrator-${illustrator}`} className="ml-2">{illustrator}</label>
                                </span>
                            ))}
                        </div>
                    </fieldset>
                </div>
                <span className="flex gap-2">
                    <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Apply</button>
                    <button type="reset" className="mt-4 bg-gray-500 text-white px-4 py-2 rounded">Reset</button>
                </span>
            </form>
        </div>
    );
};

export default SortFilterBox;