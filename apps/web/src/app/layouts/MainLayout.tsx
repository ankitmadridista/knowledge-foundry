import { Footer, Navbar } from "@/shared/components/branding";
import { Toaster } from "@/shared/components/ui";
import { Outlet } from "react-router-dom";

export function MainLayout() {
    return (
        <>
            <Navbar />

            <main>
                <Outlet />
            </main>

            <Footer />

            <Toaster />
        </>
    );
}
