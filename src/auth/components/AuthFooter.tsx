export const AuthFooter = () => {
  return (
    <footer className="bg-[#090f1c] border-t border-white/5 px-8 md:px-16 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
      <div className="flex flex-col items-center md:items-start gap-1">
        <span className="text-sm font-bold text-white tracking-tight">
          SpendWise AI
        </span>
        <p>© 2024 SpendWise AI. All rights reserved.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-6 text-gray-400">
        <a href="#" className="hover:text-white transition-colors">
          Privacy Policy
        </a>
        <a href="#" className="hover:text-white transition-colors">
          Terms of Service
        </a>
        <a href="#" className="hover:text-white transition-colors">
          Security
        </a>
        <a href="#" className="hover:text-white transition-colors">
          Contact Us
        </a>
      </div>
    </footer>
  );
};
