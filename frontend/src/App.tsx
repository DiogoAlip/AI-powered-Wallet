import { createBrowserRouter, Navigate } from "react-router";
import { RouterProvider } from "react-router/dom";
import { LoginPage } from "./auth/LoginPage/LoginPage.tsx";
import { RegisterPage } from "./auth/RegisterPage/RegisterPage.tsx";
import { HomePage } from "./home/HomePage/HomePage.tsx";
import { AuthLayout } from "./auth/auth.layout.tsx";
import { DashboardLayout } from "./dashboard/layouts/dashboard.layout.tsx";
import { Chat } from "./dashboard/chat/pages/ChatPage.tsx";
import { NewChat } from "./dashboard/chat/pages/NewChatPage.tsx";
import { Limits } from "./dashboard/limits/LimitsPage.tsx";
import { History } from "./dashboard/history/HistoryPage.tsx";
import { Goals } from "./dashboard/goals/GoalsPage.tsx";
import { ProfilePage } from "./dashboard/user/ProfilePage.tsx";
import { PrivacyPage } from "./dashboard/user/PrivacyPage.tsx";
import { AboutPage } from "./dashboard/user/AboutPage.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    children: [{ index: true, element: <HomePage /> }],
  },
  {
    path: "auth",
    Component: AuthLayout,
    children: [
      {
        index: true,
        element: <Navigate to="/auth/login" />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: "dashboard",
    Component: DashboardLayout,
    children: [
      { index: true, element: <Navigate to="/dashboard/chat" /> },
      { path: "user", element: <div>User</div> },
      {
        path: "chat/:id",
        element: <Chat />,
      },
      {
        path: "chat",
        element: <NewChat />,
      },
      { path: "limits", element: <Limits /> },
      {
        path: "history",
        element: <History />,
      },
      { path: "goals", element: <Goals /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "privacy", element: <PrivacyPage /> },
      { path: "about", element: <AboutPage /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
