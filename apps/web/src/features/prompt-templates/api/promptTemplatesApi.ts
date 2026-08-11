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

export const getPromptTemplates = async (): Promise<PromptTemplateSummary[]> => {
  const response = await httpClient.get<PromptTemplateSummary[]>("/prompt-templates");
  return response.data;
};

export const getActivePayload = async (identifier: string): Promise<PromptTemplatePayloadDto> => {
  const response = await httpClient.get<PromptTemplatePayloadDto>(`/prompt-templates/${identifier}/active-payload`);
  return response.data;
};

export const executeTemplate = async (identifier: string, request: ExecuteTemplateRequest): Promise<ExecuteTemplateResponse> => {
  const response = await httpClient.post<ExecuteTemplateResponse>(`/prompt-templates/${identifier}/execute`, request);
  return response.data;
};