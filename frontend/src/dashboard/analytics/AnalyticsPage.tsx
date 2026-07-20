import { useState } from "react";
import { useFinancesStore } from "../../store/finances.store.ts";
import { formatCurrency, formatNumber } from "../../utils/format";
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";

function getDaysAgo(dateStr: string): number {
  if (!dateStr) return 0;
  const str = dateStr.toLowerCase().trim();
  if (str === "hoy" || str.includes("am") || str.includes("pm") || str.includes(":")) {
    return 0;
  }
  if (str === "ayer") {
    return 1;
  }
  const match = str.match(/hace\s+(\d+)\s+d[íi]as/);
  if (match) {
    return parseInt(match[1], 10);
  }
  if (str.includes("-")) {
    try {
      const date = new Date(str);
      const today = new Date();
      today.setHours(0,0,0,0);
      date.setHours(0,0,0,0);
      const diffTime = today.getTime() - date.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 ? diffDays : 0;
    } catch (e) {
      return 0;
    }
  }
  return 0;
}

interface TrendPoint {
  label: string;
  income: number;
  expense: number;
  daysAgo?: number;
}

export function AnalyticsPage() {
  const { transactions, categories } = useFinancesStore();
  const [period, setPeriod] = useState<"7d" | "1m" | "3m" | "6m" | "1y" | "all">("7d");
  const [hoveredPoint, setHoveredPoint] = useState<{
    dayLabel: string;
    type: "expense" | "income";
    amount: number;
    x: number;
    y: number;
  } | null>(null);

  // --- Filter Transactions by Selected Period ---
  const filteredTransactions = transactions.filter((t) => {
    const daysAgo = getDaysAgo(t.date);
    if (period === "7d") return daysAgo < 7;
    if (period === "1m") return daysAgo < 30;
    if (period === "3m") return daysAgo < 90;
    if (period === "6m") return daysAgo < 180;
    if (period === "1y") return daysAgo < 365;
    return true; // "all"
  });

  // --- Category Expense Chart Data ---
  const expenses = filteredTransactions.filter((t) => t.type === "expense");
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

  const categoryData = categories
    .filter((cat) => cat !== "Ingresos")
    .map((cat) => {
      const amount = expenses
        .filter((t) => t.category === cat)
        .reduce((sum, t) => sum + t.amount, 0);
      const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
      return { category: cat, amount, percentage };
    })
    .sort((a, b) => b.amount - a.amount); // Sort by highest spending first

  // --- Grouping Trend Data by Selected Period ---
  const getTrendPoints = (): TrendPoint[] => {
    if (period === "7d") {
      // 7 daily points: oldest (6 days ago) at index 0 to newest (Today) at index 6
      return Array.from({ length: 7 }, (_, i) => {
        const daysAgo = 6 - i;
        const dayTxs = filteredTransactions.filter((t) => getDaysAgo(t.date) === daysAgo);
        const income = dayTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
        const expense = dayTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
        
        let label = "";
        if (daysAgo === 0) label = "Hoy";
        else if (daysAgo === 1) label = "Ayer";
        else label = `Hace ${daysAgo} d.`;
        
        return { label, income, expense, daysAgo };
      });
    }

    if (period === "1m") {
      // 30 daily points: oldest (29 days ago) to newest (Today)
      return Array.from({ length: 30 }, (_, i) => {
        const daysAgo = 29 - i;
        const dayTxs = filteredTransactions.filter((t) => getDaysAgo(t.date) === daysAgo);
        const income = dayTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
        const expense = dayTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
        
        let label = "";
        if (daysAgo === 0) label = "Hoy";
        else if (daysAgo === 29) label = "Hace 30 d.";
        else if (daysAgo % 5 === 0) label = `Hace ${daysAgo} d.`;
        
        return { label, income, expense, daysAgo };
      });
    }

    if (period === "3m") {
      // 12 weekly points: oldest (11 weeks ago) to newest (This week)
      return Array.from({ length: 12 }, (_, i) => {
        const weeksAgo = 11 - i;
        const startDay = weeksAgo * 7;
        const endDay = (weeksAgo + 1) * 7 - 1;
        
        const weekTxs = filteredTransactions.filter((t) => {
          const d = getDaysAgo(t.date);
          return d >= startDay && d <= endDay;
        });
        
        const income = weekTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
        const expense = weekTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
        
        let label = "";
        if (weeksAgo === 0) label = "Esta sem.";
        else if (weeksAgo === 1) label = "Sem. pasada";
        else label = `Hace ${weeksAgo} sem.`;
        
        return { label, income, expense };
      });
    }

    if (period === "6m") {
      // 6 monthly points: oldest (5 months ago) to newest (This month)
      return Array.from({ length: 6 }, (_, i) => {
        const monthsAgo = 5 - i;
        const startDay = monthsAgo * 30;
        const endDay = (monthsAgo + 1) * 30 - 1;
        
        const monthTxs = filteredTransactions.filter((t) => {
          const d = getDaysAgo(t.date);
          return d >= startDay && d <= endDay;
        });
        
        const income = monthTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
        const expense = monthTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
        
        let label = "";
        if (monthsAgo === 0) label = "Este mes";
        else if (monthsAgo === 1) label = "Mes pasado";
        else label = `Hace ${monthsAgo} m.`;
        
        return { label, income, expense };
      });
    }

    if (period === "1y") {
      // 12 monthly points: oldest (11 months ago) to newest (This month)
      return Array.from({ length: 12 }, (_, i) => {
        const monthsAgo = 11 - i;
        const startDay = monthsAgo * 30;
        const endDay = (monthsAgo + 1) * 30 - 1;
        
        const monthTxs = filteredTransactions.filter((t) => {
          const d = getDaysAgo(t.date);
          return d >= startDay && d <= endDay;
        });
        
        const income = monthTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
        const expense = monthTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
        
        let label = "";
        if (monthsAgo === 0) label = "Este mes";
        else if (monthsAgo === 1) label = "Mes pasado";
        else if (monthsAgo % 2 === 0) label = `Hace ${monthsAgo} m.`;
        
        return { label, income, expense };
      });
    }

    // "all" - dynamic grouping based on maximum daysAgo in transactions
    const maxDays = filteredTransactions.length > 0 
      ? Math.max(...filteredTransactions.map((t) => getDaysAgo(t.date))) 
      : 0;

    if (maxDays <= 7) {
      return Array.from({ length: 7 }, (_, i) => {
        const daysAgo = 6 - i;
        const dayTxs = filteredTransactions.filter((t) => getDaysAgo(t.date) === daysAgo);
        const income = dayTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
        const expense = dayTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
        let label = daysAgo === 0 ? "Hoy" : daysAgo === 1 ? "Ayer" : `Hace ${daysAgo} d.`;
        return { label, income, expense };
      });
    }
    
    if (maxDays <= 30) {
      return Array.from({ length: 10 }, (_, i) => {
        const step = Math.ceil(maxDays / 10);
        const intervalAgo = 9 - i;
        const startDay = intervalAgo * step;
        const endDay = (intervalAgo + 1) * step - 1;
        
        const intervalTxs = filteredTransactions.filter((t) => {
          const d = getDaysAgo(t.date);
          return d >= startDay && d <= endDay;
        });
        
        const income = intervalTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
        const expense = intervalTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
        let label = intervalAgo === 0 ? "Hoy" : `Hace ${intervalAgo * step} d.`;
        return { label, income, expense };
      });
    }

    // Default group in 12 intervals
    const interval = Math.ceil(maxDays / 12);
    return Array.from({ length: 12 }, (_, i) => {
      const intervalsAgo = 11 - i;
      const startDay = intervalsAgo * interval;
      const endDay = (intervalsAgo + 1) * interval - 1;
      
      const intervalTxs = filteredTransactions.filter((t) => {
        const d = getDaysAgo(t.date);
        return d >= startDay && d <= endDay;
      });
      
      const income = intervalTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const expense = intervalTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      
      let label = intervalsAgo === 0 ? "Hoy" : `Hace ${intervalsAgo * interval} d.`;
      return { label, income, expense };
    });
  };

  const trendData = getTrendPoints();

  // Max value to scale Y axis
  const maxVal = Math.max(
    ...trendData.map((d) => Math.max(d.income, d.expense)),
    100 // fallback min value to avoid division by zero
  );

  // SVG dimensions
  const width = 500;
  const height = 200;
  const paddingX = 45;
  const paddingY = 25;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Helper to get coordinates
  const getCoords = (index: number, val: number) => {
    const x = paddingX + (index * chartWidth) / (trendData.length - 1);
    const y = height - paddingY - (val / maxVal) * chartHeight;
    return { x, y };
  };

  // Generate SVG Path for line and area
  const generatePaths = (type: "income" | "expense") => {
    const coords = trendData.map((d, index) =>
      getCoords(index, type === "income" ? d.income : d.expense)
    );

    if (coords.length === 0) return { linePath: "", areaPath: "" };

    const linePath = `M ${coords.map((c) => `${c.x} ${c.y}`).join(" L ")}`;
    
    // Area path closes at the bottom axis (y = height - paddingY)
    const startX = coords[0].x;
    const endX = coords[coords.length - 1].x;
    const bottomY = height - paddingY;
    const areaPath = `${linePath} L ${endX} ${bottomY} L ${startX} ${bottomY} Z`;

    return { linePath, areaPath, coords };
  };

  const incomePaths = generatePaths("income");
  const expensePaths = generatePaths("expense");

  return (
    <div className="flex-1 p-5 md:p-8 overflow-y-auto no-scrollbar space-y-6 animate-fade-in-up">
      {/* Title & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
        <div>
          <h3 className="font-display font-bold text-[#0b1c30] text-sm">
            Análisis Visual de Movimientos
          </h3>
          <p className="font-sans text-xs text-gray-500">
            Filtra y visualiza tus ingresos y gastos agregados
          </p>
        </div>
        
        {/* Button tabs */}
        <div className="flex flex-wrap gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100 self-start">
          {[
            { id: "7d", label: "7 Días" },
            { id: "1m", label: "1 Mes" },
            { id: "3m", label: "3 Meses" },
            { id: "6m", label: "6 Meses" },
            { id: "1y", label: "1 Año" },
            { id: "all", label: "Todo" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPeriod(item.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                period === item.id
                  ? "bg-[#0b1c30] text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category distribution */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="font-display font-bold text-[#0b1c30] text-sm flex items-center gap-1.5">
              <IconTrendingDown className="w-4 h-4 text-red-500" />
              Gastos por Categoría
            </h3>
            <p className="font-sans text-[11px] text-gray-400">
              Distribución proporcional del gasto en el período
            </p>
          </div>

          {totalExpense === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-xs font-sans">
              <span>No se registraron gastos en este período.</span>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {categoryData.map(({ category, amount, percentage }) => (
                <div key={category} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-sans">
                    <span className="font-semibold text-gray-600">{category}</span>
                    <span className="text-gray-500 font-semibold">
                      {formatCurrency(amount)}{" "}
                      <span className="text-gray-400 font-normal">({percentage}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-50 border border-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full transition-all duration-750"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
              
              <div className="pt-2 border-t border-gray-100 flex justify-between text-xs font-semibold text-gray-700 font-sans">
                <span>Gasto Total</span>
                <span>{formatCurrency(totalExpense)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Trend Chart */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4 relative">
          <div>
            <h3 className="font-display font-bold text-[#0b1c30] text-sm flex items-center gap-1.5">
              <IconTrendingUp className="w-4 h-4 text-emerald-500" />
              Tendencia de Movimientos
            </h3>
            <p className="font-sans text-[11px] text-gray-400">
              Comparativa de ingresos frente a egresos (cronológica)
            </p>
          </div>

          <div className="relative pt-2">
            {/* Legend */}
            <div className="flex justify-end gap-4 text-[10px] font-semibold text-gray-500 mb-2 font-sans">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
                <span>Ingresos</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-red-500 inline-block" />
                <span>Gastos</span>
              </div>
            </div>

            {/* SVG Chart */}
            <div className="relative">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto overflow-visible select-none"
              >
                {/* Gradients */}
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.00" />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Horizontal Gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const y = paddingY + ratio * chartHeight;
                  const gridVal = maxVal * (1 - ratio);
                  return (
                    <g key={ratio} className="opacity-40">
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={width - paddingX}
                        y2={y}
                        stroke="#E5E7EB"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={paddingX - 8}
                        y={y + 3}
                        textAnchor="end"
                        className="fill-gray-400 font-sans text-[8px] font-semibold"
                      >
                        S/ {formatNumber(Math.round(gridVal))}
                      </text>
                    </g>
                  );
                })}

                {/* Y Axis line */}
                <line
                  x1={paddingX}
                  y1={paddingY}
                  x2={paddingX}
                  y2={height - paddingY}
                  stroke="#E5E7EB"
                  strokeWidth="1.5"
                />

                {/* X Axis line */}
                <line
                  x1={paddingX}
                  y1={height - paddingY}
                  x2={width - paddingX}
                  y2={height - paddingY}
                  stroke="#E5E7EB"
                  strokeWidth="1.5"
                />

                {/* Income Area & Line */}
                {incomePaths.linePath && (
                  <>
                    <path d={incomePaths.areaPath} fill="url(#incomeGrad)" />
                    <path
                      d={incomePaths.linePath}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                )}

                {/* Expense Area & Line */}
                {expensePaths.linePath && (
                  <>
                    <path d={expensePaths.areaPath} fill="url(#expenseGrad)" />
                    <path
                      d={expensePaths.linePath}
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                )}

                {/* Interactive Points - Income (Emerald) */}
                {incomePaths.coords &&
                  incomePaths.coords.map((c, idx) => (
                    <circle
                      key={`inc-${idx}`}
                      cx={c.x}
                      cy={c.y}
                      r={hoveredPoint?.type === "income" && hoveredPoint?.x === c.x ? 5 : 3.5}
                      fill="#10B981"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() =>
                        setHoveredPoint({
                          dayLabel: trendData[idx].label,
                          type: "income",
                          amount: trendData[idx].income,
                          x: c.x,
                          y: c.y,
                        })
                      }
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  ))}

                {/* Interactive Points - Expense (Red) */}
                {expensePaths.coords &&
                  expensePaths.coords.map((c, idx) => (
                    <circle
                      key={`exp-${idx}`}
                      cx={c.x}
                      cy={c.y}
                      r={hoveredPoint?.type === "expense" && hoveredPoint?.x === c.x ? 5 : 3.5}
                      fill="#EF4444"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() =>
                        setHoveredPoint({
                          dayLabel: trendData[idx].label,
                          type: "expense",
                          amount: trendData[idx].expense,
                          x: c.x,
                          y: c.y,
                        })
                      }
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  ))}

                {/* X Axis Labels */}
                {trendData.map((d, index) => {
                  const x = paddingX + (index * chartWidth) / (trendData.length - 1);
                  return (
                    <text
                      key={index}
                      x={x}
                      y={height - paddingY + 14}
                      textAnchor="middle"
                      className="fill-gray-400 font-sans text-[8px] font-bold"
                    >
                      {d.label}
                    </text>
                  );
                })}
              </svg>

              {/* Hover Tooltip Overlay */}
              {hoveredPoint && (
                <div
                  className="absolute bg-[#0b1c30] text-white p-2 rounded-lg shadow-lg pointer-events-none text-[10px] font-sans z-20 flex flex-col gap-0.5"
                  style={{
                    left: `${(hoveredPoint.x / width) * 100}%`,
                    top: `${(hoveredPoint.y / height) * 100 - 24}%`,
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  <span className="font-semibold border-b border-white/10 pb-0.5 block text-white/70">
                    {hoveredPoint.dayLabel}
                  </span>
                  <span className="flex items-center gap-1 font-bold">
                    <span
                      className={`w-1.5 h-1.5 rounded-full inline-block ${
                        hoveredPoint.type === "income" ? "bg-emerald-400" : "bg-red-400"
                      }`}
                    />
                    {hoveredPoint.type === "income" ? "Ingreso" : "Gasto"}:{" "}
                    {formatCurrency(hoveredPoint.amount)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
