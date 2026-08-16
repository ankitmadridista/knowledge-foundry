import axios from "axios";
import environment from "@/shared/config/environment";

export const httpClient = axios.create({
  baseURL: environment.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 90000,
});

export const pingBackend = async (): Promise<void> => {
    try {
        await httpClient.get("/health");
        console.log("Backend is awake and ready!");
    } catch (error) {
        console.warn("Backend wake-up ping failed or timed out. It might still be booting.", error);
    }
};