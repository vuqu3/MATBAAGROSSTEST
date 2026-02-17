'use client';

import { TrendingUp, ClipboardList, UserPlus, Store } from 'lucide-react';
import Sparkline from './Sparkline';

const ICONS = { TrendingUp, ClipboardList, UserPlus, Store } as const;
type IconName = keyof typeof ICONS;

type StatCardProps = {
  title: string;
  value: string | number;
  iconName: IconName;
  trend?: number[];
  iconBg?: string;
  iconColor?: string;
};

export default function StatCard({
  title,
  value,
  iconName,
  trend = [],
  iconBg = 'bg-slate-100',
  iconColor = 'text-slate-600',
}: StatCardProps) {
  const Icon = ICONS[iconName];
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>
          <p className="mt-0.5 text-xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-md ${iconBg} ${iconColor}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {trend.length > 0 && (
        <div className="mt-3 flex items-end justify-end text-[#1e293b]">
          <Sparkline data={trend} width={80} height={28} stroke="#1e293b" strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}
