import { useState } from "react";
import {
  IconUserCircle,
  IconMail,
  IconDeviceFloppy,
  IconCheck,
  IconEdit,
} from "@tabler/icons-react";
import { useAuthStore } from "../../store/auth.store";

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const isDemo = user?.email === "demo@financia.com";

  const [name, setName] = useState(user?.name ?? "");
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleSave = () => {
    // In a real app this would persist to backend; here we just give feedback
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex-1 p-5 md:p-8 overflow-y-auto no-scrollbar space-y-6 animate-fade-in-up">
      {/* Page title */}
      <div>
        <h1 className="font-display font-bold text-xl text-[#0b1c30]">Mi Perfil</h1>
        <p className="font-sans text-xs text-gray-400 mt-0.5">
          Gestiona tu información personal y preferencias de cuenta.
        </p>
      </div>

      {/* Avatar + identity */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row items-center gap-6">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-3xl shadow-md">
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          {isDemo && (
            <span className="absolute -bottom-1 -right-1 bg-amber-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow">
              DEMO
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
          <h2 className="font-display font-bold text-[#0b1c30] text-lg truncate">
            {user?.name}
          </h2>
          <p className="font-sans text-xs text-gray-400 truncate">{user?.email}</p>
          <span className="inline-block text-[10px] font-bold tracking-wider uppercase bg-[#86f2e4]/30 text-[#006f66] px-2 py-0.5 rounded-full">
            IA Activa
          </span>
        </div>
      </div>

      {/* Edit name */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h3 className="font-display font-bold text-sm text-[#0b1c30]">
            Información Personal
          </h3>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-700 font-semibold transition-colors cursor-pointer"
            >
              <IconEdit className="w-3.5 h-3.5" />
              Editar
            </button>
          )}
        </div>

        {/* Name field */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <IconUserCircle className="w-3.5 h-3.5" />
            Nombre completo
          </label>
          {editing ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#f8f9ff] border border-gray-200 focus:border-teal-400 focus:ring-1 focus:ring-teal-100 rounded-xl px-3 py-2.5 font-sans text-sm text-[#0b1c30] outline-none transition-all"
            />
          ) : (
            <p className="font-sans text-sm text-[#0b1c30] px-3 py-2.5 bg-gray-50 rounded-xl">
              {name || "—"}
            </p>
          )}
        </div>

        {/* Email field (read-only) */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <IconMail className="w-3.5 h-3.5" />
            Correo electrónico
          </label>
          <p className="font-sans text-sm text-gray-400 px-3 py-2.5 bg-gray-50 rounded-xl">
            {user?.email}
            <span className="ml-2 text-[10px] text-gray-300">(no editable)</span>
          </p>
        </div>

        {editing && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-[#006a61] hover:bg-teal-700 text-white font-sans text-xs font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              <IconDeviceFloppy className="w-3.5 h-3.5" />
              Guardar cambios
            </button>
            <button
              onClick={() => { setEditing(false); setName(user?.name ?? ""); }}
              className="px-4 py-2 border border-gray-200 text-gray-500 hover:bg-gray-50 font-sans text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        )}

        {saved && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold animate-fade-in">
            <IconCheck className="w-4 h-4 text-emerald-500" />
            Cambios guardados correctamente.
          </div>
        )}
      </div>

      {/* Account details */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-3">
        <h4 className="font-display font-bold text-xs text-[#0b1c30]">Detalles de la Cuenta</h4>
        <dl className="space-y-2">
          {[
            { label: "Plan", value: isDemo ? "Demo gratuito" : "Pro" },
            { label: "Almacenamiento", value: "SQLite local en tu navegador" },
            { label: "Región", value: "Datos 100% locales — sin servidor" },
            { label: "Versión", value: "v2.1" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-xs">
              <dt className="text-gray-400">{label}</dt>
              <dd className="font-semibold text-[#0b1c30]">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
