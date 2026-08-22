export interface GenerateLessonRequest {
    title: string;
    topic: string;
    audience: string;
    promptTemplateId: string;
    contextPackId?: string | null;
    provider?: number;
    model?: string;
    criticPromptTemplateId?: string | null;
    criticProvider?: number;
    criticModel?: string;
}

export interface UpdateLessonContentRequest {
    newContent: string;
}

export interface LessonSummaryDto {
    id: string;
    title: string;
    topic: string;
    audience: string;
    status: "Drafting" | "Critiquing" | "Refining" | "Completed" | "Failed" | string; 
    createdAt: string;
    completedAt?: string | null;
    isManuallyEdited?: boolean;
    model?: string | null;
}

export interface LessonDto {
    id: string;
    title: string;
    topic: string;
    audience: string;
    content?: string | null;
    status: "Drafting" | "Critiquing" | "Refining" | "Completed" | "Failed" | string;
    errorMessage?: string | null;
    promptTemplateId: string;
    contextPackId?: string | null;
    criticPromptTemplateId?: string | null;
    critiqueNotes?: string | null;
    createdAt: string;
    completedAt?: string | null;
    isManuallyEdited?: boolean;
    provider?: number | null;
    model?: string | null;
    tokensUsed?: number | null;
    executionTimeMs?: number | null;
}