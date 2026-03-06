import { useState } from 'react';
import Button from "./Button";

interface SearchBoxProps {
    onSearch: (query: string) => void;
    onReset: () => void;
    initialQuery?: string;
}

const SearchBox = ({ onSearch, onReset, initialQuery = "" }: SearchBoxProps) => {

    const [searchQuery, setSearchQuery] = useState(initialQuery);

    const handleSearch = (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const query = formData.get('search') as string;
        onSearch(query);
    };

    const handleReset = (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSearchQuery("");
        onSearch("");
        onReset();
    };

    return (
        <div className="w-full md:w-1/2 lg:w-3/5 flex gap-2">
            <form onSubmit={handleSearch} onReset={handleReset} className="w-full flex gap-2">
                <input
                    type="text"
                    name="search"
                    placeholder="Search puzzles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded ring ring-indigo-300 p-2"
                />
                <Button
                    type="submit"
                    className="px-4 py-2">
                    Search
                </Button>
                <Button
                    type="reset"
                    className="px-4 py-2"
                    theme="secondary"
                >
                    Reset
                </Button>
            </form>
        </div>
    );
};

export default SearchBox;