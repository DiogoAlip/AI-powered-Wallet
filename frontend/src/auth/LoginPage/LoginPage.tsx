import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  IconEye,
  IconEyeOff,
  IconArrowNarrowRight,
  IconLock,
  IconMail,
} from "@tabler/icons-react";
import { useAuthStore } from "../../store/auth.store";
import { AuthSidebar } from "../components/AuthSidebar";

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await login(email, password);
      navigate("/dashboard/chat");
    } catch (err: any) {
      alert(err.message || "Error al iniciar sesión");
    }
  };
  return (
    <div className="flex flex-col md:flex-row flex-1">
      <AuthSidebar
        title="Gestión financiera inteligente, simplificada."
        subtitle="Nuestros análisis basados en IA te ayudan a realizar el seguimiento, planificar y optimizar tu futuro financiero con precisión y seguridad de nivel empresarial."
      />

      {/* Right Side: Form Container */}
      <div className="w-full md:w-2/5 bg-white text-gray-900 py-8 px-10 md:py-16 md:px-20 flex flex-col justify-center">
        <div className="w-full max-w-md mx-auto">
          {/* Heading */}
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">
            Bienvenido de nuevo
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Inicia sesión para gestionar tu cartera inteligente.
          </p>

          {/* Social Logins */}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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
                className="ml-2 block text-xs text-gray-600 font-medium"
              >
                Mantener mi sesión iniciada por 30 días
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[#0d1527] text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors mt-2"
            >
              Iniciar Sesión
              <IconArrowNarrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Signup Link */}
          <p className="text-center text-base text-gray-500 mt-8">
            ¿No tienes una cuenta?{" "}
            <Link
              to="/auth/register"
              className="font-semibold text-teal-600 hover:underline"
            >
              Comenzar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
