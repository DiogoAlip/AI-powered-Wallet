import { IconCalendarWeek } from "@tabler/icons-react";

interface WeeklyPacingCardProps {
  weekProgressPercent: number;
}

export function WeeklyPacingCard({ weekProgressPercent }: WeeklyPacingCardProps) {
  return (
    <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-display font-bold text-[#0b1c30] text-lg">
            Paso de Presupuesto Semanal
          </h3>
          <p className="font-sans text-xs text-gray-500">
            Compara tu nivel de gasto con el avance de la semana
          </p>
        </div>
        <span className="font-sans text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1 rounded-full self-start flex items-center gap-1">
          <IconCalendarWeek className="w-3.5 h-3.5" />
          Día 5 de 7 (Semana actual)
        </span>
      </div>

      {/* Weekly pace bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold text-gray-500">
          <span>Inicio de semana</span>
          <span className="text-teal-600">
            Avance del tiempo: {weekProgressPercent}%
          </span>
          <span>Fin de semana</span>
        </div>
        <div className="h-2.5 w-full bg-gray-100 rounded-full relative">
          <div
            className="h-full bg-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${weekProgressPercent}%` }}
          />
          {/* Today marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white bg-teal-600 shadow-sm"
            style={{ left: `calc(${weekProgressPercent}% - 8px)` }}
            title="Día de hoy"
          />
        </div>
        <p className="font-sans text-[11px] text-gray-400">
          * Los gastos que se mantengan a la izquierda del marcador azul se
          consideran a ritmo saludable.
        </p>
      </div>
    </div>
  );
}
