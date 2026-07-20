export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="bg-teal-50/40 py-16 md:py-24 px-6 border-y border-gray-100"
    >
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h3 className="font-display font-extrabold text-2xl md:text-4xl text-[#0b1c30]">
            Control sin Esfuerzo
          </h3>
          <p className="font-sans text-sm md:text-base text-gray-500 max-w-xl mx-auto">
            FinancIA! elimina la fricción de la gestión financiera con un
            flujo de trabajo simplificado de tres pasos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          {[
            {
              num: "1",
              title: "Conecta tus Cuentas",
              desc: "Sincroniza de forma segura tus bancos y tarjetas con encriptación de nivel bancario en segundos. Sin configuraciones complejas.",
            },
            {
              num: "2",
              title: "Registra Gastos por Chat",
              desc: 'Simplemente escribe "Cena de S/ 45 en Green Cafe" o envía una nota de voz de tu compra de café. La IA se encarga del resto.',
            },
            {
              num: "3",
              title: "Obtén Perspectivas de IA",
              desc: "Recibe sugerencias personalizadas sobre dónde ahorrar, cómo optimizar facturas y cómo alcanzar tus metas de ahorro.",
            },
          ].map((step) => (
            <div
              key={step.num}
              className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-full bg-[#0b1c30] text-white flex items-center justify-center font-display font-extrabold text-base">
                {step.num}
              </div>
              <h4 className="font-sans font-bold text-base text-[#0b1c30]">
                {step.title}
              </h4>
              <p className="font-sans text-xs text-gray-500 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
