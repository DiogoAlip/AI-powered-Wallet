import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  name: string;
  email: string;
}

    interface AuthState {
      user: User | null;
      isAuthenticated: boolean;
      login: (email: string) => Promise<void>;
      register: (name: string, email: string) => Promise<void>;
      logout: () => void;
    }

    export const useAuthStore = create<AuthState>()(
      persist(
        (set) => ({
          user: null,
          isAuthenticated: false,
          login: async (email) => {
            const res = await fetch("/api/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            });
            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.error || "Error al iniciar sesión");
            }
            const data = await res.json();
            set({ user: data.user, isAuthenticated: true });
          },
          register: async (name, email) => {
            const res = await fetch("/api/auth/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name, email }),
            });
            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.error || "Error al registrarse");
            }
            const data = await res.json();
            set({ user: data.user, isAuthenticated: true });
          },
          logout: () => set({ user: null, isAuthenticated: false }),
        }),
    {
      name: "financia-auth-storage",
    }
  )
);
