export type RoadmapStatus = "completed" | "in-progress" | "planned";

export interface RoadmapItem {
    title: string;
    description: string;
    status: RoadmapStatus;
}

export const roadmap: RoadmapItem[] = [
    {
        title: "Project Foundation",
        description:
            "Repository structure, Clean Architecture, AI Platform, CI/CD, and deployment.",
        status: "completed",
    },
    {
        title: "Prompt Templates",
        description:
            "Versioned prompt management with validation and GraphQL APIs.",
        status: "in-progress",
    },
    {
        title: "Context Packs",
        description:
            "Reusable contextual knowledge supplied to AI workflows.",
        status: "planned",
    },
    {
        title: "Lesson Generation",
        description:
            "Generate educational content using orchestrated AI pipelines.",
        status: "planned",
    },
    {
        title: "Evaluation Engine",
        description:
            "Automatically evaluate AI-generated content using configurable metrics.",
        status: "planned",
    },
    {
        title: "Reflection Loop",
        description:
            "Allow AI to critique and improve its own outputs iteratively.",
        status: "planned",
    },
    {
        title: "Multi-Model Support",
        description:
            "Support Gemini, OpenAI, OpenRouter, Ollama and future providers.",
        status: "planned",
    },
];