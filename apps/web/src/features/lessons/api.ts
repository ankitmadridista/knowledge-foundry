import { httpClient } from "@/shared/api/httpClient";
import type {
    GenerateLessonRequest,
    UpdateLessonContentRequest,
    LessonSummaryDto,
    LessonDto,
} from "@/features/lessons/types";

export const generateLesson = async (
    request: GenerateLessonRequest,
): Promise<string> => {
    const response = await httpClient.post("/lessons/generate", request);

    // Extract the GUID exactly like your createPromptTemplate pattern
    const id =
        typeof response.data === "string"
            ? response.data
            : response.data?.id || response.data?.value;

    return id.replace(/['"]/g, "");
};

export const getLessons = async (): Promise<LessonSummaryDto[]> => {
    const response = await httpClient.get<LessonSummaryDto[]>("/lessons");
    return response.data;
};

export const getLessonById = async (id: string): Promise<LessonDto> => {
    const response = await httpClient.get<LessonDto>(`/lessons/${id}`);
    return response.data;
};

export const updateLessonContent = async (
    id: string,
    request: UpdateLessonContentRequest
): Promise<void> => {
    await httpClient.put(`/lessons/${id}/content`, request);
};

export const deleteLesson = async (id: string): Promise<void> => {
    await httpClient.delete(`/lessons/${id}`);
};