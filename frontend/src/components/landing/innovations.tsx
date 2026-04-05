export function InnovationsGrid() {
  const innovations = [
    {
      title: 'Intelligent Slugs',
      text: 'Auto-generate memorable, context-aware URLs that resonate.',
    },
    {
      title: 'Dynamic Routing',
      text: 'Direct traffic by device, geography, or custom conditions.',
    },
    {
      title: 'Live Insights',
      text: 'Monitor clicks, sources, and conversions as they happen.',
    },
    {
      title: 'Built-in Security',
      text: 'Password gates, link expiration, and domain isolation.',
    },
    {
      title: 'Revenue Attribution',
      text: 'Connect every click to revenue with conversion tracking.',
    },
  ];

  return (
    <section id="features" className="py-20 px-6 bg-white relative">
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 60px),
                          repeating-linear-gradient(90deg, #000 0px, #000 1px, transparent 1px, transparent 60px)`
      }} />

      <div className="relative max-w-5xl mx-auto">
        {/* Section Header - Black BG */}
        <div className="mb-12">
          <div className="inline-block bg-black px-5 py-2.5 mb-5">
            <span className="text-[10px] font-semibold tracking-[0.25em] text-white/70 uppercase">
              Capabilities
            </span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold tracking-tight leading-tight">
              Tools to grow<br className="hidden sm:block" /> your reach
            </h2>
            <p className="text-sm text-black/45 max-w-sm lg:text-right leading-relaxed">
              Engineered for teams that prioritize performance and reliability.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {innovations.map((inv, i) => (
            <div
              key={inv.title}
              className="p-7 bg-white border border-black/6 hover:border-black/20 group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer rounded-sm"
            >
              {/* Number */}
              <div className="w-12 h-12 flex items-center justify-center mb-5 text-sm font-bold bg-black text-white group-hover:scale-110 transition-transform duration-300">
                {String(i + 1).padStart(2, '0')}
              </div>
              <h3 className="text-lg font-heading font-bold mb-2 tracking-tight">
                {inv.title}
              </h3>
              <p className="text-sm text-black/45 leading-relaxed">
                {inv.text}
              </p>
            </div>
          ))}
          
          {/* Coming Soon Card */}
          <div className="p-7 border-2 border-dashed border-black/10 flex items-center justify-center rounded-sm hover:border-black/20 transition-colors cursor-pointer group">
            <span className="text-sm text-black/25 font-medium group-hover:text-black/40 transition-colors">Coming soon</span>
          </div>
        </div>
      </div>
    </section>
  );
}
