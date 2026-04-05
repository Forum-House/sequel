import Link from 'next/link';

export function Footer() {
  return (
    <footer 
      className="text-white pt-16 pb-10 px-6 relative"
      style={{
        background: 'linear-gradient(180deg, #111111 0%, #0a0a0a 50%, #000000 100%)'
      }}
    >
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: `repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 60px),
                          repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 60px)`
      }} />

      <div className="relative max-w-5xl mx-auto">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              
              <span className="font-heading font-bold text-2xl tracking-tight text-white">Sequel</span>
            </Link>
            <p className="text-sm text-white/50 max-w-sm leading-relaxed">
              Modern link infrastructure for teams that move fast. Scale with confidence.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] text-white/50 uppercase mb-5">Product</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'About', href: '#about' },
                { label: 'Features', href: '#features' },
                { label: 'Operations', href: '#sre' },
                { label: 'Dashboard', href: '/dashboard' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] text-white/50 uppercase mb-5">Resources</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'Documentation', href: 'docs' },
                { label: 'API Reference', href: 'docs' },
                { label: 'Status', href: 'docs' },
                { label: 'Support', href: 'docs' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-center items-center pt-8 border-t border-white/10 gap-4">
          <div className="text-sm text-white/40">
            © {new Date().getFullYear()} Sequel Inc. All rights reserved.
          </div>
          
        </div>
      </div>
    </footer>
  );
}
