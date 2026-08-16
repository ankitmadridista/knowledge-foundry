import { httpClient } from "@/shared/api/httpClient";
import type { AddPromptVersionRequest, CreatePromptTemplateRequest, ExecuteTemplateRequest, ExecuteTemplateResponse, PromptTemplateDetailsDto, PromptTemplatePayloadDto, PromptTemplateSummaryDto, PromptVersionDetailsDto } from "@/features/prompt-templates/type";



export const getPromptTemplates = async (): Promise<
    PromptTemplateSummaryDto[]
> => {
    const response =
        await httpClient.get<PromptTemplateSummaryDto[]>("/prompt-templates");
    return response.data;
};

export const getActivePayload = async (
    identifier: string,
): Promise<PromptTemplatePayloadDto> => {
    const response = await httpClient.get<PromptTemplatePayloadDto>(
        `/prompt-templates/${identifier}/active-payload`,
    );
    return response.data;
};

export const executeTemplate = async (
    identifier: string,
    request: ExecuteTemplateRequest,
): Promise<ExecuteTemplateResponse> => {
    const response = await httpClient.post<ExecuteTemplateResponse>(
        `/prompt-templates/${identifier}/execute`,
        request,
    );
    return response.data;
};

export const createPromptTemplate = async (
    request: CreatePromptTemplateRequest,
): Promise<string> => {
    const response = await httpClient.post("/prompt-templates", request);

    const id =
        typeof response.data === "string"
            ? response.data
            : response.data?.id || response.data?.value;
    return id.replace(/['"]/g, "");
};

export const addPromptVersion = async (
    id: string,
    request: AddPromptVersionRequest,
): Promise<number> => {
    const response = await httpClient.post(
        `/prompt-templates/${id}/versions`,
        request,
    );
    return response.data.versionNumber;
};

export const activatePromptVersion = async (
    id: string,
    versionNumber: number,
): Promise<void> => {
    await httpClient.post(
        `/prompt-templates/${id}/versions/${versionNumber}/activate`,
    );
};

export const getPromptTemplate = async (
    identifier: string,
): Promise<PromptTemplateDetailsDto> => {
    const response = await httpClient.get<PromptTemplateDetailsDto>(
        `/prompt-templates/${identifier}`,
    );
    return response.data;
};

export const publishPromptVersion = async (
    id: string,
    versionNumber: number,
): Promise<void> => {
    await httpClient.post(
        `/prompt-templates/${id}/versions/${versionNumber}/publish`,
    );
};

export const getPromptVersion = async (
    id: string,
    versionNumber: number,
): Promise<PromptVersionDetailsDto> => {
    const response = await httpClient.get<PromptVersionDetailsDto>(
        `/prompt-templates/${id}/versions/${versionNumber}`,
    );
    return response.data;
};
