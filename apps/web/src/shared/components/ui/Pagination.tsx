import { Button } from "./Button";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number; // <-- NEW: We need this to calculate "Showing X to Y"
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

export function Pagination({
    currentPage,
    totalPages,
    pageSize,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    onPageChange,
    onPageSizeChange,
}: PaginationProps) {
    if (totalCount === 0) return null;

    // Calculate the range of items currently visible
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalCount);

    return (
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 border-t border-zinc-800/50 pt-6 mt-8 text-sm">
            {/* Left: Premium Item Range Summary */}
            <div className="text-zinc-400 text-center lg:text-left">
                Showing{" "}
                <span className="font-medium text-zinc-200">{startItem}</span>{" "}
                to <span className="font-medium text-zinc-200">{endItem}</span>{" "}
                of{" "}
                <span className="font-medium text-zinc-200">{totalCount}</span>{" "}
                items
            </div>

            {/* Right: Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                {/* Page Size Selector */}
                <div className="flex items-center text-zinc-400 gap-2">
                    <span>Items per page:</span>
                    <select
                        value={pageSize}
                        onChange={(e) =>
                            onPageSizeChange(Number(e.target.value))
                        }
                        className="bg-zinc-900 border border-zinc-800 rounded-md px-2 py-1.5 text-zinc-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer hover:border-zinc-700"
                    >
                        <option value={6}>6</option>
                        <option value={12}>12</option>
                        <option value={24}>24</option>
                        <option value={48}>48</option>
                    </select>
                </div>

                {/* Page Controls (Only visible if there is more than 1 page) */}
                {totalPages > 1 && (
                    <div className="flex items-center gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={!hasPreviousPage}
                            // Explicitly force disabled styling just in case your base Button doesn't have it
                            className="disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-zinc-800 disabled:hover:text-zinc-400 px-3"
                        >
                            &larr; Prev
                        </Button>

                        <div className="text-zinc-400 font-medium min-w-12 text-center">
                            {currentPage} / {totalPages}
                        </div>

                        <Button
                            variant="secondary"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={!hasNextPage}
                            className="disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-zinc-800 disabled:hover:text-zinc-400 px-3"
                        >
                            Next &rarr;
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
