export interface WorkflowStepModel {
    title: string;
    description: string;
}

export const workflowSteps: WorkflowStepModel[] = [
    {
        title: "Semantic Knowledge Retrieval",
        description:
            "User prompts are vectorized to query Context Packs via pgvector, injecting only the most relevant facts to prevent hallucinations.",
    },
    {
        title: "Dynamic Prompt Orchestration",
        description:
            "Version-controlled templates and runtime variables are dynamically compiled into precise LLM instructions.",
    },
    {
        title: "Asynchronous Generation",
        description:
            "Payloads are queued in background channels and routed securely through a rate-limited, multi-model AI gateway.",
    },
    {
        title: "Autonomous Critique",
        description:
            "A secondary Evaluator agent strictly scores the initial draft against predefined structural and educational rubrics.",
    },
    {
        title: "Iterative Refinement",
        description:
            "The primary AI agent receives the critique feedback and autonomously rewrites the content to meet target thresholds.",
    },
    {
        title: "Curated Delivery",
        description:
            "A highly accurate, polished educational lesson is finalized, persisted to the database, and delivered to the learner.",
    },
];