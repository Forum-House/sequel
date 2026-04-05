'use client';

import { createShortUrl } from '@/lib/api';
import { Button } from '@/components/ui';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export function HeroShortener() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!url.trim()) {
      return;
    }

    setError('');
    setLoading(true);
    try {
      const created = await createShortUrl({ originalUrl: url.trim(), userId: 1 });
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      setShortUrl(origin ? `${origin}/${created.short_code}` : created.short_code);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not shorten URL';
      setError(message);
      setShortUrl('');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (shortUrl) {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section
      id="product"
      className="relative min-h-[92vh] border-b border-black/5 overflow-hidden flex items-center"
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 50%, #f5f5f5 100%)'
      }}
    >
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 60px),
                          repeating-linear-gradient(90deg, #000 0px, #000 1px, transparent 1px, transparent 60px)`
      }} />
      
      <div className="relative max-w-5xl mx-auto px-6 py-16 w-full">
        {/* Top Badge */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-2.5 bg-black text-white px-5 py-2 text-xs font-semibold tracking-[0.2em] uppercase">
            <span className="flex h-2 w-2 rounded-full bg-white animate-pulse" />
            Sequel URL Platform
          </div>
        </div>

        {/* Main Heading - Centered */}
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-heading font-black tracking-[-0.02em] leading-[0.9] mb-8">
            Reliable links,
            <br />
            <span className="relative inline-block mt-2">
              clear operations
              <span className="absolute bottom-1 left-0 w-full h-2 bg-black/80" />
            </span>
          </h1>
          <p className="text-base md:text-lg font-medium max-w-lg mx-auto text-black/50 leading-relaxed">
            Create short URLs, track events, and monitor health in one production-focused stack.
          </p>
        </div>

        {/* Shortener Input */}
        <div className="max-w-xl mx-auto mb-14">
          <div className="bg-white p-2 border-2 border-black/10 shadow-2xl flex flex-col sm:flex-row gap-2 hover:border-black/25 transition-colors rounded-sm">
            <div className="flex-1 flex items-center px-4">
              <input
                type="url"
                value={shortUrl || url}
                onChange={(e) => { setUrl(e.target.value); setShortUrl(''); }}
                placeholder="Paste a long URL to shorten"
                className="w-full bg-transparent py-3.5 outline-none text-base placeholder:text-black/30"
                readOnly={!!shortUrl}
              />
            </div>
            {shortUrl ? (
              <Button 
                variant="dark" 
                size="lg" 
                className="shrink-0 px-8 py-3.5 text-sm font-semibold shadow-none flex items-center gap-2"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </Button>
            ) : (
              <Button 
                variant="dark" 
                size="lg" 
                className="shrink-0 px-8 py-3.5 text-sm font-semibold shadow-none"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate'}
              </Button>
            )}
          </div>
          {error && <p className="mt-3 text-xs text-red-600 font-semibold">{error}</p>}
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap justify-center gap-12 md:gap-20">
          {[
            { value: 'FastAPI', label: 'API runtime' },
            { value: 'Redis', label: 'Redirect cache' },
            { value: 'PostgreSQL', label: 'Source of truth' },
          ].map((stat) => (
            <div key={stat.label} className="text-center group cursor-default">
              <div className="text-3xl md:text-4xl font-black tracking-tight mb-1 group-hover:text-black/70 transition-colors">{stat.value}</div>
              <div className="text-xs font-semibold text-black/40 uppercase tracking-[0.15em]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
          <div className="w-5 h-8 border-2 border-black/40 rounded-full flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-black/40 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
