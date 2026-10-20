interface NumberStepperProps {
    value: number;
    onChange: (val: number) => void;
    min?: number;
    max?: number;
    disabled?: boolean;
}

export function NumberStepper({
    value,
    onChange,
    min = 1,
    max = 100,
    disabled = false,
}: NumberStepperProps) {
    return (
        <div
            className={`flex items-center border border-zinc-800 bg-zinc-950 rounded-md h-10 w-full overflow-hidden transition-opacity ${
                disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
            <button
                type="button"
                onClick={() => onChange(Math.max(min, value - 1))}
                disabled={disabled || value <= min}
                className="w-10 h-full flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
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
                        d="M20 12H4"
                    />
                </svg>
            </button>

            <div className="flex-1 flex items-center justify-center text-sm font-medium text-zinc-100 border-x border-zinc-800/50 h-full bg-zinc-900/50">
                {value}
            </div>

            <button
                type="button"
                onClick={() => onChange(Math.min(max, value + 1))}
                disabled={disabled || value >= max}
                className="w-10 h-full flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
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
                        d="M12 4v16m8-8H4"
                    />
                </svg>
            </button>
        </div>
    );
}
