import axios from "axios";
import environment from "@/shared/config/environment";
import toast from "react-hot-toast";

export const httpClient = axios.create({
    baseURL: environment.apiBaseUrl,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 90000,
});

// --- NEW: Global Response Interceptor ---
httpClient.interceptors.response.use(
    (response) => {
        // Any status code that lies within the range of 2xx causes this function to trigger
        return response;
    },
    (error) => {
        // Any status codes that falls outside the range of 2xx causes this function to trigger

        if (!error.response) {
            // 1. Network Error or Timeout (Backend is down or WiFi disconnected)
            console.error("Network or Timeout Error:", error);
            toast.error(
                "Unable to connect to the server. Please check your internet connection.",
            );
        } else if (error.response.status === 429) {
            // 2. NEW: Rate Limit Exceeded
            const retryAfter = error.response.headers["retry-after"];
            const detail = error.response.data?.detail;

            const message = retryAfter
                ? `AI limit reached. Please wait ${retryAfter} seconds.`
                : detail ||
                  "You are making too many requests. Please slow down.";

            toast.error(message, { duration: 5000 }); // Leave toast on screen a bit longer
        } else if (error.response.status >= 500) {
            // 3. Unexpected Server Crashes
            console.error("Server Error (500+):", error.response.data);
            toast.error(
                "Our servers are acting up. We've logged the error and are looking into it.",
            );
        }

        return Promise.reject(error);
    },
);

export const pingBackend = async (): Promise<void> => {
    try {
        await httpClient.get("/health");
        console.log("Backend is awake and ready!");
    } catch (error) {
        console.warn(
            "Backend wake-up ping failed or timed out. It might still be booting.",
            error,
        );
    }
};

export const setupAxiosAuth = (getToken: () => Promise<string | null>) => {
    // Prevent adding multiple interceptors if this runs more than once
    httpClient.interceptors.request.clear();

    httpClient.interceptors.request.use(
        async (config) => {
            try {
                const token = await getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (error) {
                console.error("Failed to fetch Clerk token", error);
            }
            return config;
        },
        (error) => Promise.reject(error),
    );
};
