import { httpClient } from "@/shared/api/httpClient";
import type {
    GenerateLessonRequest,
    UpdateLessonContentRequest,
    LessonSummaryDto,
    LessonDto,
} from "@/features/lessons/types";
import type { PagedResponse } from "@/shared/types/pagination";

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

export const getLessons = async (
    pageNumber: number = 1,
    pageSize: number = 6,
    search?: string,
    status?: number,
): Promise<PagedResponse<LessonSummaryDto>> => {
    const params = new URLSearchParams();
    params.append("pageNumber", pageNumber.toString());
    params.append("pageSize", pageSize.toString());

    if (search) params.append("search", search);
    if (status !== undefined && status !== null) params.append("status", status.toString());

    const response = await httpClient.get(`/lessons?${params.toString()}`);
    return response.data;
};

export const getLessonById = async (id: string): Promise<LessonDto> => {
    const response = await httpClient.get<LessonDto>(`/lessons/${id}`);
    return response.data;
};

export const updateLessonContent = async (
    id: string,
    request: UpdateLessonContentRequest,
): Promise<void> => {
    await httpClient.put(`/lessons/${id}/content`, request);
};

export const deleteLesson = async (id: string): Promise<void> => {
    await httpClient.delete(`/lessons/${id}`);
};
