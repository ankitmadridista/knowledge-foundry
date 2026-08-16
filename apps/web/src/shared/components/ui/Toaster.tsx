import { Toaster as HotToaster } from "react-hot-toast";

export function Toaster() {
    return (
        <HotToaster
            position="bottom-right"
            toastOptions={{
                // Default styling to match our dark/SaaS theme
                className:
                    "!bg-zinc-900 !text-zinc-100 !border !border-zinc-800 shadow-xl",
                style: {
                    borderRadius: "8px",
                },
                success: {
                    iconTheme: { primary: "#10b981", secondary: "#fff" }, // Emerald green
                },
                error: {
                    iconTheme: { primary: "#ef4444", secondary: "#fff" }, // Rose red
                },
            }}
        />
    );
}
