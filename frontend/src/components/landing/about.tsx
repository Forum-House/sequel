import { Code2, Globe, Shield, Zap } from 'lucide-react';

export function AboutSection() {
  const values = [
    {
      icon: Zap,
      title: 'Speed First',
      desc: 'Sub-40ms redirects globally. No compromises.',
    },
    {
      icon: Shield,
      title: 'Privacy Focused',
      desc: 'Your data stays yours. No third-party tracking.',
    },
    {
      icon: Globe,
      title: 'Globally Distributed',
      desc: 'Edge nodes across 40+ regions worldwide.',
    },
    {
      icon: Code2,
      title: 'Open Source',
      desc: 'Transparent, auditable, community-driven.',
    },
  ];

  return (
    <section
      id="about"
      className="py-24 px-6 relative"
      style={{
        background: 'linear-gradient(180deg, #f5f5f5 0%, #fafafa 50%, #ffffff 100%)'
      }}
    >
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 60px),
                          repeating-linear-gradient(90deg, #000 0px, #000 1px, transparent 1px, transparent 60px)`
      }} />

      <div className="relative max-w-5xl mx-auto">
        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <div>
            <div className="inline-block bg-black px-5 py-2.5 mb-6">
              <span className="text-[10px] font-semibold tracking-[0.25em] text-white/70 uppercase">
                About Sequel
              </span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold tracking-tight mb-6 leading-tight">
              Built for the<br />modern web
            </h2>
            
            <p className="text-base text-black/55 mb-6 leading-relaxed max-w-md">
              Sequel started as a simple idea: link management shouldn't be complicated. 
              We built a platform that developers love and businesses trust.
            </p>
            
            <p className="text-base text-black/55 leading-relaxed max-w-md">
              From startups to enterprises, teams use Sequel to create, manage, and 
              analyze their links with confidence. No vendor lock-in, no hidden costs.
            </p>
          </div>

          {/* Right - Values Grid */}
          <div className="grid grid-cols-2 gap-4">
            {values.map((item, i) => (
              <div
                key={item.title}
                className="p-6 bg-white border border-black/5 hover:border-black/15 hover:shadow-lg transition-all duration-300 cursor-default group rounded-sm"
              >
                <div className="w-12 h-12 bg-black flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-heading font-bold mb-1.5 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-sm text-black/50 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div 
          className="mt-16 p-8 grid grid-cols-2 md:grid-cols-4 gap-8 rounded-sm"
          style={{
            background: 'linear-gradient(145deg, #000000 0%, #0a0a0a 100%)'
          }}
        >
          {[
            { value: '2019', label: 'Founded' },
            { value: '50K+', label: 'Active Users' },
            { value: '1B+', label: 'Links Served' },
            { value: '40+', label: 'Edge Regions' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
