export function PricingSection() {
  return (
    <div className="py-16 px-4 flex flex-col items-center justify-center font-sans antialiased text-[#1e293b]">
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
                S/ 0
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
            Registrarse gratis
          </button>
        </div>

        {/* Premium Plan Card (Most Popular) */}
        <div className="w-100 bg-white rounded-2xl p-8 border-2 border-teal-600 flex flex-col shadow-sm relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2b7a6d] text-white text-xs font-bold tracking-wider uppercase px-4 py-1.5 rounded-full shadow-sm">
            Más Popular
          </div>

          <div className="mb-6 mt-2">
            <h3 className="text-xl font-bold text-gray-800">Plan Premium</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-bold tracking-tight text-gray-800">
                S/ 45
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
  );
}
