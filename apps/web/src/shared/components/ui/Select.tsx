import { useState, useEffect, useRef } from "react";
import { Label } from "./";

export interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    name: string;
    label?: string;
    value: string | number | undefined;
    options: SelectOption[];
    onChange: (name: string, value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
}

export function Select({
    name,
    label,
    value,
    options,
    onChange,
    placeholder = "Select an option...",
    disabled = false,
    required = false,
}: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Find the currently selected option to display its label
    const selectedOption = options.find(
        (opt) => opt.value === value?.toString(),
    );
    const displayLabel = selectedOption ? selectedOption.label : placeholder;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (itemValue: string) => {
        onChange(name, itemValue);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {label && (
                <Label className="block mb-1 text-xs font-medium text-zinc-400">
                    {label} {required && "*"}
                </Label>
            )}

            <div
                className={`flex min-h-10 w-full items-center justify-between rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm ring-offset-zinc-950 transition-colors ${
                    disabled
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer hover:border-zinc-700"
                }`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span
                    className={`block truncate mr-3 ${
                        selectedOption && selectedOption.value !== ""
                            ? "text-zinc-100"
                            : "text-zinc-500"
                    }`}
                >
                    {displayLabel}
                </span>

                <svg
                    className={`w-4 h-4 text-zinc-500 transition-transform shrink-0 ${
                        isOpen ? "rotate-180" : ""
                    }`}
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

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-zinc-900/95 backdrop-blur-md border border-zinc-700/50 rounded-md shadow-2xl shadow-black/50 overflow-hidden">
                    <ul className="overflow-y-auto max-h-52 p-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                        {options.map((opt) => (
                            <li
                                key={opt.value}
                                onClick={() => handleSelect(opt.value)}
                                className={`px-3 py-2.5 my-0.5 text-sm rounded cursor-pointer transition-colors ${
                                    value?.toString() === opt.value
                                        ? "bg-indigo-500/20 text-indigo-300 font-medium"
                                        : "text-zinc-300 hover:bg-zinc-800/80"
                                }`}
                            >
                                {opt.label}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
