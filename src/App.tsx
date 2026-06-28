import { createBrowserRouter, Navigate } from "react-router";
import { RouterProvider } from "react-router/dom";
import { Login } from "./routes/login.route";
import { Register } from "./routes/register.route";
import { Pricing } from "./routes/pricing.route";
import { Home } from "./routes/home.route";
import { AuthLayout } from "./auth/auth.layout";
import { DashboardLayout } from "./dashboard/layouts/dashboard.layout";
import { Chat } from "./dashboard/routes/chat.route";
import { Limits } from "./dashboard/routes/limits.route";
import { History } from "./dashboard/routes/history.route";
import { Goals } from "./dashboard/routes/goals.route";
import {
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_SAVINGS,
  INITIAL_CHAT_HISTORY,
} from "./dashboard/mockData.ts";

const router = createBrowserRouter([
  {
    path: "/",
    children: [
      { index: true, element: <Home /> },
      { path: "pricing", element: <Pricing /> },
    ],
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
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
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
        element: (
          <Chat
            chatHistory={INITIAL_CHAT_HISTORY}
            budgets={INITIAL_BUDGETS}
            savings={INITIAL_SAVINGS}
            onSendMessage={() => console.log("Send message")}
            onApplyAction={() => console.log("Apply action")}
            isGenerating={() => console.log("Is generating")}
          />
        ),
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
  return <RouterProvider router={router}></RouterProvider>;
}

export default App;
