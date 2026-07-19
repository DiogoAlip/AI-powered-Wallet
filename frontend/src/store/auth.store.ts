import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (name: string, email: string, password?: string) => Promise<void>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email, password) => {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Error al iniciar sesión");
        }
        const data = await res.json();
        set({ user: data.user, isAuthenticated: true });
      },
      register: async (name, email, password) => {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Error al registrarse");
        }
        const data = await res.json();
        set({ user: data.user, isAuthenticated: true });
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      changePassword: async (currentPassword, newPassword) => {
        const email = useAuthStore.getState().user?.email;
        if (!email) throw new Error("No hay una sesión activa de usuario.");

        const res = await fetch("/api/auth/change-password", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": email,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Error al cambiar la contraseña");
        }
      },
        }),
    {
      name: "financia-auth-storage",
    }
  )
);
