import { httpClient } from "@/shared/api/httpClient";
import type {
    GenerateQuizRequest,
    UpdateQuizRequest,
    QuizSummaryDto,
    QuizDto,
} from "./types";
import type { PagedResponse } from "@/shared/types/pagination";

export const generateQuiz = async (
    request: GenerateQuizRequest,
): Promise<string> => {
    const response = await httpClient.post("/quizzes/generate", request);

    // Handle string or wrapped object ID extraction just like Lesson generation
    const id =
        typeof response.data === "string"
            ? response.data
            : response.data?.id || response.data?.value;

    return id.replace(/['"]/g, "");
};

export const getQuizzes = async (
    pageNumber: number = 1,
    pageSize: number = 6,
    search?: string,
    status?: number,
    lessonId?: string,
): Promise<PagedResponse<QuizSummaryDto>> => {
    const params = new URLSearchParams();
    params.append("pageNumber", pageNumber.toString());
    params.append("pageSize", pageSize.toString());

    if (search) params.append("search", search);
    if (status !== undefined && status !== null)
        params.append("status", status.toString());
    if (lessonId) params.append("lessonId", lessonId);

    const response = await httpClient.get(`/quizzes?${params.toString()}`);
    return response.data;
};

export const getQuizById = async (id: string): Promise<QuizDto> => {
    const response = await httpClient.get<QuizDto>(`/quizzes/${id}`);
    return response.data;
};

export const updateQuiz = async (
    id: string,
    request: UpdateQuizRequest,
): Promise<void> => {
    await httpClient.put(`/quizzes/${id}`, request);
};

export const publishQuiz = async (id: string): Promise<void> => {
    await httpClient.put(`/quizzes/${id}/publish`);
};

export const deleteQuiz = async (id: string): Promise<void> => {
    await httpClient.delete(`/quizzes/${id}`);
};