import { useAuth, RedirectToSignIn } from "@clerk/clerk-react";
import { Outlet } from "react-router-dom";
import { AppConfigProvider } from "../providers/AppConfigProvider";

export function RequireAuth() {
    const { isLoaded, isSignedIn } = useAuth();

    if (!isLoaded) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-zinc-500">
                Loading workspace...
            </div>
        );
    }

    if (!isSignedIn) {
        return <RedirectToSignIn />;
    }

    return (
        <AppConfigProvider>
            <Outlet />
        </AppConfigProvider>
    );
}
