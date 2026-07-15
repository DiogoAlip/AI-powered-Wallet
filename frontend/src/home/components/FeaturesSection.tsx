import {
  IconSparkles,
  IconCircleCheck,
  IconDeviceMobile,
  IconBolt,
  IconLock,
} from "@tabler/icons-react";

export function FeaturesSection() {
  return (
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
  );
}
