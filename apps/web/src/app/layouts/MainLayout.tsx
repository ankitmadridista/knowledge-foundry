import { Footer, Navbar } from "@/shared/components/branding";
import { Toaster } from "@/shared/components/ui";
import { Outlet } from "react-router-dom";

export function MainLayout() {
    return (
        <>
            <Navbar />

            <main className="flex-1 flex flex-col">
                <Outlet />
            </main>

            <Footer />

            <Toaster />
        </>
    );
}