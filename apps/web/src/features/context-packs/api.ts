import { httpClient } from "@/shared/api/httpClient";
import type {
    ContextPackDto,
    ContextPackSummaryDto,
    ContextPackVersionDetailsDto,
    CreateContextPackRequest,
    CreateContextPackVersionRequest,
} from "@/features/context-packs/types";
import type { PagedResponse } from "@/shared/types/pagination";

export const getContextPacks = async (
    pageNumber: number = 1,
    pageSize: number = 12,
    search?: string
): Promise<PagedResponse<ContextPackSummaryDto>> => {
    const params = new URLSearchParams();
    params.append("pageNumber", pageNumber.toString());
    params.append("pageSize", pageSize.toString());
    
    if (search) params.append("search", search);

    const response = await httpClient.get(`/context-packs?${params.toString()}`);
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
