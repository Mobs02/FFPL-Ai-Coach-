function JerseyCard({
  x,
  y,
  rotate,
  color,
  number,
}: {
  x: number;
  y: number;
  rotate: number;
  color: string;
  number: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <rect
        x={-38}
        y={-48}
        width={76}
        height={96}
        rx={10}
        fill="white"
        fillOpacity={0.97}
        stroke="black"
        strokeOpacity={0.08}
      />
      {/* jersey silhouette */}
      <path
        d="M -22 -30 L -30 -18 L -18 -10 L -18 30 L 18 30 L 18 -10 L 30 -18 L 22 -30 L 12 -36 Q 0 -26 -12 -36 Z"
        fill={color}
      />
      <text x={0} y={14} textAnchor="middle" fontSize={22} fontWeight={700} fill="white" fontFamily="sans-serif">
        {number}
      </text>
    </g>
  );
}

export function PitchIllustration() {
  return (
    <svg viewBox="0 0 500 600" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pitch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a5c2b" />
          <stop offset="100%" stopColor="#073d1c" />
        </linearGradient>
      </defs>

      <rect width="500" height="600" fill="url(#pitch)" />

      {/* mow stripes */}
      {Array.from({ length: 10 }).map((_, i) => (
        <rect key={i} x={0} y={i * 60} width={500} height={30} fill="white" fillOpacity={0.03} />
      ))}

      {/* pitch markings */}
      <g stroke="white" strokeOpacity={0.35} strokeWidth={2} fill="none">
        <rect x={20} y={20} width={460} height={560} />
        <line x1={20} y1={300} x2={480} y2={300} />
        <circle cx={250} cy={300} r={60} />
        <circle cx={250} cy={300} r={3} fill="white" fillOpacity={0.35} />
        <rect x={140} y={20} width={220} height={90} />
        <rect x={140} y={490} width={220} height={90} />
        <path d="M 190 110 A 60 60 0 0 0 310 110" />
        <path d="M 190 490 A 60 60 0 0 1 310 490" />
      </g>

      {/* floating jersey "pick" cards, like FPL's squad selection screen */}
      <JerseyCard x={140} y={190} rotate={-8} color="#37003c" number="1" />
      <JerseyCard x={250} y={140} rotate={4} color="#e90052" number="7" />
      <JerseyCard x={355} y={200} rotate={10} color="#04f5ff" number="9" />
    </svg>
  );
}
