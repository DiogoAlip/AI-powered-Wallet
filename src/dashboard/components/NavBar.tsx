import { IconUserCircle, IconMenu2 } from "@tabler/icons-react";

interface NavBarProps {
  toggleSideBar: () => void;
}

export const NavBar = ({ toggleSideBar }: NavBarProps) => {
  return (
    <header className="bg-white border-b border-gray-100 flex items-center justify-between px-5 h-16 z-50 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSideBar}
          className="text-gray-500 hover:bg-gray-100 transition-colors p-2 rounded-full flex items-center justify-center cursor-pointer"
        >
          <IconMenu2 className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <h1 className="font-display font-bold text-lg md:text-xl text-[#0b1c30]">
            SpendWise AI
          </h1>
          <span className="text-[10px] bg-teal-50 border border-teal-200 text-teal-800 font-semibold px-2 py-0.5 rounded-full hidden sm:inline-block">
            Inteligente
          </span>
        </div>
      </div>

      <IconUserCircle />
    </header>
  );
};
