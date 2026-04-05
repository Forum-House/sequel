export function SocialProofMarquee() {
  const keywords = [
    'FASTAPI + REDIS + POSTGRES',
    'CACHE FIRST REDIRECTS',
    'STRUCTURED REQUEST LOGS',
    'EVENT TRACKING',
    'HEALTH + METRICS',
    'DOCKER COMPOSE READY',
    'CHAOS TESTED FLOWS',
    'OPEN SOURCE BUILD',
  ];

  return (
    <div 
      className="py-5 overflow-hidden border-y border-white/5"
      style={{
        background: 'linear-gradient(90deg, #000000 0%, #0a0a0a 50%, #000000 100%)'
      }}
    >
      <div className="flex">
        <div className="animate-marquee flex items-center whitespace-nowrap">
          {[...keywords, ...keywords, ...keywords].map((keyword, i) => (
            <span
              key={`${keyword}-${i}`}
              className="text-white/50 font-semibold text-xs tracking-[0.25em] flex items-center mx-8"
            >
              {keyword}
              <span className="ml-8 text-white/20">◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
