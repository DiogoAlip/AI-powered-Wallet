import { IconStar } from "@tabler/icons-react";

export function TestimonialSection() {
  return (
    <section className="bg-[#131b2e] text-white py-16 md:py-24 px-6 relative overflow-hidden">
      {/* Abstract teal glow */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center space-y-6">
        <div className="flex justify-center gap-1">
          {[...Array(5)].map((_, i) => (
            <IconStar
              key={i}
              className="w-5 h-5 text-teal-400 fill-teal-400"
            />
          ))}
        </div>

        <blockquote className="font-display font-extrabold text-xl md:text-3xl lg:text-4xl text-gray-100 leading-relaxed">
          "FinancIA! transformó mi relación con el dinero. Las perspectivas de la IA
          identificaron $200 en fugas mensuales que no sabía que existían. Es como
          tener un asesor financiero en el bolsillo las 24 horas, los 7 días de la semana."
        </blockquote>

        <div className="flex flex-col items-center gap-2 pt-4">
          <img
            className="w-14 h-14 rounded-full border-2 border-teal-400 object-cover shadow-md"
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
            alt="Perfil de Sarah Jenkins"
          />
          <div>
            <span className="font-sans font-bold text-sm block text-teal-300">
              Sarah Jenkins
            </span>
            <span className="font-sans text-xs text-gray-400 block">
              Diseñadora Senior, Techflow
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
