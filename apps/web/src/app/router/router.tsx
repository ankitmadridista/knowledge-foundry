import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "@/pages/Home/HomePage";
import NotFoundPage from "@/pages/NotFound/NotFoundPage";
import { MainLayout } from "@/app/layouts/MainLayout";
import { TemplatesPage } from "@/pages/Templates/TemplatesPage"; // <-- ADD THIS IMPORT
import { TemplateExecutionPage } from "@/pages/Templates/TemplateExecutionPage";

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
        path: "templates/:identifier",
        element: <TemplateExecutionPage />,
      }
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);