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
              Production-minded URL shortener with observability, resilience, and clean local workflows.
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
                { label: 'Documentation', href: 'https://github.com/Forum-House/sequel/tree/main/docs' },
                { label: 'API Reference', href: 'https://github.com/Forum-House/sequel/blob/main/docs/api.md' },
                { label: 'Runbooks', href: 'https://github.com/Forum-House/sequel/blob/main/docs/runbooks.md' },
                { label: 'Troubleshooting', href: 'https://github.com/Forum-House/sequel/blob/main/docs/troubleshooting.md' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
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
            © {new Date().getFullYear()} Sequel. Built for the PE Hackathon Template.
          </div>
          
        </div>
      </div>
    </footer>
  );
}
