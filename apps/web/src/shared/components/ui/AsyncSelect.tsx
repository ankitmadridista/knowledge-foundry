import { useState, useEffect, useRef } from "react";
import { Label, Text } from "./"; 

export interface AsyncSelectItem {
    value: string;
    label: string;
}

interface AsyncSelectProps {
    name: string;
    label: string;
    description?: string;
    value: string;
    onChange: (name: string, value: string) => void;
    fetchData: (search: string) => Promise<AsyncSelectItem[]>;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    initialLabel?: string;
}

export function AsyncSelect({
    name,
    label,
    description,
    value,
    onChange,
    fetchData,
    placeholder = "Search...",
    disabled = false,
    required = false,
    initialLabel = "",
}: AsyncSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [displayLabel, setDisplayLabel] = useState(initialLabel);
    const [options, setOptions] = useState<AsyncSelectItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let isMounted = true;
        const timer = setTimeout(async () => {
            if (!isOpen) return; 

            setIsLoading(true);
            try {
                const results = await fetchData(searchQuery);
                if (isMounted) setOptions(results);
            } catch (err) {
                console.error(`Failed to fetch options for ${name}`, err);
                if (isMounted) setOptions([]);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }, 300); 

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [searchQuery, isOpen, fetchData, name]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                setSearchQuery(""); 
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (item: AsyncSelectItem | null) => {
        if (item) {
            onChange(name, item.value);
            setDisplayLabel(item.label);
        } else {
            onChange(name, "");
            setDisplayLabel("");
        }
        setIsOpen(false);
        setSearchQuery("");
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <Label>
                {label} {required && "*"}
            </Label>
            {description && (
                <Text className="text-xs text-zinc-500 mb-2 mt-1">
                    {description}
                </Text>
            )}

            {/* --- FIXED: The "Fake" Input flexbox layout --- */}
            <div
                className={`flex min-h-10 w-full items-center justify-between rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm ring-offset-zinc-950 transition-colors ${
                    disabled
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer hover:border-zinc-700"
                }`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                {/* TRUNCATE added here so long text doesn't push the icons away */}
                <span
                    className={`block truncate mr-3 ${
                        value && displayLabel
                            ? "text-zinc-100"
                            : "text-zinc-500"
                    }`}
                >
                    {value && displayLabel ? displayLabel : placeholder}
                </span>

                {/* SHRINK-0 added here so the icons never get squished */}
                <div className="flex items-center gap-2 shrink-0">
                    {value && !disabled && !required && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelect(null);
                            }}
                            className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center justify-center w-5 h-5"
                        >
                            <svg
                                className="w-4 h-4"
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
                    <svg
                        className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
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

            {/* --- FIXED: Dropdown Menu Elevation & Mobile Scrolling --- */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-zinc-900/95 backdrop-blur-md border border-zinc-700/50 rounded-md shadow-2xl shadow-black/50 flex flex-col overflow-hidden">
                    <div className="p-2 border-b border-zinc-800/80 shrink-0">
                        <input
                            type="text"
                            autoFocus
                            className="w-full bg-zinc-950/50 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            placeholder="Type to search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <ul className="overflow-y-auto p-1 max-h-52 flex-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                        {isLoading ? (
                            <li className="px-3 py-4 text-sm text-center text-zinc-500 animate-pulse">
                                Searching...
                            </li>
                        ) : options.length > 0 ? (
                            options.map((opt) => (
                                <li
                                    key={opt.value}
                                    onClick={() => handleSelect(opt)}
                                    className={`px-3 py-2.5 my-0.5 text-sm rounded cursor-pointer transition-colors ${
                                        value === opt.value
                                            ? "bg-indigo-500/20 text-indigo-300 font-medium"
                                            : "text-zinc-300 hover:bg-zinc-800/80"
                                    }`}
                                >
                                    {opt.label}
                                </li>
                            ))
                        ) : (
                            <li className="px-3 py-4 text-sm text-center text-zinc-500">
                                No results found.
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}