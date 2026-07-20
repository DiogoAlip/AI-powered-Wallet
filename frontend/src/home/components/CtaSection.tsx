import { Link } from "react-router";
import { IconArrowNarrowRight } from "@tabler/icons-react";

export function CtaSection() {
  return (
    <section
      id="pricing"
      className="py-16 md:py-24 px-6 max-w-4xl mx-auto w-full"
    >
      <div className="bg-[#eff4ff] border border-blue-100 p-8 md:p-12 rounded-3xl text-center space-y-6 shadow-sm">
        <h3 className="font-display font-extrabold text-2xl md:text-4xl text-[#0b1c30]">
          ¿Listo para una Riqueza más Inteligente?
        </h3>
        <p className="font-sans text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
          Únete a miles de usuarios que han dominado sus gastos y automatizado su
          ritmo de ahorro con el poder de la inteligencia artificial.
        </p>

        <div className="pt-2">
          <Link
            to="auth/register"
            className="w-full sm:w-auto px-8 py-4 bg-black hover:bg-gray-900 text-white font-sans text-sm font-bold rounded-xl shadow-md transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 mx-auto"
          >
            Registrarse Gratis
            <IconArrowNarrowRight className="w-4 h-4 text-teal-400" />
          </Link>
        </div>

        <span className="text-[11px] text-gray-400 font-medium block">
          No se requiere tarjeta de crédito • Sincronización segura de datos
        </span>
      </div>
    </section>
  );
}
