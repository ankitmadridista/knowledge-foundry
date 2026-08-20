import { Input } from "./index"; // Adjust import based on where your Input lives

export interface SearchFilterBarProps {
    // Search Props
    searchValue: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;

    // Optional Filter Props
    filterValue?: string | number;
    onFilterChange?: (value: string) => void;
    filterOptions?: { id: number | string; name: string }[];
    filterPlaceholder?: string;
}

export function SearchFilterBar({
    searchValue,
    onSearchChange,
    searchPlaceholder = "Search...",
    filterValue,
    onFilterChange,
    filterOptions,
    filterPlaceholder = "All",
}: SearchFilterBarProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-3 mb-8 items-center">
            {/* Search Input */}
            <div className="relative flex-1 w-full group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                    <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
                <Input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 pr-10 w-full bg-zinc-900/50 border-zinc-800 focus:bg-zinc-950 transition-all rounded-lg"
                />
                {/* Clear Input Button */}
                {searchValue && (
                    <button
                        onClick={() => onSearchChange("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                )}
            </div>

            {/* Dropdown Filter (Only renders if filterOptions are provided!) */}
            {filterOptions && filterOptions.length > 0 && onFilterChange && (
                <div className="relative w-full sm:w-48 shrink-0">
                    <select
                        value={filterValue || ""}
                        onChange={(e) => onFilterChange(e.target.value)}
                        className="appearance-none w-full h-10 px-3 pr-10 rounded-lg border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-zinc-950 transition-all cursor-pointer"
                    >
                        <option value="">{filterPlaceholder}</option>
                        {filterOptions.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                                {opt.name}
                            </option>
                        ))}
                    </select>
                    {/* Custom Dropdown Chevron */}
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-500">
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
}
