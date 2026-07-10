import { useState } from "react";
import { Outlet, Navigate } from "react-router";
import { NavBar } from "../components/NavBar";
import { SideBar } from "../components/SideBar";
import { useAuthStore } from "../../store/auth.store";

export const DashboardLayout = () => {
  const [sideBar, setSideBar] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const toggleSideBar = () => setSideBar(!sideBar);

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <>
      <SideBar isOpen={sideBar} toggleSideBar={toggleSideBar} />
      <NavBar toggleSideBar={toggleSideBar} />
      <Outlet />
    </>
  );
};
