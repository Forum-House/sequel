import { Button } from '@/components/ui';
import { Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function SREDashboardPitch() {
  return (
    <section
      id="sre"
      className="py-20 px-6 overflow-hidden relative"
      style={{
        background: 'linear-gradient(180deg, #000000 0%, #050505 50%, #0a0a0a 100%)'
      }}
    >
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 60px),
                          repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 60px)`
      }} />

      <div className="relative max-w-5xl mx-auto">
        {/* Split Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Terminal Preview */}
          <div className="order-1">
            <div 
              className="rounded-sm overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #111111 0%, #080808 100%)',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              {/* Terminal Header */}
              <div className="px-4 py-3 flex items-center gap-3 border-b border-white/5">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                </div>
                <span className="text-[10px] font-mono text-white/30 ml-2">ops-console</span>
              </div>
              
              {/* Terminal Content */}
              <div className="p-6 font-mono text-sm space-y-5">
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-white/40" />
                  <span className="text-white/30">STATUS</span>
                  <span className="text-white/80 font-semibold">OPERATIONAL</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                  <div>
                    <div className="text-white/20 text-[10px] mb-1 uppercase tracking-wider">P99 Latency</div>
                    <div className="text-2xl font-bold text-white/90">live</div>
                  </div>
                  <div>
                    <div className="text-white/20 text-[10px] mb-1 uppercase tracking-wider">Error Rate</div>
                    <div className="text-2xl font-bold text-white/90">tracked</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="text-red-400/70">[14:22:01] WARN: Redis timeout, fallback enabled</div>
                  <div className="text-green-400/70">[14:22:04] OK: Redirect served from PostgreSQL</div>
                  <div className="text-green-400/70">[14:22:09] OK: Cache warmed with fresh key</div>
                  <div className="text-green-400/80">[14:22:12] OK: Request completed with x-cache header</div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button className="flex-1 border border-white/10 py-2 text-xs font-medium text-white/40 hover:bg-white/5 hover:text-white/70 transition-colors rounded-sm">
                    DRILL TRAFFIC
                  </button>
                  <button className="flex-1 border border-white/10 py-2 text-xs font-medium text-white/40 hover:bg-white/5 hover:text-white/70 transition-colors rounded-sm">
                    SIMULATE OUTAGE
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="order-2 lg:text-right">
            <div className="inline-block bg-white px-5 py-2.5 mb-5">
              <span className="text-[10px] font-semibold tracking-[0.25em] text-black/70 uppercase">
                Operations
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white tracking-tight mb-5 leading-tight">
              Observe resilience<br />as it happens
            </h2>
            <p className="text-base text-white/50 mb-8 max-w-md lg:ml-auto leading-relaxed">
              Validate health checks, event logs, and fallback behavior from a single dashboard.
            </p>
            
            {/* Feature List */}
            <div className="grid grid-cols-2 gap-3 mb-8 lg:justify-items-end">
              {['Live metrics endpoint', 'Failure simulation', 'Cache fallback visibility', 'Event history stream'].map((item) => (
                <div key={item} className="flex items-center gap-2.5 lg:flex-row-reverse">
                  <span className="text-sm text-white/60">{item}</span>
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                </div>
              ))}
            </div>

            <Link href="/dashboard">
              <Button variant="primary" size="lg" className="group bg-white text-black hover:bg-white/90 border-0 shadow-none text-sm px-6 py-3 font-semibold">
                Open Dashboard 
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
