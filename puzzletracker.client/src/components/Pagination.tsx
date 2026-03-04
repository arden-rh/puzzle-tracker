interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {

    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxPagesToShow = 3;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);

            if (currentPage > 2) {
                pages.push("...");
            }

            const end = currentPage === 1 ? Math.min(totalPages - 1, currentPage + 1) : currentPage;
            for (let i = Math.max(2, currentPage); i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 1) {
                pages.push("...");
            }

            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 my-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded disabled:opacity-50"
            >
                Previous
            </button>
            {getPageNumbers().map((page, index) => (
                typeof page === "number" ? (
                    <button
                        key={index}
                        onClick={() => onPageChange(page)}
                        className="px-3 py-1 rounded"
                    >
                        {page}
                    </button>
                ) : (
                    <span key={index} className="px-3 py-1">
                        {page}
                    </span>
                )
            ))}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded disabled:opacity-50"
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;