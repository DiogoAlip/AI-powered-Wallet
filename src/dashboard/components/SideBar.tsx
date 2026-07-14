import { useEffect } from "react";
import {
  IconRobot,
  IconTrendingUp,
  IconWallet,
  IconSettings,
  IconX,
  IconLogout,
} from "@tabler/icons-react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { useAuthStore } from "../../store/auth.store";
import { useFinancesStore } from "../../store/finances.store";

interface SideBar {
  isOpen: boolean;
  toggleSideBar: () => void;
}

const routes = [
  { id: "chat", label: "Nuevo Chat", icon: IconRobot },
  {
    id: "limits",
    label: "Estadísticas y Límites",
    icon: IconTrendingUp,
  },
  { id: "history", label: "Historial de Gastos", icon: IconWallet },
  { id: "goals", label: "Mi Cuenta y Metas", icon: IconSettings },
];

export function SideBar({ isOpen, toggleSideBar }: SideBar) {
  const location = useLocation();
  const actualPath = location.pathname.toLocaleLowerCase();
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const { chatSessions, loadChatSessions } = useFinancesStore();

  useEffect(() => {
    loadChatSessions();
  }, [loadChatSessions]);

  const handleLogout = () => {
    logout();
    toggleSideBar();
    navigate("/");
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-55 transition-opacity duration-300 ${isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
          }`}
        onClick={toggleSideBar}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-60 flex flex-col bg-[#eff4ff] h-full w-72 rounded-r-2xl shadow-xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="p-5 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700">
              <IconRobot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-sm text-[#0b1c30]">
                FinancIA! Pro
              </h3>
              <p className="font-sans text-xs text-gray-500">
                Inteligencia Activa
              </p>
            </div>
          </div>
          <button
            onClick={toggleSideBar}
            className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto no-scrollbar">
          <ul className="space-y-1 px-2">
            {routes.map((item) => {
              return (
                <li key={item.id}>
                  <NavLink
                    to={`/dashboard/${item.id}`}
                    onClick={() => {
                      toggleSideBar();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      item.id === "chat" && (location.pathname === "/dashboard/chat" || location.pathname === "/dashboard/chat/")
                        ? "bg-[#dce9ff] text-[#0b1c30] font-semibold"
                        : actualPath.includes(item.id) && item.id !== "chat"
                        ? "bg-[#dce9ff] text-[#0b1c30] font-semibold"
                        : "text-gray-600 hover:bg-[#dce9ff]/50"
                    }`}
                  >
                    <item.icon
                      className={`w-5 h-5 ${
                        (item.id === "chat" && (location.pathname === "/dashboard/chat" || location.pathname === "/dashboard/chat/")) ||
                        (actualPath.includes(item.id) && item.id !== "chat")
                          ? "text-teal-700"
                          : "text-gray-500"
                      }`}
                    />
                    <span className="font-sans text-sm">{item.label}</span>
                  </NavLink>

                  {item.id === "chat" && chatSessions.length > 0 && (
                    <ul className="pl-6 pr-2 mt-1.5 space-y-1.5 border-l border-gray-200/60 ml-6">
                      {chatSessions.map((sessionId, idx) => {
                        const isActiveSession = location.pathname === `/dashboard/chat/${sessionId}`;
                        let displayLabel = `Conversación #${idx + 1}`;
                        if (sessionId === "chat-1") {
                          displayLabel = "Demostración FinancIA!";
                        } else if (sessionId === "chat-welcome") {
                          displayLabel = "Mensaje de Bienvenida";
                        } else if (sessionId.startsWith("chat-")) {
                          const ts = parseInt(sessionId.split("-")[1]);
                          if (!isNaN(ts)) {
                            const d = new Date(ts);
                            displayLabel = `Chat: ${d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })} ${d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`;
                          }
                        }

                        return (
                          <li key={sessionId}>
                            <NavLink
                              to={`/dashboard/chat/${sessionId}`}
                              onClick={() => {
                                toggleSideBar();
                              }}
                              className={`w-full block px-3 py-1.5 rounded-lg text-xs font-sans transition-all truncate ${
                                isActiveSession
                                  ? "bg-teal-50 text-teal-800 font-bold border-l-2 border-teal-600 pl-2"
                                  : "text-gray-500 hover:text-[#0b1c30] hover:bg-gray-200/50"
                              }`}
                            >
                              {displayLabel}
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
            <li className="pt-4 border-t border-gray-200/50 mt-4 mx-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-red-600 hover:bg-red-50 cursor-pointer"
              >
                <IconLogout className="w-5 h-5 text-red-500" />
                <span className="font-sans text-sm font-semibold">Cerrar Sesión</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200 bg-[#e5eeff]/50 flex items-center justify-between rounded-br-2xl">
          <span className="text-xs text-gray-500">Versión de la App</span>
          <span className="font-sans text-[11px] font-semibold text-teal-700 px-2 py-0.5 bg-teal-100 rounded-full">
            v2.1
          </span>
        </div>
      </aside>
    </>
  );
}
