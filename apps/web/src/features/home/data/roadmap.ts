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
            "Strict DDD, Clean Architecture, CI/CD, and multi-tenant Clerk authentication.",
        status: "completed",
    },
    {
        title: "Prompt Orchestration",
        description:
            "Version-controlled prompt management via RESTful Minimal APIs.",
        status: "completed",
    },
    {
        title: "Context Packs",
        description:
            "Reusable contextual knowledge mapped to specific generation pipelines.",
        status: "completed",
    },
    {
        title: "Multi-Model AI Gateway",
        description:
            "Token-bucket rate-limited execution across Gemini, Groq, and OpenRouter.",
        status: "completed",
    },
    {
        title: "Asynchronous Generation",
        description: "Background processing queues with real-time UI state polling and interception.",
        status: "completed",
    },
    {
        title: "Reflection Loop",
        description: "Autonomous LLM self-correction pipelines driven by critique feedback.",
        status: "completed",
    },
    {
        title: "Evaluation Engine",
        description:
            "Automated scoring of AI-generated content using strict structural rubrics.",
        status: "completed",
    },
    {
        title: "Semantic RAG Upgrade",
        description:
            "Vector embedding search using pgvector for dynamic context injection.",
        status: "completed",
    },
    {
        title: "Telemetry & Cost Analytics",
        description:
            "Interactive dashboards visualizing token usage, latency, and AI execution logs.",
        status: "planned",
    },
    {
        title: "Automated Document Ingestion",
        description:
            "OCR and parsing pipeline to automatically convert PDFs and Word documents into semantic Context Packs.",
        status: "planned",
    },
    {
        title: "Real-Time Streaming",
        description:
            "SignalR integration for live WebSocket updates of background jobs and streaming LLM tokens.",
        status: "planned",
    }
];
