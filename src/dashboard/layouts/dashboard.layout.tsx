import { useState } from "react";
import { Outlet } from "react-router";
import { NavBar } from "../components/NavBar";
import { SideBar } from "../components/SideBar";

export const DashboardLayout = () => {
  const [sideBar, setSideBar] = useState(false);

  const toggleSideBar = () => setSideBar(!sideBar);

  return (
    <>
      <SideBar isOpen={sideBar} toggleSideBar={toggleSideBar} />
      <NavBar toggleSideBar={toggleSideBar} />
      <Outlet />
    </>
  );
};
