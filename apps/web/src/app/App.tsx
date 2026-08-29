import { RouterProvider } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { router } from "@/app/router/router";
import { setupAxiosAuth } from "@/shared/api/httpClient";

function AxiosAuthInterceptor({ children }: { children: React.ReactNode }) {
    const { getToken, isLoaded } = useAuth();

    useEffect(() => {
        setupAxiosAuth(getToken);
    }, [getToken]);

    if (!isLoaded) {
        return (
            <div className="flex h-screen items-center justify-center text-zinc-500">
                Initializing...
            </div>
        );
    }

    return <>{children}</>;
}

export default function App() {
    return (
        <AxiosAuthInterceptor>
            <RouterProvider router={router} />
        </AxiosAuthInterceptor>
    );
}
