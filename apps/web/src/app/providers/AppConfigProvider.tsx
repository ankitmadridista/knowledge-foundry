/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getAppConfig} from "@/shared/api/config";
import type { AppConfigDto } from "@/shared/types/AppConfigDto";

// 1. Define the shape of our context
interface AppConfigContextValue {
    config: AppConfigDto | null;
    isLoading: boolean;
    error: string | null;
}

// 2. Create the Context
const AppConfigContext = createContext<AppConfigContextValue | undefined>(undefined);

// 3. Create the Provider Component
export function AppConfigProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<AppConfigDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const data = await getAppConfig();
                setConfig(data);
            } catch (err) {
                console.error("Failed to load app config:", err);
                setError("Failed to load application configuration.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchConfig();
    }, []);

    return (
        <AppConfigContext.Provider value={{ config, isLoading, error }}>
            {children}
        </AppConfigContext.Provider>
    );
}

// 4. Create a custom hook for easy access anywhere in the app!
export function useAppConfig() {
    const context = useContext(AppConfigContext);
    if (context === undefined) {
        throw new Error("useAppConfig must be used within an AppConfigProvider");
    }
    return context;
}