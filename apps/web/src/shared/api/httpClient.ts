import axios from "axios";
import environment from "@/shared/config/environment";

export const httpClient = axios.create({
  baseURL: environment.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});