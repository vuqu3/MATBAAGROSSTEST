'use client';

import { motion } from 'framer-motion';

export function AssemblyAnimation({ progress }: { progress: number }) {
  const p = Math.max(0, Math.min(1, progress));
  const ep = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p; // ease-in-out quadratic
  
  return (
    <svg viewBox="0 0 600 500" className="w-full h-full" style={{ maxWidth: 600 }}>
      {/* Background grid */}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f5f5f5" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="600" height="500" fill="url(#grid)" />
      
      {/* Machine Body Frame - from top */}
      <g style={{ 
        transform: `translate(${(1 - ep) * 0}px, ${(1 - ep) * -200}px)`, 
        opacity: ep * 0.12 + 0.88,
        filter: `blur(${(1 - ep) * 8}px)`,
        transition: 'none'
      }}>
        <rect x="150" y="180" width="300" height="200" rx="12" fill="none" stroke="#1a1a1a" strokeWidth="2" />
        <line x1="150" y1="250" x2="450" y2="250" stroke="#1a1a1a" strokeWidth="0.8" strokeDasharray="6,8" opacity="0.3" />
        <line x1="150" y1="310" x2="450" y2="310" stroke="#1a1a1a" strokeWidth="0.8" strokeDasharray="6,8" opacity="0.3" />
      </g>

      {/* Print Head - from left */}
      <g style={{ 
        transform: `translate(${(1 - ep) * -300}px, ${(1 - ep) * -30}px)`, 
        opacity: ep,
        filter: `blur(${(1 - ep) * 6}px)`,
        transition: 'none'
      }}>
        <rect x="170" y="140" width="260" height="45" rx="6" fill="none" stroke="#1a1a1a" strokeWidth="1.8" />
        {[190, 230, 270, 310, 350, 390].map(x => (
          <line key={x} x1={x} y1="185" x2={x} y2="140" stroke="#1a1a1a" strokeWidth="1" strokeDasharray="4,4" opacity="0.6" />
        ))}
        <rect x="170" y="130" width="260" height="10" rx="3" fill="none" stroke="#1a1a1a" strokeWidth="1.2" />
      </g>

      {/* Rollers - from right */}
      <g style={{ 
        transform: `translate(${(1 - ep) * 300}px, ${(1 - ep) * 20}px)`, 
        opacity: ep,
        filter: `blur(${(1 - ep) * 6}px)`,
        transition: 'none'
      }}>
        {[240, 280, 320].map((cy, i) => (
          <ellipse key={i} cx="300" cy={cy} rx="130" ry="14" fill="none" stroke="#1a1a1a" strokeWidth="1.8" />
        ))}
        <line x1="170" y1="240" x2="170" y2="330" stroke="#1a1a1a" strokeWidth="1.2" />
        <line x1="430" y1="240" x2="430" y2="330" stroke="#1a1a1a" strokeWidth="1.2" />
      </g>

      {/* Control Panel - from top-right */}
      <g style={{ 
        transform: `translate(${(1 - ep) * 150}px, ${(1 - ep) * -250}px)`, 
        opacity: ep,
        filter: `blur(${(1 - ep) * 4}px)`,
        transition: 'none'
      }}>
        <rect x="400" y="190" width="40" height="140" rx="6" fill="none" stroke="#1a1a1a" strokeWidth="1.8" />
        <circle cx="420" cy="220" r="8" fill="none" stroke="#1a1a1a" strokeWidth="1.2" />
        <circle cx="420" cy="250" r="5" fill="none" stroke="#1a1a1a" strokeWidth="1.2" />
        {[270, 280, 290, 300, 310].map((y, i) => (
          <rect key={i} x="406" y={y} width={[24, 18, 22, 16, 20][i]} height="3" rx="1" fill="#1a1a1a" opacity="0.3" />
        ))}
      </g>

      {/* Paper Path - from bottom-left */}
      <g style={{ 
        transform: `translate(${(1 - ep) * -200}px, ${(1 - ep) * 150}px)`, 
        opacity: ep * 0.7,
        filter: `blur(${(1 - ep) * 10}px)`,
        transition: 'none'
      }}>
        <rect x="150" y="360" width="300" height="30" rx="3" fill="none" stroke="#1a1a1a" strokeWidth="1.2" strokeDasharray="8,4" opacity="0.5" />
        <line x1="150" y1="375" x2="450" y2="375" stroke="#1a1a1a" strokeWidth="0.6" strokeDasharray="3,6" opacity="0.3" />
      </g>

      {/* Legs - from below */}
      <g style={{ 
        transform: `translate(0px, ${(1 - ep) * 200}px)`, 
        opacity: ep,
        filter: `blur(${(1 - ep) * 8}px)`,
        transition: 'none'
      }}>
        <rect x="170" y="380" width="20" height="45" rx="4" fill="none" stroke="#1a1a1a" strokeWidth="1.8" />
        <rect x="410" y="380" width="20" height="45" rx="4" fill="none" stroke="#1a1a1a" strokeWidth="1.8" />
        <rect x="160" y="420" width="40" height="8" rx="3" fill="none" stroke="#1a1a1a" strokeWidth="1.5" />
        <rect x="400" y="420" width="40" height="8" rx="3" fill="none" stroke="#1a1a1a" strokeWidth="1.5" />
      </g>

      {/* Side Rails - from top */}
      <g style={{ 
        transform: `translate(${(1 - ep) * 50}px, ${(1 - ep) * -180}px)`, 
        opacity: ep * 0.6,
        filter: `blur(${(1 - ep) * 12}px)`,
        transition: 'none'
      }}>
        <line x1="150" y1="180" x2="150" y2="380" stroke="#1a1a1a" strokeWidth="1" />
        <line x1="450" y1="180" x2="450" y2="380" stroke="#1a1a1a" strokeWidth="1" />
        {[220, 260, 300, 340].map(y => (
          <line key={y} x1="140" y1={y} x2="150" y2={y} stroke="#1a1a1a" strokeWidth="1" />
        ))}
      </g>

      {/* Assembled crosshair and details */}
      {ep > 0.85 && (
        <g opacity={Math.min(1, (ep - 0.85) * 6.7)} style={{ filter: 'none' }}>
          <circle cx="300" cy="280" r="220" fill="none" stroke="#1a1a1a" strokeWidth="0.3" strokeDasharray="3,12" opacity="0.4" />
          <line x1="300" y1="40" x2="300" y2="520" stroke="#1a1a1a" strokeWidth="0.3" strokeDasharray="6,12" opacity="0.4" />
          <line x1="60" y1="280" x2="540" y2="280" stroke="#1a1a1a" strokeWidth="0.3" strokeDasharray="6,12" opacity="0.4" />
          <circle cx="300" cy="280" r="5" fill="none" stroke="#1a1a1a" strokeWidth="1" />
        </g>
      )}

      {/* Machine Prime Logo - appears at the end */}
      {ep > 0.92 && (
        <g opacity={Math.min(1, (ep - 0.92) * 12.5)} style={{ filter: 'none' }}>
          <text x="300" y="470" textAnchor="middle" className="fill-[#1a1a1a]" style={{ fontSize: '24px', fontWeight: 300, letterSpacing: '0.05em' }}>
            MACHINE PRIME
          </text>
        </g>
      )}
    </svg>
  );
}

export function FloatingText({ text, visible, delay = 0 }: { text: string; visible: boolean; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ 
        opacity: visible ? 1 : 0, 
        y: visible ? 0 : 30 
      }}
      transition={{ 
        duration: 1.2, 
        delay,
        ease: [0.22, 1, 0.36, 1] 
      }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      <h1 className="text-center" style={{ 
        fontSize: 'clamp(3rem, 8vw, 6rem)', 
        fontWeight: 100, 
        letterSpacing: '0.02em',
        lineHeight: 1.1,
        color: '#1a1a1a'
      }}>
        {text}
      </h1>
    </motion.div>
  );
}
