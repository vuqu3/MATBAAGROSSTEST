'use client';

interface DiscountBannerProps {
  productCount?: number;
}

export default function DiscountBanner({ productCount }: DiscountBannerProps) {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl mb-8">
      {/* Ana arka plan: tok ve canlı turuncu gradyan */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600" />

      {/* Tipografik arka plan deseni: "%50 İNDİRİM" watermark */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none opacity-[0.07]">
        <div className="grid grid-cols-3 gap-8 w-full h-full -rotate-12">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="flex items-center justify-center">
              <span className="font-black text-4xl text-white leading-none whitespace-nowrap">
                %50 İNDİRİM
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Üst sol parlama */}
      <div className="absolute -top-8 -left-8 w-56 h-56 bg-orange-400/20 rounded-full blur-3xl pointer-events-none" />
      {/* Sağ alt parlama */}
      <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-orange-300/15 rounded-full blur-3xl pointer-events-none" />

      {/* Animasyonlu ışık süpürmesi (shimmer) */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)',
          animation: 'shimmer 3s infinite linear',
        }}
      />

      {/* İçerik */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2 py-3 px-4 md:py-4 md:px-8">

        {/* Sol: Metinler */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          {/* Üst küçük etiket */}
          <span className="inline-flex items-center gap-1 bg-white/15 border border-white/25 text-white/90 text-[10px] font-bold tracking-[0.18em] uppercase px-2 py-0.5 rounded-full mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-pulse" />
            MatbaaGross Özel Fırsat
          </span>

          {/* Ana başlık */}
          <div className="flex items-end gap-3 mb-1">
            <span
              className="text-4xl md:text-5xl font-extrabold text-yellow-300 leading-none drop-shadow-lg"
              style={{
                filter: 'drop-shadow(0 0 18px rgba(253,224,71,0.55))',
                textShadow: '0 4px 32px rgba(0,0,0,0.5)',
              }}
            >
              %50
            </span>
            <span
              className="text-xl md:text-2xl font-black text-white leading-tight pb-0.5 drop-shadow-md"
              style={{ textShadow: '0 2px 16px rgba(0,0,0,0.45)' }}
            >
              İNDİRİMLİ<br />ÜRÜNLER
            </span>
          </div>

          {/* Slogan */}
          <p className="text-white/70 text-xs font-medium mt-1 tracking-wide">
            Stoklarla Sınırlı Dev Kampanya!
          </p>
        </div>

        {/* Sağ: Ürün sayısı rozeti */}
        {productCount != null && productCount > 0 && (
          <div className="flex-shrink-0 flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-center">
            <span
              className="text-2xl md:text-3xl font-extrabold text-yellow-300 leading-none"
              style={{ filter: 'drop-shadow(0 0 10px rgba(253,224,71,0.5))' }}
            >
              {productCount}
            </span>
            <span className="text-white/80 text-[10px] font-semibold tracking-widest uppercase mt-0.5">
              Fırsat Ürünü
            </span>
          </div>
        )}
      </div>

      {/* Shimmer keyframe */}
      <style jsx>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
