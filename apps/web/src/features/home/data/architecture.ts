export interface ArchitectureNode {
    title: string;
    description: string;
}

export const architectureNodes: ArchitectureNode[] = [
    {
        title: "API",
        description: "RESTful Minimal APIs, secure authentication, and edge routing."
    },
    {
        title: "Application",
        description: "CQRS-driven business workflows and asynchronous job orchestration."
    },
    {
        title: "Business Domain",
        description: "Strict DDD aggregates, value objects, and invariant business rules."
    },
    {
        title: "AI Platform",
        description: "Multi-model prompt execution, Semantic RAG, and autonomous evaluation."
    },
    {
        title: "Infrastructure",
        description: "PostgreSQL, pgvector search, and robust background processing."
    }
];