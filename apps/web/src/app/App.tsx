import { RouterProvider } from "react-router-dom";

import { router } from "@/app/router/router";
import { AppConfigProvider } from "./providers/AppConfigProvider";

export default function App() {
    return (
        <AppConfigProvider>
            <RouterProvider router={router} />
        </AppConfigProvider>
    );
}
