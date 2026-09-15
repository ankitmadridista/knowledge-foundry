export const CAPABILITY_CONFIG: Record<
    number,
    { label: string; description: string }
> = {
    0: {
        label: "General Chat",
        description: "Standard text generation and conversational output.",
    },
    1: {
        label: "Structured Output",
        description: "Forces the AI Provider API to return strict, valid JSON.",
    },
    2: {
        label: "Reasoning",
        description:
            "Optimized payload routing for reasoning models (e.g., o1).",
    },
};
