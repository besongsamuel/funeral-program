const motes = [
  { left: '6%', top: '18%', size: 5, delay: '0s', duration: '16s' },
  { left: '14%', top: '62%', size: 3, delay: '3s', duration: '22s' },
  { left: '22%', top: '38%', size: 4, delay: '7s', duration: '18s' },
  { left: '78%', top: '22%', size: 4, delay: '2s', duration: '20s' },
  { left: '86%', top: '58%', size: 6, delay: '5s', duration: '17s' },
  { left: '91%', top: '36%', size: 3, delay: '9s', duration: '24s' },
  { left: '48%', top: '12%', size: 3, delay: '4s', duration: '19s' },
  { left: '62%', top: '72%', size: 4, delay: '6s', duration: '21s' },
  { left: '33%', top: '78%', size: 3, delay: '1s', duration: '15s' },
  { left: '71%', top: '14%', size: 5, delay: '8s', duration: '23s' },
];

function LilyCluster({ className, gradientId }: { className?: string; gradientId: string }) {
  return (
    <svg viewBox="0 0 280 320" fill="none" className={className} aria-hidden>
      <g opacity="0.55">
        <path d="M86 302c18-46 28-92 22-148" stroke="#d9f99d" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M118 308c8-52 6-108-8-164" stroke="#d9f99d" strokeWidth="2" strokeLinecap="round" />
        <path
          d="M108 86c-22-34-8-62 18-74 8 28 10 52-2 74-6 12-12 14-16 0Z"
          fill={`url(#${gradientId})`}
        />
        <path
          d="M126 92c8-40 38-52 58-32-18 26-36 44-58 48-8 2-8-4 0-16Z"
          fill={`url(#${gradientId})`}
        />
        <path
          d="M96 102c-38-18-52 8-42 36 28 4 50-6 58-28 4-10 0-12-16-8Z"
          fill={`url(#${gradientId})`}
        />
        <path
          d="M118 78c-6-36 18-58 46-48-4 30-18 52-40 58-10 2-10-2-6-10Z"
          fill={`url(#${gradientId})`}
        />
        <circle cx="118" cy="96" r="6" fill="#fde68a" opacity="0.85" />
        <path d="M72 248c-18-8-34 6-28 22 16 6 32 2 36-10 2-6-2-10-8-12Z" fill="#f5f3ff" opacity="0.35" />
        <path d="M148 236c16-10 34 2 28 20-14 8-32 4-38-8-2-6 2-10 10-12Z" fill="#f5f3ff" opacity="0.3" />
      </g>
      <defs>
        <linearGradient id={gradientId} x1="80" y1="40" x2="150" y2="130">
          <stop stopColor="#fbf6e8" />
          <stop offset="1" stopColor="#dcc8e6" stopOpacity="0.85" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Dove({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" fill="currentColor" className={className} aria-hidden>
      <path d="M8 24c8-2 14-10 22-12 4-6 12-10 20-8-6 4-8 10-6 16 8 2 14 8 16 16-10-4-18-4-26 0-6 2-14 4-22-2-4-4-6-8-4-10z" />
      <circle cx="48" cy="12" r="1.6" fill="rgb(var(--color-purple-950))" />
    </svg>
  );
}

export function HeroBackdrop({ reduced }: { reduced: boolean }) {
  return (
    <div className="hero-atmosphere pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="hero-radial absolute inset-0" />
      <div className="absolute left-1/2 top-[28%] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-gold-200/20 blur-3xl" />
      <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-gold-300/10 blur-3xl" />
      <div className="absolute -right-16 bottom-10 h-96 w-96 rounded-full bg-memorial-400/15 blur-3xl" />

      <div className={`hero-beam absolute left-1/2 top-0 h-[55%] w-[min(70%,36rem)] -translate-x-1/2 ${reduced ? '' : 'hero-beam-animate'}`} />

      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/10 to-transparent" />
      <div className="absolute -left-10 top-8 h-32 w-[55%] rounded-full bg-white/10 blur-3xl" />
      <div className="absolute right-0 top-16 h-24 w-[40%] rounded-full bg-white/10 blur-3xl" />

      <LilyCluster gradientId="lilyPetalLeft" className="absolute -left-16 bottom-[-2rem] h-[22rem] w-64 opacity-70 sm:h-[26rem] sm:w-72" />
      <LilyCluster gradientId="lilyPetalRight" className="absolute -right-20 bottom-[-3rem] h-[22rem] w-64 -scale-x-100 opacity-60 sm:h-[26rem] sm:w-72" />

      <Dove
        className={`absolute right-[12%] top-[18%] h-10 w-16 text-white/50 ${reduced ? '' : 'hero-float-slow'}`}
      />
      <Dove
        className={`absolute left-[10%] top-[28%] h-8 w-12 text-white/35 ${reduced ? '' : 'hero-float-slower'}`}
      />

      {motes.map((mote, i) => (
        <span
          key={i}
          className={`hero-mote absolute rounded-full bg-gold-100/80 shadow-[0_0_10px_rgb(var(--color-gold-200)_/_0.8)] ${reduced ? '' : 'hero-mote-animate'}`}
          style={{
            left: mote.left,
            top: mote.top,
            width: mote.size,
            height: mote.size,
            animationDelay: reduced ? undefined : mote.delay,
            animationDuration: reduced ? undefined : mote.duration,
          }}
        />
      ))}
    </div>
  );
}
