export interface ArchitectureNode {
    title: string;
    description: string;
}

export const architectureNodes: ArchitectureNode[] = [
    {
        title: "API",
        description: "HTTP, GraphQL, authentication and transport."
    },
    {
        title: "Application",
        description: "Business use cases and workflow orchestration."
    },
    {
        title: "Business Domain",
        description: "Entities, value objects and business rules."
    },
    {
        title: "AI Platform",
        description: "Prompt orchestration, evaluation and reasoning."
    },
    {
        title: "Infrastructure",
        description: "Database, storage, providers and external systems."
    }
];