import { useEffect } from "react";
import { useAuth, useClerk /*, RedirectToSignIn */ } from "@clerk/clerk-react";
import { Outlet, Navigate } from "react-router-dom";
import { AppConfigProvider } from "../providers/AppConfigProvider";

export function RequireAuth() {
    const { isLoaded, isSignedIn } = useAuth();
    const { openSignIn } = useClerk();

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            openSignIn();
        }
    }, [isLoaded, isSignedIn, openSignIn]);

    if (!isLoaded) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-zinc-500">
                Loading workspace...
            </div>
        );
    }

    if (!isSignedIn) {
        // KEEP FOR FUTURE PRODUCTION USE:
        // return <RedirectToSignIn />;

        // WORKAROUND: Bounce the user back to the public home page.
        // This prevents them from staring at a blank black screen while the modal floats above it.
        return <Navigate to="/" replace />;
    }

    return (
        <AppConfigProvider>
            <Outlet />
        </AppConfigProvider>
    );
}
