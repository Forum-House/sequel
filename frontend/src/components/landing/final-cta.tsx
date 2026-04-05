import { Button } from '@/components/ui';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function FinalCTA() {
  return (
    <section 
      className="py-24 px-6 relative"
      style={{
        background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 50%, #f5f5f5 100%)'
      }}
    >
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 60px),
                          repeating-linear-gradient(90deg, #000 0px, #000 1px, transparent 1px, transparent 60px)`
      }} />

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Large Text */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black tracking-tight mb-6 leading-[0.95]">
          Ready to
          <br />
          <span className="inline-block border-b-4 border-black">level up?</span>
        </h2>
        
        <p className="text-base md:text-lg font-medium mb-10 max-w-md mx-auto text-black/45">
          Start building scalable link infrastructure today.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-10">
          <Link href="/">
            <Button variant="dark" size="lg" className="w-full sm:w-auto text-sm px-8 py-4 font-semibold group">
              Get Started
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <a href="https://github.com/Forum-House/sequel.git" target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="lg" className="text-sm px-8 py-4 w-full border-2 border-black/10 hover:border-black/30 font-semibold">
              View Source
            </Button>
          </a>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-black/35">
          <span>Free tier available</span>
          <span className="text-black/15">•</span>
          <span>No card required</span>
          <span className="text-black/15">•</span>
          <span>Fully open source</span>
        </div>
      </div>
    </section>
  );
}
