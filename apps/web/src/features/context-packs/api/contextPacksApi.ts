import { httpClient } from "@/shared/api/httpClient";

export interface ContextSectionDto {
    title: string;
    content: string;
    order: number;
}

export interface ContextPackVersionDto {
    versionNumber: number;
    status: string;
    createdAt: string;
}

export interface ContextPackSummaryDto {
    id: string;
    identifier: string;
    name: string;
    description: string;
    tags: string[];
}

export interface ContextPackDto {
    id: string;
    identifier: string;
    name: string;
    description: string;
    tags: string[];
    versions: ContextPackVersionDto[];
}

export interface ContextPackVersionDetailsDto {
    versionNumber: number;
    status: string | number;
    createdAt: string;
    sections: ContextSectionDto[];
}

export interface CreateContextPackRequest {
    identifier: string;
    name: string;
    description: string;
    tags?: string[];
}

export interface CreateContextPackVersionRequest {
    sections: ContextSectionDto[];
}

export const getContextPacks = async (): Promise<ContextPackSummaryDto[]> => {
    const response =
        await httpClient.get<ContextPackSummaryDto[]>("/context-packs");
    return response.data;
};

export const getContextPack = async (id: string): Promise<ContextPackDto> => {
    const response = await httpClient.get<ContextPackDto>(
        `/context-packs/${id}`,
    );
    return response.data;
};

export const createContextPack = async (
    request: CreateContextPackRequest,
): Promise<string> => {
    const response = await httpClient.post("/context-packs", request);

    const id =
        typeof response.data === "string"
            ? response.data
            : response.data?.id || response.data?.value;
    return id.replace(/['"]/g, "");
};

export const createContextPackVersion = async (
    id: string,
    request: CreateContextPackVersionRequest,
): Promise<number> => {
    const response = await httpClient.post(
        `/context-packs/${id}/versions`,
        request,
    );
    return response.data.versionNumber;
};

export const getContextPackVersion = async (
    id: string,
    versionNumber: number,
): Promise<ContextPackVersionDetailsDto> => {
    const response = await httpClient.get<ContextPackVersionDetailsDto>(
        `/context-packs/${id}/versions/${versionNumber}`,
    );
    return response.data;
};

export const publishContextPackVersion = async (
    id: string,
    versionNumber: number,
): Promise<void> => {
    await httpClient.post(
        `/context-packs/${id}/versions/${versionNumber}/publish`,
    );
};

export const activateContextPackVersion = async (
    id: string,
    versionNumber: number,
): Promise<void> => {
    await httpClient.post(
        `/context-packs/${id}/versions/${versionNumber}/activate`,
    );
};

export const getActiveContextPackPayload = async (
    identifier: string,
): Promise<string> => {
    const response = await httpClient.get<{ markdownContent: string }>(
        `/context-packs/${identifier}/active-payload`,
    );
    return response.data.markdownContent;
};
