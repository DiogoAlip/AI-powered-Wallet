export const AuthFooter = () => {
  return (
    <footer className="bg-[#090f1c] border-t border-white/5 px-8 md:px-16 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
      <div className="flex flex-col items-center md:items-start gap-1">
        <span className="text-sm font-bold text-white tracking-tight">
          FinancIA!
        </span>
        <p>© 2024 FinancIA!. Todos los derechos reservados.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-6 text-gray-400">
        <a href="#" className="hover:text-white transition-colors">
          Política de Privacidad
        </a>
        <a href="#" className="hover:text-white transition-colors">
          Términos de Servicio
        </a>
        <a href="#" className="hover:text-white transition-colors">
          Seguridad
        </a>
        <a href="#" className="hover:text-white transition-colors">
          Contáctanos
        </a>
      </div>
    </footer>
  );
};
