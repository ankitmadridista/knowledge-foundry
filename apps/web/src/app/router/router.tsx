import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "@/features/home/pages/HomePage";
import NotFoundPage from "@/shared/pages/NotFoundPage";
import { MainLayout } from "@/app/layouts/MainLayout";
import { TemplatesPage } from "@/features/prompt-templates/pages/TemplatesPage";
import { TemplateExecutionPage } from "@/features/prompt-templates/pages/TemplateExecutionPage";
import { CreateTemplatePage } from "@/features/prompt-templates/pages/CreateTemplatePage";
import { TemplateDetailsPage } from "@/features/prompt-templates/pages/TemplateDetailsPage";
import { CreateVersionPage } from "@/features/prompt-templates/pages/CreateVersionPage";
import { ContextPacksListPage } from "@/features/context-packs/pages/ContextPacksListPage";
import { ContextPackDetailsPage } from "@/features/context-packs/pages/ContextPackDetailsPage";
import { CreateContextPackPage } from "@/features/context-packs/pages/CreateContextPackPage";
import { CreateContextPackVersionPage } from "@/features/context-packs/pages/CreateContextPackVersionPage";
import { GenerateLessonPage } from "@/features/lessons/pages/GenerateLessonPage";
import { LessonsPage } from "@/features/lessons/pages/LessonsPage";
import { LessonViewerPage } from "@/features/lessons/pages/LessonViewerPage";
import { GlobalRouteError } from "@/shared/components/layout/GlobalRouteError";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        errorElement: <GlobalRouteError />,
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
            {
                path: "lessons/new",
                element: <GenerateLessonPage />,
            },
            {
                path: "lessons",
                element: <LessonsPage />,
            },
            {
                path: "lessons/:id",
                element: <LessonViewerPage />,
            },
        ],
    },
    {
        path: "*",
        element: <NotFoundPage />,
        errorElement: <GlobalRouteError />,
    },
]);
