export interface WorkflowStepModel {
    title: string;
    description: string;
}

export const workflowSteps: WorkflowStepModel[] = [
    {
        title: "Context Packs",
        description:
            "Domain knowledge and instructional context are loaded before generation begins."
    },
    {
        title: "Prompt Templates",
        description:
            "Versioned prompt templates guide every AI interaction."
    },
    {
        title: "LLM Execution",
        description:
            "Gemini or another provider generates structured educational content."
    },
    {
        title: "Evaluation",
        description:
            "Responses are validated against quality metrics and evaluation datasets."
    },
    {
        title: "Reflection",
        description:
            "Feedback is incorporated to iteratively improve generated content."
    },
    {
        title: "Final Output",
        description:
            "The validated lesson becomes available to the learner."
    }
];