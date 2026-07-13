import { IconSparkles } from "@tabler/icons-react";

export function BudgetAiTips() {
  return (
    <div className="bg-[#131b2e] text-white p-6 rounded-2xl shadow-md space-y-4 relative overflow-hidden group">
      <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all duration-500" />

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-300">
          <IconSparkles className="w-4 h-4" />
        </div>
        <h3 className="font-display font-bold text-sm">
          Consejos de Presupuesto con IA
        </h3>
      </div>

      <ul className="space-y-3 font-sans text-xs text-gray-300">
        <li className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 flex-shrink-0" />
          <span>
            Moviendo tus $120 de ahorro excedente en comida a tu Meta de
            Emergencia aumentas tu probabilidad de meta en un 8%.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 flex-shrink-0" />
          <span>
            Tus suscripciones como Netflix representan el 15% de tu
            presupuesto de facturas fijas. ¡Un control sabio!
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 flex-shrink-0" />
          <span>
            Estás en camino de acumular un excedente neto de $1,400 este mes
            si mantienes este ritmo de consumo de transporte.
          </span>
        </li>
      </ul>
    </div>
  );
}
