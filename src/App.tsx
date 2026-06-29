import { createBrowserRouter, Navigate } from "react-router";
import { RouterProvider } from "react-router/dom";
import { LoginPage } from "./auth/LoginPage/LoginPage.tsx";
import { RegisterPage } from "./auth/RegisterPage/RegisterPage.tsx";
import { HomePage } from "./home/HomePage/HomePage.tsx";
import { AuthLayout } from "./auth/auth.layout";
import { DashboardLayout } from "./dashboard/layouts/dashboard.layout";
import { Chat } from "./dashboard/chat/ChatPage.tsx";
import { Limits } from "./dashboard/limits/LimitsPage.tsx";
import { History } from "./dashboard/history/HistoryPage.tsx";
import { Goals } from "./dashboard/goals/GoalsPage.tsx";
import {
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_SAVINGS,
  INITIAL_CHAT_HISTORY,
} from "./dashboard/mockData.ts";

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
        path: "chat",
        element: <Chat chatHistory={INITIAL_CHAT_HISTORY} />,
      },
      { path: "limits", element: <Limits budgets={INITIAL_BUDGETS} /> },
      {
        path: "history",
        element: <History transactions={INITIAL_TRANSACTIONS} />,
      },
      { path: "goals", element: <Goals savings={INITIAL_SAVINGS} /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
