import React from "react";
import { IconShield, IconSparkles2 } from "@tabler/icons-react";
import { Link } from "react-router";

interface AuthSidebarProps {
  title: React.ReactNode;
  subtitle: string;
}

export const AuthSidebar: React.FC<AuthSidebarProps> = ({ title, subtitle }) => {
  return (
    <div className="w-full md:w-3/5 bg-[#0d1527] p-8 md:p-16 flex flex-col justify-between min-h-125 md:min-h-0">
      {/* Logo Top */}
      <div>
        <Link to="/" className="inline-block">
          <h2 className="text-xl font-bold tracking-tight text-white hover:text-teal-400 transition-colors">
            FinancIA!
          </h2>
        </Link>
      </div>

      {/* Hero Content */}
      <div className="max-w-xl my-auto py-12">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight text-white mb-6">
          {title}
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed mb-8">
          {subtitle}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 text-gray-200 text-sm border border-white/10 backdrop-blur-sm">
            <IconSparkles2 className="w-4 h-4 text-teal-400" />
            Ahorro Potencial Identificado
          </span>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 text-gray-200 text-sm border border-white/10 backdrop-blur-sm">
            <IconShield className="w-4 h-4 text-teal-400" />
            Cifrado de Nivel Bancario
          </span>
        </div>
      </div>

      {/* Social Proof Footer */}
      <div className="flex items-center gap-3 pt-6">
        <div className="flex -space-x-3">
          <img
            className="w-9 h-9 rounded-full border-2 border-[#0d1527] object-cover"
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
            alt="User 1"
          />
          <img
            className="w-9 h-9 rounded-full border-2 border-[#0d1527] object-cover"
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
            alt="User 2"
          />
          <img
            className="w-9 h-9 rounded-full border-2 border-[#0d1527] object-cover"
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
            alt="User 3"
          />
        </div>
        <p className="text-xs text-gray-400">
          Más de{" "}
          <span className="text-gray-300 font-medium">10k personas</span>{" "}
          gestionando su dinero este mes
        </p>
      </div>
    </div>
  );
};
