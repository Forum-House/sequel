export function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Input',
      desc: 'Paste any URL into the generator.',
    },
    {
      step: '02',
      title: 'Customize',
      desc: 'Add routing rules, expiry, or protection.',
    },
    {
      step: '03',
      title: 'Launch',
      desc: 'Deploy and track performance instantly.',
    },
  ];

  return (
    <section 
      className="py-20 px-6 relative"
      style={{
        background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)'
      }}
    >
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 60px),
                          repeating-linear-gradient(90deg, #000 0px, #000 1px, transparent 1px, transparent 60px)`
      }} />

      <div className="relative max-w-5xl mx-auto">
        {/* Header - Black BG with White Text */}
        <div className="text-center mb-14">
          <div className="inline-block bg-black px-6 py-3 mb-4">
            <span className="text-[11px] font-semibold tracking-[0.25em] text-white/70 uppercase">
              How it works
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold tracking-tight leading-tight">
            Simple setup,<br />powerful results
          </h2>
        </div>

        {/* Steps - Horizontal Layout */}
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div
              key={s.step}
              className="relative text-center p-8 group cursor-pointer bg-white border border-black/5 hover:border-black/20 hover:shadow-lg transition-all duration-300 rounded-sm"
            >
              {/* Step Number */}
              <div className="inline-flex items-center justify-center w-14 h-14 bg-black text-white text-lg font-bold mb-6 group-hover:scale-110 transition-transform duration-300">
                {s.step}
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-heading font-bold mb-2 tracking-tight">{s.title}</h3>
              <p className="text-sm text-black/50 leading-relaxed">{s.desc}</p>

              {/* Connector Line */}
              {i !== steps.length - 1 && (
                <div className="hidden md:block absolute top-14 -right-3 w-6 h-0.5 bg-black/10 group-hover:bg-black/30 transition-colors" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
