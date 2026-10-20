export const PURPOSE_CONFIG: Record<number, { label: string; description: string; colorClass: string }> = {
    0: {
        label: "Generator",
        description: "Creates the primary educational content.",
        colorClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    1: {
        label: "Evaluation",
        description: "Grades and scores existing lessons.",
        colorClass: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
    2: {
        label: "Critic",
        description: "Reviews drafts and provides iterative feedback.",
        colorClass: "bg-red-500/10 text-red-400 border-red-500/20",
    },
    3: {
        label: "Quiz Generation",
        description: "Generates structured JSON assessments based on lessons.",
        colorClass: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20", 
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

export const getPurposeLabel = (purpose: number): string => {
    return PURPOSE_CONFIG[purpose]?.label || "Unknown";
};
