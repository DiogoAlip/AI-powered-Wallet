import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  IconEye,
  IconEyeOff,
  IconArrowNarrowRight,
  IconBrandAppleFilled,
  IconLock,
  IconMail,
  IconUser,
} from "@tabler/icons-react";
import { useAuthStore } from "../../store/auth.store";
import { AuthSidebar } from "../components/AuthSidebar";

export const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const register = useAuthStore((state) => state.register);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    register(name, email);
    navigate("/dashboard/chat");
  };
  return (
    <div className="flex flex-col md:flex-row flex-1">
      <AuthSidebar
        title={
          <>
            Asegura tu futuro con{" "}
            <span className="text-teal-400">inteligencia</span>
          </>
        }
        subtitle="Experimenta la próxima generación en gestión de patrimonio. Nuestra IA no solo hace seguimiento de tus gastos; predice oportunidades y asegura tu legado financiero."
      />

      {/* Right Side: Form Container */}
      <div className="w-full md:w-2/5 bg-white text-gray-900 py-8 px-10 md:py-16 md:px-20 flex flex-col justify-center">
        <div className="w-full max-w-md mx-auto">
          {/* Heading */}
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">
            Crear cuenta
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Únete a FinancIA! y comienza tu camino hoy.
          </p>

          {/* Social Logins */}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Nombre Completo
              </label>
              <div className="w-full flex gap-2 px-2 items-center border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-800 tracking-widest text-gray-900">
                <IconUser className="text-gray-600" />
                <input
                  type="text"
                  placeholder="Juan Pérez"
                  className="w-full py-2 focus:outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Dirección de Correo Electrónico
              </label>
              <div className="w-full flex gap-2 px-2 items-center border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-800 tracking-widest text-gray-900">
                <IconMail className="text-gray-600" />
                <input
                  type="email"
                  placeholder="nombre@empresa.com"
                  className="w-full py-2 focus:outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-gray-700">
                  Contraseña
                </label>
                <a
                  href="#"
                  className="text-xs font-semibold text-teal-600 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <div className="w-full items-center flex gap-2 px-2 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-800 tracking-widest text-gray-900">
                  <IconLock className="text-gray-600" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full py-2 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <IconEyeOff className="w-4 h-4" />
                  ) : (
                    <IconEye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <label className="block text-xs text-gray-700 my-1">
                Debe tener al menos 8 caracteres.
              </label>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-xs text-gray-600"
              >
                Acepto los{" "}
                <span className="text-teal-700">Términos de Servicio</span> y la{" "}
                <span className="text-teal-700">Política de Privacidad</span>, incluyendo
                el procesamiento de mis datos financieros por la IA.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[#0d1527] text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors mt-2"
            >
              Crear cuenta
              <IconArrowNarrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-4 items-center m-6">
            <div className="grow border-t border-gray-200"></div>
            <span className="shrink mx-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              O registrarse con
            </span>
            <div className="grow border-t border-gray-200"></div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors text-gray-700">
              {/* Simplified Flat Google G Icon */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.28 1.5-.125 2.77-1.08 3.42v2.84h1.74c4.12-3.79 6.48-9.38 6.48-15.11z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.86-3c-1.08.72-2.45 1.16-4.1 1.16-3.15 0-5.81-2.13-6.76-5.01H1.36v3.1C3.33 21.28 7.41 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.24 14.24a7.16 7.16 0 0 1 0-4.48V6.66H1.36a11.93 11.93 0 0 0 0 10.68l3.88-3.1z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.96 1.19 15.24 0 12 0 7.41 0 3.33 2.72 1.36 6.66l3.88 3.1c.95-2.88 3.61-5.01 6.76-5.01z"
                />
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors text-gray-700">
              <IconBrandAppleFilled className="w-4 h-4 text-gray-600" />
              Apple
            </button>
          </div>

          {/* Demo Accounts Section */}
          <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
            <h4 className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
              Probar con datos de demostración
            </h4>
            <button
              type="button"
              onClick={() => {
                login("demo@financia.com", "Socio FinancIA! Pro");
                navigate("/dashboard/chat");
              }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-teal-50 border border-teal-100 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold cursor-pointer transition-all transform hover:scale-[1.01]"
            >
              Usuario Demo
            </button>
          </div>

          {/* Signup Link */}
          <p className="text-center text-xs text-gray-500 mt-8">
            ¿Ya tienes una cuenta?{" "}
            <Link
              to="/auth/login"
              className="font-semibold text-teal-600 hover:underline"
            >
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
