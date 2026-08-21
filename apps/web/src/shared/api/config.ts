import type { AppConfigDto } from "../types/AppConfigDto";
import { httpClient } from "@/shared/api/httpClient";

export const getAppConfig = async (): Promise<AppConfigDto> => {
    const response = await httpClient.get("/config");
    return response.data;
};