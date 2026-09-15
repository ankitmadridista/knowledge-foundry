export const PURPOSE_CONFIG: Record<number, { label: string; colorClass: string }> = {
    0: {
        label: "Generator",
        colorClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    1: {
        label: "Evaluation",
        colorClass: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
    2: {
        label: "Critic",
        colorClass: "bg-red-500/10 text-red-400 border-red-500/20",
    },
};

export function getPurposeDisplay(purposeId: number) {
    return (
        PURPOSE_CONFIG[purposeId] || {
            label: "Unknown",
            colorClass: "bg-zinc-800 text-zinc-400 border-zinc-700",
        }
    );
}
