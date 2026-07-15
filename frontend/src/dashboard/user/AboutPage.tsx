import {
  IconRobot,
  IconBrandGithub,
  IconShield,
  IconDatabase,
  IconSparkles,
  IconHeart,
} from "@tabler/icons-react";

const FEATURES = [
  {
    icon: IconRobot,
    title: "Asistente FinancIA!",
    desc: "Conversaciones en lenguaje natural con Gemini para analizar tus finanzas en tiempo real.",
    color: "teal",
  },
  {
    icon: IconDatabase,
    title: "SQLite Local",
    desc: "Todos tus datos viven en una base de datos SQLite dentro de tu navegador. Sin servidores.",
    color: "blue",
  },
  {
    icon: IconShield,
    title: "Privacidad Total",
    desc: "Tu información financiera nunca sale de tu dispositivo. Cifrado nativo del navegador.",
    color: "purple",
  },
  {
    icon: IconSparkles,
    title: "IA Proactiva",
    desc: "Sugerencias automáticas de ahorro y alertas de presupuesto generadas con Gemini AI.",
    color: "amber",
  },
];

const colorMap: Record<string, string> = {
  teal: "bg-teal-50 text-teal-600",
  blue: "bg-blue-50 text-blue-500",
  purple: "bg-purple-50 text-purple-500",
  amber: "bg-amber-50 text-amber-500",
};

const TECH_STACK = [
  "React 19",
  "TypeScript",
  "Vite 8",
  "Zustand",
  "sql.js (SQLite/WASM)",
  "IndexedDB",
  "Gemini AI",
  "Tailwind CSS",
  "Tabler Icons",
  "React Router v7",
];

export function AboutPage() {
  return (
    <div className="flex-1 p-5 md:p-8 overflow-y-auto no-scrollbar space-y-6 animate-fade-in-up">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0b1c30] to-[#006a61] rounded-2xl p-8 text-white text-center space-y-3 shadow-lg">
        <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto backdrop-blur-sm">
          <IconRobot className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl tracking-tight">FinancIA!</h1>
          <p className="font-sans text-sm text-white/70 mt-1">
            Tu asistente financiero personal con inteligencia artificial
          </p>
        </div>
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          Versión 2.1 — Julio 2026
        </div>
      </div>

      {/* Features */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
        <h2 className="font-display font-bold text-sm text-[#0b1c30] pb-2 border-b border-gray-100">
          Funcionalidades Principales
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="flex items-start gap-3 p-4 bg-gray-50/60 rounded-xl border border-gray-100"
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color]}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-xs text-[#0b1c30]">{title}</h3>
                <p className="font-sans text-[11px] text-gray-400 leading-relaxed mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-3">
        <h2 className="font-display font-bold text-sm text-[#0b1c30] pb-2 border-b border-gray-100">
          Tecnologías Utilizadas
        </h2>
        <div className="flex flex-wrap gap-2">
          {TECH_STACK.map((tech) => (
            <span
              key={tech}
              className="text-[11px] font-semibold text-[#006a61] bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-full"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-3">
        <h2 className="font-display font-bold text-sm text-[#0b1c30] pb-2 border-b border-gray-100">
          Recursos
        </h2>
        <div className="space-y-2">
          <a
            href="https://github.com/DiogoAlip/AI-powered-Wallet"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0">
              <IconBrandGithub className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="font-sans text-xs font-semibold text-[#0b1c30]">Repositorio GitHub</p>
              <p className="font-sans text-[11px] text-gray-400">DiogoAlip/AI-powered-Wallet</p>
            </div>
          </a>
        </div>
      </div>

      {/* Footer credit */}
      <div className="text-center py-2">
        <p className="font-sans text-xs text-gray-300 flex items-center justify-center gap-1.5">
          Hecho con <IconHeart className="w-3.5 h-3.5 text-red-400 fill-red-400" /> por el equipo FinancIA! · v2.1
        </p>
      </div>
    </div>
  );
}
