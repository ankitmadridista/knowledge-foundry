// src/shared/utils/error.ts
import { isAxiosError } from "axios";

/**
 * Safely extracts a user-friendly error message from an unknown error object,
 * handling Axios responses, standard JS Errors, and .NET ProblemDetails.
 */
export function extractErrorMessage(
    err: unknown,
    fallbackMessage: string = "An unexpected error occurred."
): string {
    if (isAxiosError(err) && err.response?.data) {
        const data = err.response.data;
        
        return (
            data.error?.message || // Standard Clean Architecture Error
            data.message ||        // Standard JSON message
            data.detail ||         // .NET ProblemDetails standard
            data.title ||          // .NET ProblemDetails fallback
            fallbackMessage        // Safe fallback (No JSON.stringify!)
        );
    }
    
    if (err instanceof Error) {
        return err.message;
    }
    
    return fallbackMessage;
}