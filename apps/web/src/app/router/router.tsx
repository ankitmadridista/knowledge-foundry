import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "@/pages/Home/HomePage";
import NotFoundPage from "@/pages/NotFound/NotFoundPage";
import { MainLayout } from "@/app/layouts/MainLayout";
import { TemplatesPage } from "@/pages/Templates/TemplatesPage";
import { TemplateExecutionPage } from "@/pages/Templates/TemplateExecutionPage";
import { CreateTemplatePage } from "@/pages/Templates/CreateTemplatePage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: "templates",
                element: <TemplatesPage />,
            },
            {
                path: "templates/new",
                element: <CreateTemplatePage />,
            },
            {
                path: "templates/:identifier",
                element: <TemplateExecutionPage />,
            },
        ],
    },
    {
        path: "*",
        element: <NotFoundPage />,
    },
]);
