interface SortFilterBoxProps {

}

const SortFilterBox: React.FC<SortFilterBoxProps> = () => {
    return (
        <div className="flex flex-col gap-4 items-start justify-start w-full bg-white p-4 shadow-md mb-4">
            <form action="">
                <label htmlFor="sort" className="mr-2">Sort by:</label>
                <select id="sort" name="sort" className="border border-gray-300 rounded px-2 py-1">
                    <option value="nameAsc">Name (A-Z)</option>
                    <option value="nameDesc">Name (Z-A)</option>
                    <option value="piecesAsc">Number of Pieces (Low to High)</option>
                    <option value="piecesDesc">Number of Pieces (High to Low)</option>
                </select>
            </form>
            <form action="" className="">
                <label htmlFor="filter" className="mr-2">Filter by:</label>
                <div className="flex flex-wrap gap-1 mb-2">
                    <span>

                        <input type="radio" name="puzzle-type" id="all-puzzles" value="all" defaultChecked />
                        <label htmlFor="all-puzzles" className="ml-2">All Puzzles</label>
                    </span>
                    <span>
                        <input type="radio" name="puzzle-type" id="official-puzzle" value="official-p" />
                        <label htmlFor="official-puzzle" className="ml-2">Official Puzzles</label>
                    </span>
                    <span>
                        <input type="radio" name="puzzle-type" id="jvh-puzzle" value="jvh" className="" />
                        <label htmlFor="jvh-puzzle" className="ml-2">JVH Puzzles</label>
                    </span>
                    <span>
                        <input type="radio" name="puzzle-type" id="user-puzzle" value="user-p" className="" />
                        <label htmlFor="user-puzzle" className="ml-2">User Puzzles</label>
                    </span>
                </div>
                <div>
                    <span></span>
                    <input type="checkbox" id="in-collection" name="in-collection" />
                    <label htmlFor="in-collection" className="ml-2">In Collection</label>
                    <input type="checkbox" id="completed" name="completed" className="ml-4" />
                    <label htmlFor="completed" className="ml-2">Completed</label>
                </div>
                <div className="flex flex-col">
                    <span></span>

                    <label htmlFor="puzzle-pieces" className="ml-2">Number of Pieces</label>
                    <input type="range" name="puzzle-pieces" id="puzzle-pieces" min="1" max="5000"  />
                    <span>{}</span>
                </div>
            </form>
        </div>
    );
};

export default SortFilterBox;