export interface PromptTemplateSummaryDto {
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
    provider: number;
    model: string;
    variables: VariableDto[];
    versionNumber: number;
}

export interface ExecuteTemplateRequest {
    variables: Record<string, string>;
    provider?: number;
    model?: string;
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
    provider: number;
    model: string;
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
    provider: number;
    model: string;
    tags: string[];
    versions: PromptVersionDto[];
}

export interface PromptMessageDetailsDto {
    role: number;
    content: string;
    order: number;
}

export interface PromptVersionDetailsDto {
    versionNumber: number;
    status: number | string; // Handle both integer and string enum serialization
    capability: number;
    createdAt: string;
    messages: PromptMessageDetailsDto[];
}

export interface AiModelDto {
    providerId: number;
    providerName: string;
    modelId: string;
}