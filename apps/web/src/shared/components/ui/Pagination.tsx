import { Button } from "./Button";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

export function Pagination({
    currentPage,
    totalPages,
    pageSize,
    hasNextPage,
    hasPreviousPage,
    onPageChange,
    onPageSizeChange,
}: PaginationProps) {
    // If there's no data at all, hide the bar
    if (totalPages === 0) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-800/50 pt-6 mt-8">
            {/* Left side: Page Size Selector */}
            <div className="flex items-center text-sm text-zinc-400 gap-2">
                <span>Show</span>
                <select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-200 outline-none focus:border-indigo-500"
                >
                    <option value={6}>6</option>
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                    <option value={48}>48</option>
                </select>
                <span>items</span>
            </div>

            {/* Middle/Right: Page Controls */}
            <div className="flex items-center gap-4">
                <div className="text-sm text-zinc-400">
                    Page{" "}
                    <span className="font-medium text-zinc-200 mx-1">
                        {currentPage}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-zinc-200 mx-1">
                        {totalPages}
                    </span>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={!hasPreviousPage}
                    >
                        &larr; Prev
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={!hasNextPage}
                    >
                        Next &rarr;
                    </Button>
                </div>
            </div>
        </div>
    );
}
