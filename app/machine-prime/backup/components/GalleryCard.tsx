'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { MapPin, Clock, Eye, MessageSquare, Star } from 'lucide-react';

export type Listing = {
  id: string;
  title: string;
  category: string;
  brand: string;
  year: number;
  condition: string;
  price: number;
  location: string;
  verified: boolean;
  expiresAt: string;
  specs: { k: string; v: string }[];
};

const daysLeft = (iso: string) => Math.max(0, Math.floor((new Date(iso).getTime() - Date.now()) / 86400000));
const fmtPrice = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1).replace('.', ',')}M ₺` : `${n.toLocaleString('tr-TR')} ₺`;

export function GalleryCard({ l, delay = 0 }: { l: Listing; delay?: number }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const days = daysLeft(l.expiresAt);
  const urgent = days <= 7;

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image area */}
      <motion.div
        className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 cursor-pointer"
        animate={{
          y: hovered ? -4 : 0,
          boxShadow: hovered
            ? '0 32px 80px rgba(0,0,0,0.11)'
            : '0 2px 10px rgba(0,0,0,0.05)',
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ background: 'linear-gradient(135deg,#f5f5f5 0%,#ebebeb 100%)' }}
      >
        {/* Brand placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center select-none">
            <div className="w-20 h-20 mx-auto mb-3 rounded-2xl bg-white/70 flex items-center justify-center"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <span className="text-3xl font-extralight text-gray-300">{l.brand[0]}</span>
            </div>
            <p className="text-[10px] text-gray-300 tracking-[0.25em] uppercase font-light">{l.brand}</p>
          </div>
        </div>

        {/* Prime badge */}
        {l.verified && (
          <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200/50 px-3 py-1.5"
            style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <Star className="h-3 w-3 text-gray-400" />
            <span className="text-[10px] font-medium tracking-[0.18em] uppercase text-gray-500">Prime</span>
          </div>
        )}

        {/* Countdown */}
        <div className={`absolute top-4 right-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium backdrop-blur-sm ${urgent ? 'bg-red-50/90 text-red-500 border border-red-100/60' : 'bg-white/90 text-gray-400 border border-gray-200/50'}`}
          style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <Clock className="h-3 w-3" />
          {days} gün
        </div>

        {/* Hover specs overlay */}
        <motion.div
          className="absolute inset-0 flex items-end"
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.72) 0%, transparent 52%)' }}
          aria-hidden
        >
          <motion.div
            className="w-full p-6"
            animate={{ y: hovered ? 0 : 14 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {l.specs.map(s => (
                <div key={s.k}>
                  <p className="text-[10px] text-white/45 uppercase tracking-wider mb-0.5">{s.k}</p>
                  <p className="text-sm font-medium text-white leading-tight">{s.v}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Info */}
      <div className="px-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-medium tracking-[0.22em] uppercase text-gray-400">{l.category}</span>
          <span className="text-gray-200 text-xs">·</span>
          <span className="text-[10px] text-gray-300 font-light">{l.condition}</span>
        </div>

        <h3 className="text-xl font-semibold text-[#1a1a1a] leading-snug mb-1 tracking-tight">{l.title}</h3>
        <p className="text-sm text-gray-400 font-light mb-4">{l.brand} · {l.year}</p>

        <div className="flex items-end justify-between mb-5">
          <p className="text-2xl font-semibold text-[#1a1a1a] tracking-tight">{fmtPrice(l.price)}</p>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-light">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {l.location}
          </div>
        </div>

        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium bg-[#1a1a1a] text-white hover:bg-[#2d2d2d] transition-colors"
          >
            <Eye className="h-4 w-4" />
            Detayları Görüntüle
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center rounded-xl py-3 px-4 text-sm font-medium border border-gray-200 text-gray-500 hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-all"
          >
            <MessageSquare className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}
