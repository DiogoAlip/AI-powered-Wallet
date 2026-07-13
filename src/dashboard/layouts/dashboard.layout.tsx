import { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router";
import { NavBar } from "../components/NavBar";
import { SideBar } from "../components/SideBar";
import { useAuthStore } from "../../store/auth.store";
import { useFinancesStore } from "../../store/finances.store";

export const DashboardLayout = () => {
  const [sideBar, setSideBar] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const { dbReady, loadUserDatabase, clearUserDatabase } = useFinancesStore();

  const toggleSideBar = () => setSideBar(!sideBar);

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      loadUserDatabase(user.email);
    } else {
      clearUserDatabase();
    }
  }, [isAuthenticated, user?.email, loadUserDatabase, clearUserDatabase]);

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!dbReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d1527] text-white p-6">
        <div className="flex flex-col items-center gap-6 max-w-sm text-center">
          {/* Animated Spinner with modern visual aesthetics */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-teal-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-teal-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-b-emerald-400 border-t-transparent border-r-transparent border-l-transparent animate-spin [animation-duration:1.5s] [animation-direction:reverse]"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-wide text-white">Preparando FinancIA!</h2>
            <p className="text-sm text-gray-400">
              Inicializando base de datos SQLite segura local para {user?.email}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SideBar isOpen={sideBar} toggleSideBar={toggleSideBar} />
      <NavBar toggleSideBar={toggleSideBar} />
      <Outlet />
    </>
  );
};

