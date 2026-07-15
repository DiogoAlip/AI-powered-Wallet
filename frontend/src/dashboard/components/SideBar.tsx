import { useEffect, useState } from "react";
import {
  IconRobot,
  IconTrendingUp,
  IconWallet,
  IconSettings,
  IconX,
  IconLogout,
  IconMessage,
  IconPlus,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconUserCircle,
  IconChevronUp,
  IconShieldLock,
  IconInfoCircle,
} from "@tabler/icons-react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { useAuthStore } from "../../store/auth.store";
import { useFinancesStore } from "../../store/finances.store";

interface SideBarProps {
  isOpen: boolean;
  expanded: boolean;
  toggleSideBar: () => void;
  toggleExpanded: () => void;
}

const routes = [
  { id: "limits", label: "Estadísticas y Límites", icon: IconTrendingUp },
  { id: "history", label: "Historial de Gastos", icon: IconWallet },
  { id: "goals", label: "Mi Cuenta y Metas", icon: IconSettings },
];

/** Floating account menu shown above the account button */
function AccountMenu({
  user,
  isDemo,
  onLogout,
  onNavigate,
}: {
  user: { name: string; email: string } | null;
  isDemo: boolean;
  onLogout: () => void;
  onNavigate: (path: string) => void;
}) {
  return (
    <div className="absolute bottom-full left-2 right-2 mb-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in-up">
      {/* User info header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0">
            <p className="font-sans font-semibold text-sm text-[#0b1c30] truncate">{user?.name}</p>
            <p className="font-sans text-[11px] text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        {isDemo && (
          <div className="mt-2 flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span className="text-[11px] font-semibold text-amber-700">Entorno de Demostración</span>
          </div>
        )}
      </div>

      {/* Menu items */}
      <div className="py-1.5">
        <button
          onClick={() => onNavigate("/dashboard/profile")}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors text-left cursor-pointer"
        >
          <IconUserCircle className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="font-sans">Mi Perfil</span>
        </button>
        <button
          onClick={() => onNavigate("/dashboard/privacy")}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors text-left cursor-pointer"
        >
          <IconShieldLock className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="font-sans">Privacidad y Seguridad</span>
        </button>
        <button
          onClick={() => onNavigate("/dashboard/about")}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors text-left cursor-pointer"
        >
          <IconInfoCircle className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="font-sans">Acerca de FinancIA!</span>
        </button>
      </div>

      {/* Logout — separated */}
      <div className="border-t border-gray-100 py-1.5">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
        >
          <IconLogout className="w-4 h-4 shrink-0" />
          <span className="font-sans font-medium">Cerrar Sesión</span>
        </button>
      </div>

      {/* Version badge */}
      <div className="px-4 pb-2 flex justify-end">
        <span className="text-[10px] text-gray-300 font-sans">v2.1</span>
      </div>
    </div>
  );
}

function SideBarContent({
  expanded,
  toggleSideBar,
  toggleExpanded,
}: {
  expanded: boolean;
  toggleSideBar: () => void;
  toggleExpanded: () => void;
}) {
  const location = useLocation();
  const actualPath = location.pathname.toLocaleLowerCase();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const { chatSessions, loadChatSessions, dbReady } = useFinancesStore();
  const [accountOpen, setAccountOpen] = useState(false);

  const isDemo = user?.email === "demo@financia.com";

  useEffect(() => {
    if (dbReady) {
      loadChatSessions();
    }
  }, [dbReady, loadChatSessions]);

  // Close account menu on outside route change
  useEffect(() => {
    setAccountOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setAccountOpen(false);
    logout();
    toggleSideBar();
    navigate("/");
  };

  const handleNavigate = (path: string) => {
    setAccountOpen(false);
    navigate(path);
  };

  const getSessionLabel = (sessionId: string, idx: number) => {
    if (sessionId === "chat-1") return "Demostración FinancIA!";
    if (sessionId === "chat-welcome") return "Bienvenida";
    if (sessionId.startsWith("chat-")) {
      const ts = parseInt(sessionId.split("-")[1]);
      if (!isNaN(ts)) {
        const d = new Date(ts);
        return `${d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })} ${d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`;
      }
    }
    return `Chat #${idx + 1}`;
  };

  return (
    <div className="flex flex-col h-full bg-[#eff4ff] overflow-hidden">

      {/* ── Brand header ─────────────────────────────────────────────── */}
      <div
        className={`flex items-center shrink-0 transition-all duration-300 ${
          expanded ? "px-4 py-4 justify-between" : "px-2 py-4 justify-center"
        }`}
      >
        {expanded && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <IconRobot className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="font-sans font-bold text-sm text-[#0b1c30] truncate leading-tight">
                FinancIA!
              </h1>
              <p className="font-sans text-[10px] text-gray-400 truncate leading-tight">
                Inteligencia Activa
              </p>
            </div>
          </div>
        )}

        {/* Collapse toggle — desktop */}
        <button
          onClick={toggleExpanded}
          title={expanded ? "Contraer" : "Expandir"}
          className="hidden md:flex p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200/70 transition-colors shrink-0"
        >
          {expanded ? (
            <IconLayoutSidebarLeftCollapse className="w-5 h-5" />
          ) : (
            <IconLayoutSidebarLeftExpand className="w-5 h-5" />
          )}
        </button>

        {/* Mobile close */}
        <button
          onClick={toggleSideBar}
          className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 transition-colors md:hidden"
        >
          <IconX className="w-4 h-4" />
        </button>
      </div>

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav className="flex-1 py-1 overflow-y-auto no-scrollbar">
        <ul className={`space-y-0.5 ${expanded ? "px-2" : "px-1.5"}`}>

          {/* New Chat */}
          <li>
            <NavLink
              to="/dashboard/chat"
              onClick={toggleSideBar}
              title={!expanded ? "Nuevo Chat" : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl transition-all duration-200 font-sans text-sm ${
                  expanded ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"
                } ${
                  isActive && location.pathname === "/dashboard/chat"
                    ? "bg-[#dce9ff] text-[#0b1c30] font-semibold"
                    : "text-gray-500 hover:bg-[#dce9ff]/60 hover:text-[#0b1c30]"
                }`
              }
            >
              <IconPlus className="w-4 h-4 shrink-0" />
              {expanded && <span className="truncate">Nuevo Chat</span>}
            </NavLink>
          </li>

          {/* Chat sessions */}
          {expanded && chatSessions.length > 0 && (
            <li>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 pt-3 pb-1">
                Conversaciones
              </p>
              <ul className="space-y-0.5">
                {chatSessions.map((sessionId, idx) => {
                  const isActive = location.pathname === `/dashboard/chat/${sessionId}`;
                  return (
                    <li key={sessionId}>
                      <NavLink
                        to={`/dashboard/chat/${sessionId}`}
                        onClick={toggleSideBar}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-xs font-sans ${
                          isActive
                            ? "bg-teal-100 text-teal-800 font-semibold"
                            : "text-gray-500 hover:text-[#0b1c30] hover:bg-[#dce9ff]/60"
                        }`}
                      >
                        <IconMessage className="w-3.5 h-3.5 shrink-0 opacity-60" />
                        <span className="truncate">{getSessionLabel(sessionId, idx)}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </li>
          )}

          {/* Section divider */}
          {expanded ? (
            <li className="pt-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 pb-1">
                Menú
              </p>
            </li>
          ) : (
            <li className="pt-2 border-t border-gray-200/70 mx-1" />
          )}

          {/* Route links */}
          {routes.map((item) => (
            <li key={item.id}>
              <NavLink
                to={`/dashboard/${item.id}`}
                onClick={toggleSideBar}
                title={!expanded ? item.label : undefined}
                className={`flex items-center gap-3 rounded-xl transition-all duration-200 font-sans text-sm ${
                  expanded ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"
                } ${
                  actualPath.includes(item.id)
                    ? "bg-[#dce9ff] text-[#0b1c30] font-semibold"
                    : "text-gray-500 hover:bg-[#dce9ff]/60 hover:text-[#0b1c30]"
                }`}
              >
                <item.icon
                  className={`w-4 h-4 shrink-0 ${
                    actualPath.includes(item.id) ? "text-teal-700" : "text-gray-400"
                  }`}
                />
                {expanded && <span className="truncate">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Account panel ────────────────────────────────────────────── */}
      <div className={`shrink-0 border-t border-gray-200/80 ${expanded ? "p-2" : "p-1.5"} relative`}>
        {/* Floating menu */}
        {accountOpen && (
          <AccountMenu user={user} isDemo={isDemo} onLogout={handleLogout} onNavigate={handleNavigate} />
        )}

        {/* Account trigger button */}
        <button
          onClick={() => setAccountOpen((o) => !o)}
          title={!expanded ? (user?.name ?? "Cuenta") : undefined}
          className={`w-full flex items-center gap-3 rounded-xl transition-all duration-200 hover:bg-white/80 hover:shadow-sm cursor-pointer ${
            expanded ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"
          } ${accountOpen ? "bg-white shadow-sm" : ""}`}
        >
          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>

          {expanded && (
            <>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-sans font-semibold text-xs text-[#0b1c30] truncate leading-tight">
                  {user?.name}
                </p>
                <p className="font-sans text-[10px] text-gray-400 truncate leading-tight">
                  {user?.email}
                </p>
              </div>
              <IconChevronUp
                className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform duration-200 ${
                  accountOpen ? "rotate-0" : "rotate-180"
                }`}
              />
            </>
          )}
        </button>

        {/* Demo badge — shown only when expanded */}
        {expanded && isDemo && (
          <div className="mt-1.5 mx-1 flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 rounded-lg px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span className="text-[10px] font-semibold text-amber-600 truncate">Entorno Demo</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function SideBar({ isOpen, expanded, toggleSideBar, toggleExpanded }: SideBarProps) {
  return (
    <>
      {/* ── Mobile backdrop ──────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-55 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSideBar}
      />

      {/* ── Mobile drawer ────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-60 w-72 shadow-xl transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SideBarContent expanded={true} toggleSideBar={toggleSideBar} toggleExpanded={toggleExpanded} />
      </aside>

      {/* ── Desktop permanent sidebar ─────────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col fixed inset-y-0 left-0 z-40 border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out ${
          expanded ? "w-64" : "w-16"
        }`}
      >
        <SideBarContent expanded={expanded} toggleSideBar={() => {}} toggleExpanded={toggleExpanded} />
      </aside>
    </>
  );
}
