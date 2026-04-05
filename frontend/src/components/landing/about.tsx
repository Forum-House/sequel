import { Code2, Globe, Shield, Zap } from 'lucide-react';

export function AboutSection() {
  const values = [
    {
      icon: Zap,
      title: 'Fast Redirect Path',
      desc: 'Cache-first short-code resolution with graceful DB fallback.',
    },
    {
      icon: Shield,
      title: 'Failure Tolerant',
      desc: 'Redis outages degrade safely instead of breaking redirects.',
    },
    {
      icon: Globe,
      title: 'Operationally Visible',
      desc: 'Health checks, request IDs, logs, and metrics built in.',
    },
    {
      icon: Code2,
      title: 'API-First',
      desc: 'FastAPI endpoints for users, URLs, redirects, and events.',
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
              Built for reliable<br />URL operations
            </h2>
            
            <p className="text-base text-black/55 mb-6 leading-relaxed max-w-md">
              Sequel is a production-focused URL shortener built for this hackathon template.
              It combines FastAPI, PostgreSQL, Redis, and Nginx behind a clean frontend.
            </p>
            
            <p className="text-base text-black/55 leading-relaxed max-w-md">
              The goal is practical reliability: seed-safe startup, observable traffic,
              and repeatable local runs with Docker Compose and automated tests.
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
            { value: '31/31', label: 'Core tests passing' },
            { value: '2', label: 'API replicas in compose' },
            { value: 'Redis + PG', label: 'Data path' },
            { value: '/metrics', label: 'Runtime telemetry' },
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
