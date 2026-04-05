import { Check, X } from 'lucide-react';

export function ComparisonSection() {
  const comparisons = [
    { feature: 'Dockerized local stack', them: false, us: true },
    { feature: 'Redis fallback to PostgreSQL', them: false, us: true },
    { feature: 'Structured request logs with IDs', them: false, us: true },
    { feature: 'Events stream for URL activity', them: false, us: true },
    { feature: 'Health + metrics endpoints', them: false, us: true },
    { feature: 'Basic URL create + redirect', them: true, us: true },
    { feature: 'Chaos-ready operations dashboard', them: false, us: true },
  ];

  return (
    <section 
      className="py-20 px-6 relative"
      style={{
        background: 'linear-gradient(180deg, #0a0a0a 0%, #000000 50%, #0a0a0a 100%)'
      }}
    >
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 60px),
                          repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 60px)`
      }} />

      <div className="relative max-w-4xl mx-auto">
        {/* Header - White BG Badge on Dark Section */}
        <div className="text-center mb-12">
          <div className="inline-block bg-white px-6 py-3 rounded-sm mb-6">
            <span className="text-base font-heading font-black tracking-tight text-black uppercase">
              Why Sequel
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-black text-white tracking-tight mb-3">
            The difference is clear
          </h2>
          <p className="text-sm text-white/40 max-w-md mx-auto">
            Feature-by-feature comparison with a basic demo shortener
          </p>
        </div>

        {/* Comparison Table */}
        <div className="border border-white/10 rounded-sm overflow-hidden bg-white/[0.02]">
          {/* Table Header */}
          <div className="grid grid-cols-3 bg-white/[0.05]">
            <div className="p-4 text-sm font-bold text-white/60">Feature</div>
            <div className="p-4 text-sm font-bold text-white/30 text-center border-l border-white/5">Others</div>
            <div className="p-4 text-sm font-bold text-white text-center border-l border-white/10 bg-white/[0.05]">Sequel</div>
          </div>
          
          {/* Table Rows */}
          {comparisons.map((item, i) => (
            <div 
              key={item.feature} 
              className={`grid grid-cols-3 hover:bg-white/[0.03] transition-colors ${i !== comparisons.length - 1 ? 'border-b border-white/5' : ''}`}
            >
              <div className="p-4 text-sm text-white/70">{item.feature}</div>
              <div className="p-4 flex justify-center items-center border-l border-white/5">
                {item.them ? (
                  <Check className="w-4 h-4 text-white/30" />
                ) : (
                  <X className="w-4 h-4 text-white/10" />
                )}
              </div>
              <div className="p-4 flex justify-center items-center border-l border-white/10 bg-white/[0.02]">
                <Check className="w-4 h-4 text-white" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
