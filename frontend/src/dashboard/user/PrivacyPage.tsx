import { useState } from "react";
import {
  IconShieldLock,
  IconDatabase,
  IconTrash,
  IconAlertTriangle,
  IconCheck,
  IconKey,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import { useAuthStore } from "../../store/auth.store";
import { useFinancesStore } from "../../store/finances.store";
import { useNavigate } from "react-router";

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-colors relative flex items-center shrink-0 cursor-pointer ${
        checked ? "bg-[#006a61]" : "bg-gray-200"
      }`}
    >
      <div
        className={`w-4 h-4 rounded-full bg-white transition-transform shadow-sm absolute ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export function PrivacyPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const clearUserDatabase = useFinancesStore((s) => s.clearUserDatabase);
  const navigate = useNavigate();

  const [localOnly, setLocalOnly] = useState(true);
  const [analyticsOptOut, setAnalyticsOptOut] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const apiKeyDisplay = import.meta.env.VITE_GEMINI_API_KEY
    ? "••••••••••••••••••••••••••••••••"
    : "No configurada";

  const handleDeleteData = () => {
    clearUserDatabase();
    logout();
    setDeleted(true);
    setTimeout(() => navigate("/"), 1500);
  };

  return (
    <div className="flex-1 p-5 md:p-8 overflow-y-auto no-scrollbar space-y-6 animate-fade-in-up">
      {/* Title */}
      <div>
        <h1 className="font-display font-bold text-xl text-[#0b1c30]">Privacidad y Seguridad</h1>
        <p className="font-sans text-xs text-gray-400 mt-0.5">
          Controla cómo se almacenan y protegen tus datos financieros.
        </p>
      </div>

      {/* Data storage info */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
            <IconDatabase className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-[#0b1c30]">
              Almacenamiento de Datos
            </h3>
            <p className="font-sans text-[11px] text-gray-400">
              Tus datos nunca salen de tu dispositivo.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[#0b1c30] block">
                Almacenamiento 100% local
              </span>
              <span className="text-[11px] text-gray-400 block">
                Todos los datos se guardan en SQLite dentro de tu navegador mediante IndexedDB.
                Ningún servidor externo recibe tu información.
              </span>
            </div>
            <ToggleSwitch checked={localOnly} onChange={() => setLocalOnly(!localOnly)} />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[#0b1c30] block">
                Opt-out de telemetría anónima
              </span>
              <span className="text-[11px] text-gray-400 block">
                Desactiva el envío de estadísticas de uso agregadas y anónimas.
              </span>
            </div>
            <ToggleSwitch
              checked={analyticsOptOut}
              onChange={() => setAnalyticsOptOut(!analyticsOptOut)}
            />
          </div>
        </div>
      </div>

      {/* API Key */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <IconKey className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-[#0b1c30]">Clave de API Gemini</h3>
            <p className="font-sans text-[11px] text-gray-400">
              Requerida para habilitar el asistente FinancIA! con IA real.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            VITE_GEMINI_API_KEY
          </label>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
            <code className="flex-1 font-mono text-xs text-[#0b1c30] truncate">
              {showApiKey && import.meta.env.VITE_GEMINI_API_KEY
                ? import.meta.env.VITE_GEMINI_API_KEY
                : apiKeyDisplay}
            </code>
            <button
              onClick={() => setShowApiKey((s) => !s)}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer shrink-0"
            >
              {showApiKey ? (
                <IconEyeOff className="w-4 h-4" />
              ) : (
                <IconEye className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-[11px] text-gray-400">
            Configura esta variable en tu archivo{" "}
            <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-600">.env.local</code>{" "}
            para activar las respuestas inteligentes de Gemini.
          </p>
        </div>
      </div>

      {/* Session info */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-3">
        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
            <IconShieldLock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-[#0b1c30]">Sesión Activa</h3>
            <p className="font-sans text-[11px] text-gray-400">Información de tu sesión actual.</p>
          </div>
        </div>
        <dl className="space-y-2">
          {[
            { label: "Usuario", value: user?.email ?? "—" },
            { label: "Tipo de sesión", value: "Persistente (localStorage)" },
            { label: "Cifrado de datos", value: "Navegador nativo (IndexedDB)" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-xs">
              <dt className="text-gray-400">{label}</dt>
              <dd className="font-semibold text-[#0b1c30] text-right max-w-[60%] truncate">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Danger zone */}
      <div className="bg-white border border-red-100 rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3 pb-2 border-b border-red-100">
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
            <IconTrash className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-red-600">Zona de Peligro</h3>
            <p className="font-sans text-[11px] text-gray-400">
              Acciones irreversibles sobre tu cuenta y datos.
            </p>
          </div>
        </div>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 font-sans text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <IconTrash className="w-3.5 h-3.5" />
            Eliminar todos mis datos y cuenta
          </button>
        ) : deleted ? (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold animate-fade-in">
            <IconCheck className="w-4 h-4 text-emerald-500" />
            Datos eliminados. Redirigiendo…
          </div>
        ) : (
          <div className="space-y-3 p-4 bg-red-50 border border-red-100 rounded-xl">
            <div className="flex items-start gap-2">
              <IconAlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 leading-relaxed">
                Esta acción eliminará permanentemente todos tus datos locales (transacciones,
                presupuestos, chats, metas y configuración) y cerrará tu sesión. No se puede deshacer.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteData}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-sans text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Sí, eliminar todo
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-sans text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
