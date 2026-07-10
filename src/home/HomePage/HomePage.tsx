import { Link } from "react-router";
import {
  IconRobot,
  IconArrowNarrowRight,
  IconCircleCheck,
  IconDeviceMobile,
  IconBolt,
  IconSparkles,
  IconStar,
  IconLock,
} from "@tabler/icons-react";

export function HomePage() {
  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] font-sans min-h-screen flex flex-col selection:bg-teal-200">
      {/* Landing Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 px-18 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconRobot className="w-6 h-6 text-[#006a61]" />
          <span className="font-display font-extrabold text-lg text-[#0b1c30] tracking-tight">
            FinancIA!
          </span>
        </div>

        <div className="flex items-center gap-10">
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

      {/* Hero Section */}
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

      {/* Section 2: Effortless Control (3 steps) */}
      <section
        id="how-it-works"
        className="bg-teal-50/40 py-16 md:py-24 px-6 border-y border-gray-100"
      >
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h3 className="font-display font-extrabold text-2xl md:text-4xl text-[#0b1c30]">
              Control sin Esfuerzo
            </h3>
            <p className="font-sans text-sm md:text-base text-gray-500 max-w-xl mx-auto">
              FinancIA! elimina la fricción de la gestión financiera con un
              flujo de trabajo simplificado de tres pasos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
            {[
              {
                num: "1",
                title: "Conecta tus Cuentas",
                desc: "Sincroniza de forma segura tus bancos y tarjetas con encriptación de nivel bancario en segundos. Sin configuraciones complejas.",
              },
              {
                num: "2",
                title: "Registra Gastos por Chat",
                desc: 'Simplemente escribe "Cena de $45 en Green Cafe" o envía una nota de voz de tu compra de café. La IA se encarga del resto.',
              },
              {
                num: "3",
                title: "Obtén Perspectivas de IA",
                desc: "Recibe sugerencias personalizadas sobre dónde ahorrar, cómo optimizar facturas y cómo alcanzar tus metas de ahorro.",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-full bg-[#0b1c30] text-white flex items-center justify-center font-display font-extrabold text-base">
                  {step.num}
                </div>
                <h4 className="font-sans font-bold text-base text-[#0b1c30]">
                  {step.title}
                </h4>
                <p className="font-sans text-xs text-gray-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: AI Features Bento / Grid Layout */}
      <section
        id="features"
        className="py-16 md:py-24 px-6 max-w-7xl mx-auto w-full space-y-12"
      >
        <div className="text-center md:text-left space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded-full">
            <span className="font-sans text-[10px] font-bold text-teal-800 tracking-wide uppercase">
              Funciones Inteligentes
            </span>
          </div>
          <h3 className="font-display font-extrabold text-2xl md:text-4xl text-[#0b1c30]">
            IA avanzada diseñada para tu salud financiera.
          </h3>
          <p className="font-sans text-sm text-gray-500">
            Potentes herramientas diseñadas para la gestión de riqueza personal de élite,
            previsiones y clasificación de gastos.
          </p>
        </div>

        {/* Features Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main feature box */}
          <div className="lg:col-span-6 bg-white border border-gray-100 p-6 md:p-8 rounded-2xl shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700">
                <IconSparkles className="w-6 h-6" />
              </div>
              <h4 className="font-sans font-bold text-lg text-[#0b1c30]">
                Categorización Inteligente
              </h4>
              <p className="font-sans text-xs text-gray-500 leading-relaxed">
                Nuestra red neuronal aprende tus hábitos de gasto con el tiempo y
                etiqueta automáticamente cada transacción con un 99% de precisión. Se acabó
                la clasificación manual.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <span className="font-mono text-[10px] text-gray-400 font-semibold bg-gray-200/50 px-2 py-1 rounded-full uppercase">
                CAFÉ → COMIDA Y BEBIDA
              </span>
              <span className="text-xs font-semibold text-teal-800 flex items-center gap-1">
                <IconCircleCheck className="w-3.5 h-3.5" />
                Categorizado
              </span>
            </div>
          </div>

          {/* Sub features list layout */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <IconDeviceMobile className="w-5 h-5" />
                </div>
                <h4 className="font-sans font-bold text-sm text-[#0b1c30]">
                  Lenguaje Natural
                </h4>
                <p className="font-sans text-xs text-gray-500 leading-relaxed">
                  Habla con tu asistente de presupuesto como con un amigo cercano. Registra
                  gastos usando texto rápido y simple, y deja que el asistente procese los detalles.
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <IconBolt className="w-5 h-5" />
                </div>
                <h4 className="font-sans font-bold text-sm text-[#0b1c30]">
                  Ahorros Proactivos
                </h4>
                <p className="font-sans text-xs text-gray-500 leading-relaxed">
                  Predecimos los próximos gastos semanales y te notificamos antes de que
                  superes los presupuestos de cada categoría, ayudándote a ahorrar.
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex flex-col justify-between col-span-1 sm:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <h4 className="font-sans font-bold text-sm text-[#0b1c30] flex items-center gap-1.5">
                    <IconLock className="w-4 h-4 text-[#006a61]" />
                    Seguridad AES de 256 bits
                  </h4>
                  <p className="font-sans text-xs text-gray-500">
                    Protegemos tus datos con el mismo nivel de encriptación utilizado
                    por las organizaciones financieras líderes.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-teal-800 bg-teal-100/50 border border-teal-200 px-3 py-1 rounded-full self-start sm:self-center">
                  Bloqueo de Nivel Bancario
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Customer Testimonial (Sarah Jenkins) */}
      <section className="bg-[#131b2e] text-white py-16 md:py-24 px-6 relative overflow-hidden">
        {/* Abstract teal glow */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <IconStar
                key={i}
                className="w-5 h-5 text-teal-400 fill-teal-400"
              />
            ))}
          </div>

          <blockquote className="font-display font-extrabold text-xl md:text-3xl lg:text-4xl text-gray-100 leading-relaxed">
            "FinancIA! transformó mi relación con el dinero. Las perspectivas de la IA
            identificaron $200 en fugas mensuales que no sabía que existían. Es como
            tener un asesor financiero en el bolsillo las 24 horas, los 7 días de la semana."
          </blockquote>

          <div className="flex flex-col items-center gap-2 pt-4">
            <img
              className="w-14 h-14 rounded-full border-2 border-teal-400 object-cover shadow-md"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
              alt="Perfil de Sarah Jenkins"
            />
            <div>
              <span className="font-sans font-bold text-sm block text-teal-300">
                Sarah Jenkins
              </span>
              <span className="font-sans text-xs text-gray-400 block">
                Diseñadora Senior, Techflow
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: "Ready for Smarter Wealth?" CTA card */}
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
              Comenzar Gratis
              <IconArrowNarrowRight className="w-4 h-4 text-teal-400" />
            </Link>
          </div>

          <span className="text-[11px] text-gray-400 font-medium block">
            No se requiere tarjeta de crédito • Sincronización segura de datos
          </span>
        </div>
      </section>

      {/* Section 5: Pricing*/}
      <div className="min-h-screen py-16 px-4 flex flex-col items-center justify-center font-sans antialiased text-[#1e293b]">
        {/* Header Section */}
        <div className="text-center mb-12 max-w-md">
          <h2 className="text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">
            Precios Simples y Transparentes
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Elige el plan que se adapte a tu camino financiero.
          </p>
        </div>

        <div className="w-full flex flex-row justify-center gap-6 flex-wrap">
          <div className="bg-white w-100 rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800">Plan Gratuito</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold tracking-tight text-gray-800">
                  $0
                </span>
                <span className="ml-1 text-lg font-medium text-gray-400">
                  /mes
                </span>
              </div>
            </div>

            {/* Features List */}
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-base text-gray-800">
                <svg
                  className="h-6 w-6 shrink-0 text-teal-800"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Seguimiento Básico de Gastos</span>
              </li>
              <li className="flex items-start gap-3 text-base text-gray-800">
                <svg
                  className="h-6 w-6 shrink-0 text-teal-800"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Chat de IA (50 mensajes/mes)</span>
              </li>
              <li className="flex items-start gap-3 text-base text-gray-400">
                <svg
                  className="h-6 w-6 shrink-0 text-teal-800"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Análisis Semanales</span>
              </li>
              <li className="flex items-start gap-3 text-base text-gray-800">
                <svg
                  className="h-6 w-6 shrink-0 text-teal-800"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Seguridad Estándar</span>
              </li>
            </ul>

            <button className="w-full py-3 px-4 rounded-xl border-2 border-gray-800 text-base font-semibold text-[#1e293b] bg-white hover:bg-slate-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">
              Comenzar
            </button>
          </div>

          {/* Premium Plan Card (Most Popular) */}
          <div className="w-100 bg-white rounded-2xl p-8 border-2 border-teal-600 flex flex-col shadow-sm">
            {/* Badge */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2b7a6d] text-white text-xs font-bold tracking-wider uppercase px-4 py-1.5 rounded-full shadow-sm">
              Más Popular
            </div>

            <div className="mb-6 mt-2">
              <h3 className="text-xl font-bold text-gray-800">Plan Premium</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold tracking-tight text-gray-800">
                  $12
                </span>
                <span className="ml-1 text-lg font-medium text-gray-400">
                  /mes
                </span>
              </div>
            </div>

            {/* Features List */}
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-base text-gray-400">
                <svg
                  className="h-6 w-6 shrink-0 text-teal-800"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Chat de IA Ilimitado</span>
              </li>
              <li className="flex items-start gap-3 text-base text-gray-800">
                <svg
                  className="h-6 w-6 shrink-0 text-teal-800"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Sincronización Bancaria en Tiempo Real</span>
              </li>
              <li className="flex items-start gap-3 text-base text-[#475569]">
                <svg
                  className="h-6 w-6 shrink-0 text-teal-800"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Planificador de Impuestos Avanzado</span>
              </li>
              <li className="flex items-start gap-3 text-base text-gray-400">
                <svg
                  className="h-6 w-6 shrink-0 text-teal-800"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Perspectivas de IA Prioritarias</span>
              </li>
              <li className="flex items-start gap-3 text-base text-[#475569]">
                <svg
                  className="h-6 w-6 shrink-0 text-[#2b7a6d]"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Seguridad AES de 256 bits</span>
              </li>
            </ul>

            <button className="w-full py-3 px-4 rounded-xl text-base font-semibold text-white bg-black hover:bg-neutral-800 transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900">
              Obtener Pro
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
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
    </div>
  );
}
