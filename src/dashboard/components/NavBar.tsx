import { IconUserCircle, IconMenu2 } from "@tabler/icons-react";
import { Link } from "react-router";
import { useAuthStore } from "../../store/auth.store";

interface NavBarProps {
  toggleSideBar: () => void;
  sidebarExpanded: boolean;
}

export const NavBar = ({ toggleSideBar, sidebarExpanded }: NavBarProps) => {
  const user = useAuthStore((state) => state.user);
  const isDemo = user?.email === "demo@financia.com";

  return (
    <>
      {/* Spacer so page content isn't hidden behind the fixed header */}
      <div className="h-12" />

      <div className="flex flex-col fixed w-full top-0 left-0 z-50">
        <header
          className={`bg-white/80 backdrop-blur-md border-b border-gray-100/80 flex items-center justify-between px-4 h-12 z-50 shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-300 ease-in-out ${
            sidebarExpanded ? "md:pl-[calc(16rem+1.25rem)]" : "md:pl-[calc(4rem+1rem)]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {/* Mobile hamburger — only on small screens */}
            <button
              onClick={toggleSideBar}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors p-1.5 rounded-lg flex items-center justify-center cursor-pointer md:hidden"
            >
              <IconMenu2 className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="font-display font-bold text-base text-[#0b1c30] tracking-tight"
              >
                FinancIA!
              </Link>
              <span className="text-[10px] bg-teal-50 border border-teal-200 text-teal-700 font-semibold px-1.5 py-0.5 rounded-full hidden sm:inline-block leading-none">
                Inteligente
              </span>
              {isDemo && (
                <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-700 font-bold px-1.5 py-0.5 rounded-full inline-block animate-pulse leading-none">
                  Demo
                </span>
              )}
            </div>
          </div>

          <IconUserCircle className="w-5 h-5 text-gray-400" />
        </header>
      </div>
    </>
  );
};
