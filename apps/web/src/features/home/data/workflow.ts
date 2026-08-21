export interface WorkflowStepModel {
    title: string;
    description: string;
}

export const workflowSteps: WorkflowStepModel[] = [
    {
        title: "Knowledge Injection",
        description:
            "Domain-specific Context Packs are loaded to ground the AI and prevent hallucinations.",
    },
    {
        title: "Prompt Orchestration",
        description:
            "Version-controlled templates format the request for optimal LLM comprehension.",
    },
    {
        title: "Model Execution",
        description:
            "Payloads are routed to the selected AI provider (Gemini, Groq, or OpenRouter).",
    },
    {
        title: "Automated Evaluation",
        description:
            "Responses are strictly validated against predefined educational quality metrics.",
    },
    {
        title: "Iterative Reflection",
        description:
            "Feedback loops prompt the AI to refine and improve the content autonomously.",
    },
    {
        title: "Curated Output",
        description:
            "A polished, high-fidelity educational lesson is delivered to the learner.",
    },
];
