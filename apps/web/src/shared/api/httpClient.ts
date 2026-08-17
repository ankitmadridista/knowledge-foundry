import axios from "axios";
import environment from "@/shared/config/environment";
import toast from "react-hot-toast";
// import { toast } from "@/your-toast-library-path"; // <-- Import your global Toast system here!

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
      toast.error("Unable to connect to the server. Please check your internet connection.");
    } 
    else if (error.response.status >= 500) {
      // 2. Unexpected Server Crashes (Caught by our new .NET GlobalExceptionHandler)
      // The error.response.data will contain our RFC 7807 Problem Details JSON!
      console.error("Server Error (500+):", error.response.data);
      toast.error("Our servers are acting up. We've logged the error and are looking into it.");
    }
    // Note: We deliberately DO NOT globally catch 400 or 404 errors here.
    // We let those pass through so the local page (e.g., LessonsPage) can handle
    // specific business errors (like "Lesson Name Already Exists").

    return Promise.reject(error);
  }
);

export const pingBackend = async (): Promise<void> => {
    try {
        await httpClient.get("/health");
        console.log("Backend is awake and ready!");
    } catch (error) {
        console.warn("Backend wake-up ping failed or timed out. It might still be booting.", error);
    }
};