import { httpClient } from "@/shared/api/httpClient";


export interface PromptTemplateSummary {
  id: string;
  identifier: string;
  name: string;
  description: string;
  purpose: number;
  tags: string[];
}

export const getPromptTemplates = async (): Promise<PromptTemplateSummary[]> => {
  const response = await httpClient.get<PromptTemplateSummary[]>("/prompt-templates");
  return response.data;
};