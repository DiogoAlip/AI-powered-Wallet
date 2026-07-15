import { Link, useNavigate } from "react-router";
import { useAuthStore } from "../../store/auth.store.ts";
import {
  IconArrowNarrowRight,
  IconSparkles,
} from "@tabler/icons-react";

export function HeroSection() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleDemoLogin = () => {
    login("demo@financia.com");
    navigate("/dashboard/chat");
  };
  return (
    <section className="relative px-6 py-12 md:py-24 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      {/* Decorative ambient gradient */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-teal-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Left Content Column */}
      <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
        <div className="inline-flex items-center gap-1.5 bg-[#86f2e4]/30 border border-teal-200 px-3 py-1 rounded-full">
          <IconSparkles className="w-3.5 h-3.5 text-teal-700 fill-teal-700" />
          <span className="font-sans text-[11px] font-bold text-teal-800 tracking-wide uppercase">
            Precisión Impulsada por IA
          </span>
        </div>

        <h2 className="font-display font-extrabold text-3xl md:text-5xl lg:text-6xl text-[#0b1c30] leading-tight tracking-tight">
          Domina tu Dinero con{" "}
          <span className="text-[#006a61]">Inteligencia de IA.</span>
        </h2>

        <p className="font-sans text-sm md:text-base text-gray-500 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
          Toma el control de tus finanzas con información proactiva, seguimiento
          automatizado y registro de gastos en lenguaje natural. Creado para el
          profesional moderno.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
          <Link
            to="auth/register"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#131b2e] hover:bg-black text-white font-sans text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            Comenzar Gratis
            <IconArrowNarrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={handleDemoLogin}
            className="w-full sm:w-auto px-8 py-3.5 bg-teal-50 hover:bg-teal-100 text-[#006a61] border border-teal-200 font-sans text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
          >
            Probar Demo
          </button>
        </div>

        {/* Social Proof */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
          <div className="flex -space-x-2">
            <img
              className="w-8 h-8 rounded-full border-2 border-white object-cover"
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80"
              alt="Usuario 1"
            />
            <img
              className="w-8 h-8 rounded-full border-2 border-white object-cover"
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80"
              alt="Usuario 2"
            />
            <div className="w-8 h-8 rounded-full border-2 border-white bg-teal-100 flex items-center justify-center text-[10px] font-bold text-teal-800 font-sans">
              +10k
            </div>
          </div>
          <p className="font-sans text-xs text-gray-500 font-medium">
            Únete a más de 10k creadores de riqueza activos
          </p>
        </div>
      </div>

      {/* Right Preview Card Column */}
      <div className="lg:col-span-5 flex justify-center">
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-xl w-full max-w-sm space-y-6 transform hover:scale-[1.02] transition-transform duration-300">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <div>
              <span className="text-xs text-gray-400 font-semibold block uppercase">
                Gasto Diario
              </span>
              <span className="text-xs text-gray-400 block font-medium">
                Hoy, 24 de Oct
              </span>
            </div>
            <span className="font-display font-extrabold text-xl text-[#0b1c30]">
              $242.50
            </span>
          </div>

          {/* Quick transaction preview lines */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold">
                  ☕
                </div>
                <div>
                  <span className="text-xs font-bold text-[#0b1c30] block">
                    Café Artesanal y Almuerzo
                  </span>
                  <span className="text-[10px] text-gray-400 block">
                    12:45 PM • Comer Fuera
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-red-600">-$34.20</span>
            </div>

            {/* Proactive AI Insight Banner */}
            <div className="p-4 bg-teal-50 rounded-xl border border-teal-100 space-y-1">
              <div className="flex items-center gap-1.5 text-[#006a61]">
                <IconSparkles className="w-3.5 h-3.5 fill-current" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider">
                  Perspectiva de IA
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Tu gasto en café ha subido un{" "}
                <strong className="text-teal-800">12%</strong> esta semana.
                Encontramos una suscripción que podría ahorrarte{" "}
                <strong className="text-teal-800">$40/mes</strong>.
              </p>
            </div>
          </div>

          {/* Simulated progress tracker */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-[11px] text-gray-400 font-semibold">
              <span>Progreso del presupuesto</span>
              <span className="text-emerald-600 font-bold">
                25% por debajo del viernes típico
              </span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-600 rounded-full"
                style={{ width: "65%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
