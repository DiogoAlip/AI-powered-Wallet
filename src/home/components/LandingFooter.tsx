import { IconRobot } from "@tabler/icons-react";

export function LandingFooter() {
  return (
    <footer className="bg-white border-t border-gray-100 px-6 py-12 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <IconRobot className="w-5 h-5 text-teal-600" />
          <span className="font-display font-extrabold text-sm text-[#0b1c30]">
            FinancIA!
          </span>
        </div>

        <span className="text-[11px] text-gray-400">
          © 2026 FinancIA!. Gestión Inteligente de la Riqueza.
        </span>
      </div>
    </footer>
  );
}
