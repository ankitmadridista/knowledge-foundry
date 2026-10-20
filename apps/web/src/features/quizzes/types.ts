// --- Requests ---

export interface GenerateQuizRequest {
    lessonId: string;
    promptTemplateId: string;
    questionCount: number;
    quizFormat: string;
    provider?: number;
    model?: string;
}

export interface UpdateQuizOptionDto {
    text: string;
    isCorrect: boolean;
}

export interface UpdateQuizQuestionDto {
    text: string;
    type: string;
    explanation?: string | null;
    options: UpdateQuizOptionDto[];
}

export interface UpdateQuizRequest {
    title: string;
    questions: UpdateQuizQuestionDto[];
}

export interface GenerateQuizFormData {
    promptTemplateId: string;
    questionCount: number;
    quizFormat: string;
    provider?: number;
    model?: string;
}

// --- Responses ---

export interface OptionDto {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface QuestionDto {
    id: string;
    text: string;
    type: "MultipleChoice" | "TrueFalse" | "Descriptive" | string;
    explanation?: string | null;
    options: OptionDto[];
}

// Summary DTO for the list/table view
export interface QuizSummaryDto {
    id: string;
    lessonId: string;
    title: string;
    status: "Draft" | "Review" | "Published" | "Failed" | string;
    questionCount: number;
    createdAt: string;
    publishedAt?: string | null;
    isManuallyEdited: boolean;
    model?: string | null;
}

// Detailed DTO for the Quiz Review/Audit page
export interface QuizDto {
    id: string;
    lessonId: string;
    title: string;
    status: "Draft" | "Review" | "Published" | "Failed" | string;
    errorMessage?: string | null;
    promptTemplateId: string;
    createdAt: string;
    publishedAt?: string | null;
    isManuallyEdited: boolean;
    provider?: number | null;
    model?: string | null;
    tokensUsed?: number | null;
    executionTimeMs?: number | null;
    questions: QuestionDto[];
}