export interface GenerateLessonRequest {
    title: string;
    topic: string;
    audience: string;
    promptTemplateId: string;
    contextPackId?: string | null; // Optional, as some lessons might not need a context pack
}

export interface UpdateLessonContentRequest {
    newContent: string;
}

export interface LessonSummaryDto {
    id: string;
    title: string;
    topic: string;
    audience: string;
    status: string; // "Generating", "Completed", "Failed"
    createdAt: string;
    completedAt?: string | null;
    isManuallyEdited?: boolean;
}

export interface LessonDto {
    id: string;
    title: string;
    topic: string;
    audience: string;
    content?: string | null; // The Markdown! Null if status is "Generating"
    status: string;
    errorMessage?: string | null;
    promptTemplateId: string;
    contextPackId?: string | null;
    createdAt: string;
    completedAt?: string | null;
    isManuallyEdited?: boolean;
}