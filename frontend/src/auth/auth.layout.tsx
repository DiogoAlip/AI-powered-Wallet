import { Outlet } from "react-router";
import { AuthFooter } from "./components/AuthFooter";

export const AuthLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#0d1527] text-white font-sans">
      <Outlet />
      <AuthFooter />
    </div>
  );
};
