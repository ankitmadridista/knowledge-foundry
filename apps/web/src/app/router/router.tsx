import {
  createBrowserRouter,
} from "react-router-dom";


import HomePage from "@/pages/Home/HomePage";
import NotFoundPage from "@/pages/NotFound/NotFoundPage";
import MainLayout from "@/app/layouts/MainLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);