import { Link, useNavigate } from "react-router";
import { IconRobot } from "@tabler/icons-react";
import { useAuthStore } from "../../store/auth.store.ts";

export function LandingHeader() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleDemoLogin = () => {
    login("demo@financia.com");
    navigate("/dashboard/chat");
  };

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 px-6 sm:px-18 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <IconRobot className="w-6 h-6 text-[#006a61]" />
        <span className="font-display font-extrabold text-lg text-[#0b1c30] tracking-tight">
          FinancIA!
        </span>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <button
          onClick={handleDemoLogin}
          className="bg-teal-50 border border-teal-200 hover:border-teal-300 text-[#006a61] hover:bg-teal-100 font-sans text-xs font-bold px-4 py-2 rounded-full shadow-xs transition-all transform hover:scale-105 cursor-pointer"
        >
          Probar Demo
        </button>
        <Link
          to="auth/login"
          className="hidden sm:inline-block text-sm font-semibold text-gray-600 hover:text-[#0b1c30] transition-colors"
        >
          Iniciar Sesión
        </Link>
        <Link
          to="auth/login"
          className="bg-[#0b1c30] hover:bg-black text-white font-sans text-xs font-bold px-4 py-2 rounded-full shadow-sm transition-all transform hover:scale-105"
        >
          Comenzar
        </Link>
      </div>
    </header>
  );
}
