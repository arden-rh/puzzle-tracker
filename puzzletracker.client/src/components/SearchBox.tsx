interface SearchBoxProps {
    onSearch: (query: string) => void;
}

const SearchBox = ({ onSearch }: SearchBoxProps) => {

    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const query = formData.get('search') as string;
        onSearch(query);
    };

    return (
        <div className="w-full">
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    name="search"
                    placeholder="Search puzzles..."
                />
            </form>
        </div>
    );
};

export default SearchBox;