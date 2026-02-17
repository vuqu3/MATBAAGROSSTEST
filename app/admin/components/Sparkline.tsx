'use client';

type SparklineProps = {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  strokeWidth?: number;
  className?: string;
};

export default function Sparkline({
  data,
  width = 80,
  height = 32,
  stroke = 'currentColor',
  strokeWidth = 1.5,
  className = '',
}: SparklineProps) {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;
  const w = width - padding * 2;
  const h = height - padding * 2;
  const step = data.length > 1 ? w / (data.length - 1) : 0;

  const points = data
    .map((v, i) => {
      const x = padding + i * step;
      const y = padding + h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden
    >
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
