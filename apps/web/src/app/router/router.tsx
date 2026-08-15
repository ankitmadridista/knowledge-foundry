import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "@/pages/Home/HomePage";
import NotFoundPage from "@/pages/NotFound/NotFoundPage";
import { MainLayout } from "@/app/layouts/MainLayout";
import { TemplatesPage } from "@/pages/Templates/TemplatesPage";
import { TemplateExecutionPage } from "@/pages/Templates/TemplateExecutionPage";
import { CreateTemplatePage } from "@/pages/Templates/CreateTemplatePage";
import { TemplateDetailsPage } from "@/pages/Templates/TemplateDetailsPage";
import { CreateVersionPage } from "@/pages/Templates/CreateVersionPage";
import { ContextPacksListPage } from "@/features/context-packs/pages/ContextPacksListPage";
import { ContextPackDetailsPage } from "@/features/context-packs/pages/ContextPackDetailsPage";
import { CreateContextPackPage } from "@/features/context-packs/pages/CreateContextPackPage";
import { CreateContextPackVersionPage } from "@/features/context-packs/pages/CreateContextPackVersionPage";

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
                element: <TemplateDetailsPage />,
            },
            {
                path: "templates/:identifier/versions/new",
                element: <CreateVersionPage />,
            },
            {
                path: "templates/:identifier/execute",
                element: <TemplateExecutionPage />,
            },
            {
                path: "context-packs",
                element: <ContextPacksListPage />,
            },
            {
                path: "context-packs/new",
                element: <CreateContextPackPage />,
            },
            {
                path: "context-packs/:id",
                element: <ContextPackDetailsPage />,
            },
            {
                path: "context-packs/:id/versions/new",
                element: <CreateContextPackVersionPage />,
            },
        ],
    },
    {
        path: "*",
        element: <NotFoundPage />,
    },
]);
