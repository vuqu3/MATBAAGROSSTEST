'use client';

type Segment = {
  label: string;
  value: number;
  color: string;
};

type ProductionPieChartProps = {
  data: Segment[];
  size?: number;
};

export default function ProductionPieChart({ data, size = 200 }: ProductionPieChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-slate-400 text-sm">
        Veri yok
      </div>
    );
  }

  let acc = 0;
  const segments = data.map((d) => {
    const start = acc;
    acc += d.value / total;
    return { ...d, start, end: acc };
  });

  const r = size / 2;
  const cx = r;
  const cy = r;

  const toPath = (start: number, end: number) => {
    const startAngle = 2 * Math.PI * start - Math.PI / 2;
    const endAngle = 2 * Math.PI * end - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const large = end - start > 0.5 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} className="overflow-visible">
        {segments.map((seg, i) => (
          <path
            key={seg.label}
            d={toPath(seg.start, seg.end)}
            fill={seg.color}
            className="transition-opacity hover:opacity-90"
          />
        ))}
        <circle cx={cx} cy={cy} r={r * 0.55} fill="white" />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" className="text-sm font-semibold fill-slate-700">
          {total}
        </text>
      </svg>
      <ul className="grid w-full grid-cols-2 gap-2 text-sm">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-slate-600">{d.label}</span>
            <span className="ml-auto font-medium text-slate-800">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
