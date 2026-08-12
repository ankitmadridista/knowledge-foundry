import { httpClient } from "@/shared/api/httpClient";

export interface PromptTemplateSummary {
    id: string;
    identifier: string;
    name: string;
    description: string;
    purpose: number;
    tags: string[];
}

export interface VariableDto {
    name: string;
    defaultValue: string | null;
}

export interface PromptTemplatePayloadDto {
    templateId: string;
    versionId: string;
    text: string;
    variables: VariableDto[];
    versionNumber: number;
}

export interface ExecuteTemplateRequest {
    variables: Record<string, string>;
}

export interface ExecuteTemplateResponse {
    response: string;
    provider: string;
    model: string;
    tokensUsed: number;
    executionTimeMs: number;
}

export interface CreatePromptTemplateRequest {
    identifier: string;
    name: string;
    description: string;
    purpose: number;
    tags: string[];
}

export interface MessageDto {
    role: number; // 0 = System, 1 = User
    content: string;
    order: number;
}

export interface AddPromptVersionRequest {
    messages: MessageDto[];
    capability: number; // Default 0
}

export interface PromptVersionDto {
    versionNumber: number;
    status: string; // "Draft", "Published", "Active", "Deprecated", "Archived"
    capability: number;
    createdAt: string;
}

export interface PromptTemplateDetailsDto {
    id: string;
    identifier: string;
    name: string;
    description: string;
    purpose: number;
    tags: string[];
    versions: PromptVersionDto[];
}

export const getPromptTemplates = async (): Promise<
    PromptTemplateSummary[]
> => {
    const response =
        await httpClient.get<PromptTemplateSummary[]>("/prompt-templates");
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
