'use client';

import { motion } from 'framer-motion';

export function MachineParts({ progress }: { progress: number }) {
  const p = Math.max(0, Math.min(1, progress));
  const ep = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;

  return (
    <svg viewBox="0 0 500 420" className="w-full h-full" style={{ maxWidth: 500 }}>
      {/* Body frame */}
      <g style={{ transform: `translate(0px,${(1 - ep) * 60}px)`, opacity: 0.12 + ep * 0.88, transition: 'none' }}>
        <rect x="120" y="140" width="260" height="180" rx="8" fill="none" stroke="#1a1a1a" strokeWidth="1.5" />
        <line x1="120" y1="200" x2="380" y2="200" stroke="#1a1a1a" strokeWidth="0.5" strokeDasharray="4,6" />
        <line x1="120" y1="260" x2="380" y2="260" stroke="#1a1a1a" strokeWidth="0.5" strokeDasharray="4,6" />
        <rect x="160" y="155" width="60" height="30" rx="3" fill="none" stroke="#1a1a1a" strokeWidth="0.8" />
        <rect x="240" y="155" width="100" height="30" rx="3" fill="none" stroke="#1a1a1a" strokeWidth="0.8" />
      </g>

      {/* Print head — from left */}
      <g style={{ transform: `translate(${(1 - ep) * -200}px,${(1 - ep) * -15}px)`, opacity: ep, transition: 'none' }}>
        <rect x="140" y="108" width="220" height="36" rx="4" fill="none" stroke="#1a1a1a" strokeWidth="1.2" />
        {[162, 196, 230, 264, 298, 332].map(x => (
          <line key={x} x1={x} y1="144" x2={x} y2="108" stroke="#1a1a1a" strokeWidth="0.7" strokeDasharray="3,3" />
        ))}
        <rect x="140" y="100" width="220" height="8" rx="2" fill="none" stroke="#1a1a1a" strokeWidth="0.8" />
      </g>

      {/* Rollers — from right */}
      <g style={{ transform: `translate(${(1 - ep) * 220}px,${(1 - ep) * 8}px)`, opacity: ep, transition: 'none' }}>
        {[198, 228, 258].map((cy, i) => (
          <ellipse key={i} cx="250" cy={cy} rx="108" ry="11" fill="none" stroke="#1a1a1a" strokeWidth="1.2" />
        ))}
        <line x1="142" y1="198" x2="142" y2="269" stroke="#1a1a1a" strokeWidth="0.8" />
        <line x1="358" y1="198" x2="358" y2="269" stroke="#1a1a1a" strokeWidth="0.8" />
      </g>

      {/* Control panel — from top */}
      <g style={{ transform: `translate(${(1 - ep) * 20}px,${(1 - ep) * -220}px)`, opacity: ep, transition: 'none' }}>
        <rect x="334" y="148" width="36" height="124" rx="4" fill="none" stroke="#1a1a1a" strokeWidth="1.2" />
        <circle cx="352" cy="172" r="7" fill="none" stroke="#1a1a1a" strokeWidth="1" />
        <circle cx="352" cy="196" r="4" fill="none" stroke="#1a1a1a" strokeWidth="1" />
        {[212, 220, 228, 236, 244].map((y, i) => (
          <rect key={i} x="340" y={y} width={[22, 16, 20, 14, 18][i]} height="3" rx="1" fill="#1a1a1a" opacity="0.22" />
        ))}
      </g>

      {/* Paper path — from bottom-left */}
      <g style={{ transform: `translate(${(1 - ep) * -160}px,${(1 - ep) * 90}px)`, opacity: ep * 0.6, transition: 'none' }}>
        <rect x="120" y="292" width="260" height="26" rx="2" fill="none" stroke="#1a1a1a" strokeWidth="1" strokeDasharray="6,3" />
        <line x1="120" y1="305" x2="380" y2="305" stroke="#1a1a1a" strokeWidth="0.4" strokeDasharray="2,5" />
      </g>

      {/* Legs — from below */}
      <g style={{ transform: `translate(0px,${(1 - ep) * 130}px)`, opacity: ep, transition: 'none' }}>
        <rect x="138" y="320" width="18" height="36" rx="3" fill="none" stroke="#1a1a1a" strokeWidth="1.2" />
        <rect x="344" y="320" width="18" height="36" rx="3" fill="none" stroke="#1a1a1a" strokeWidth="1.2" />
        <rect x="128" y="352" width="38" height="7" rx="2" fill="none" stroke="#1a1a1a" strokeWidth="1" />
        <rect x="334" y="352" width="38" height="7" rx="2" fill="none" stroke="#1a1a1a" strokeWidth="1" />
      </g>

      {/* Side rails — from top-right */}
      <g style={{ transform: `translate(${(1 - ep) * 110}px,${(1 - ep) * -90}px)`, opacity: ep * 0.5, transition: 'none' }}>
        <line x1="120" y1="144" x2="120" y2="320" stroke="#1a1a1a" strokeWidth="0.8" />
        <line x1="380" y1="144" x2="380" y2="320" stroke="#1a1a1a" strokeWidth="0.8" />
        {[180, 220, 260, 300].map(y => (
          <line key={y} x1="112" y1={y} x2="120" y2={y} stroke="#1a1a1a" strokeWidth="0.8" />
        ))}
      </g>

      {/* Assembled crosshair */}
      {ep > 0.88 && (
        <g opacity={Math.min(1, (ep - 0.88) * 8.3)}>
          <circle cx="250" cy="228" r="188" fill="none" stroke="#1a1a1a" strokeWidth="0.22" strokeDasharray="2,10" />
          <line x1="250" y1="35" x2="250" y2="415" stroke="#1a1a1a" strokeWidth="0.22" strokeDasharray="4,10" />
          <line x1="55" y1="228" x2="445" y2="228" stroke="#1a1a1a" strokeWidth="0.22" strokeDasharray="4,10" />
          <circle cx="250" cy="228" r="4" fill="none" stroke="#1a1a1a" strokeWidth="0.8" />
        </g>
      )}
    </svg>
  );
}

export function FloatingLabel({ text, side, visible }: { text: string; side: 'left' | 'right'; visible: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -24 : 24 }}
      animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : (side === 'left' ? -24 : 24) }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-3 ${side === 'left' ? 'left-0' : 'right-0'}`}
    >
      {side === 'right' && <div className="h-px w-10 bg-gray-300" />}
      <span className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-light whitespace-nowrap">{text}</span>
      {side === 'left' && <div className="h-px w-10 bg-gray-300" />}
    </motion.div>
  );
}
