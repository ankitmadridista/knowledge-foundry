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