'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useSpring, useInView } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { MachineParts, FloatingLabel } from './components/MachineParts';
import { GalleryCard, type Listing } from './components/GalleryCard';
import { ContactSection } from './components/ContactSection';

const LISTINGS: Listing[] = [
  { id:'1', title:'Heidelberg Speedmaster XL 106', category:'Ofset Baskı', brand:'Heidelberg', year:2019, condition:'İkinci El', price:4800000, location:'İstanbul, İkitelli', verified:true, expiresAt:new Date(Date.now()+24*86400000).toISOString(), specs:[{k:'Baskı Hızı',v:'18.000 tabaka/saat'},{k:'Format',v:'750×1060 mm'},{k:'Renk',v:'5 renk + lak'},{k:'Gramaj',v:'0,04–1,0 mm'}] },
  { id:'2', title:'Komori Lithrone G40', category:'Ofset Baskı', brand:'Komori', year:2021, condition:'İkinci El', price:6200000, location:'Ankara, Ostim', verified:true, expiresAt:new Date(Date.now()+7*86400000).toISOString(), specs:[{k:'Baskı Hızı',v:'16.500 tabaka/saat'},{k:'Format',v:'720×1030 mm'},{k:'Renk',v:'4 renk'},{k:'Gramaj',v:'0,04–0,8 mm'}] },
  { id:'3', title:'Polar 115 X Giyotin', category:'Kesim', brand:'Polar', year:2018, condition:'Yenilenmiş', price:850000, location:'İzmir, Bornova', verified:false, expiresAt:new Date(Date.now()+30*86400000).toISOString(), specs:[{k:'Kesim Genişliği',v:'1150 mm'},{k:'Yükseklik',v:'120 mm'},{k:'Hız',v:'14 kesim/dak'},{k:'Ağırlık',v:'2.800 kg'}] },
  { id:'4', title:'HP Indigo 100K Digital Press', category:'Dijital Baskı', brand:'HP', year:2022, condition:'İkinci El', price:9500000, location:'İstanbul, Bağcılar', verified:true, expiresAt:new Date(Date.now()+12*86400000).toISOString(), specs:[{k:'Baskı Hızı',v:'6.000 tabaka/saat'},{k:'Format',v:'B2 500×700 mm'},{k:'Çözünürlük',v:'812 dpi'},{k:'Renk',v:'CMYK+3 özel'}] },
  { id:'5', title:'Bobst Expertfold 110', category:'Büküm', brand:'Bobst', year:2017, condition:'İkinci El', price:1200000, location:'Bursa, Nilüfer', verified:true, expiresAt:new Date(Date.now()+18*86400000).toISOString(), specs:[{k:'Hız',v:'450 m/dak'},{k:'Format',v:'110×700 mm'},{k:'Gramaj',v:'150–800 g/m²'},{k:'Ağırlık',v:'5.200 kg'}] },
  { id:'6', title:'Fujifilm Jet Press 750S', category:'Dijital Baskı', brand:'Fujifilm', year:2020, condition:'İkinci El', price:7800000, location:'İstanbul, Esenyurt', verified:true, expiresAt:new Date(Date.now()+5*86400000).toISOString(), specs:[{k:'Baskı Hızı',v:'2.700 tabaka/saat'},{k:'Format',v:'B2 750×585 mm'},{k:'Çözünürlük',v:'1200×1200 dpi'},{k:'Mürekkep',v:'Su bazlı inkjet'}] },
];

const CATS = ['Tümü', 'Ofset Baskı', 'Dijital Baskı', 'Kesim', 'Büküm'];

function StatItem({ value, label, delay }: { value: string; label: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="py-10 px-6 text-center"
    >
      <div className="text-3xl md:text-4xl font-light text-[#1a1a1a] tracking-tight mb-1">{value}</div>
      <div className="text-[11px] text-gray-300 tracking-[0.15em] uppercase font-light">{label}</div>
    </motion.div>
  );
}

export default function MachinePrimePage() {
  const [cat, setCat] = useState('Tümü');
  const [navScrolled, setNavScrolled] = useState(false);
  const [assemblyProgress, setAssemblyProgress] = useState(0);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const springProgress = useSpring(scrollYProgress, { stiffness: 55, damping: 18 });

  useEffect(() => {
    const unsub = springProgress.on('change', v => setAssemblyProgress(v));
    return unsub;
  }, [springProgress]);

  useEffect(() => {
    const handler = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const list = cat === 'Tümü' ? LISTINGS : LISTINGS.filter(l => l.category === cat);

  const l1 = assemblyProgress > 0.10 && assemblyProgress < 0.40;
  const l2 = assemblyProgress > 0.30 && assemblyProgress < 0.60;
  const l3 = assemblyProgress > 0.50 && assemblyProgress < 0.76;
  const l4 = assemblyProgress > 0.68 && assemblyProgress < 0.92;
  const assembled = assemblyProgress > 0.90;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

      {/* ═══ NAV ═══ */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50"
        animate={{
          paddingTop: navScrolled ? 10 : 18,
          paddingBottom: navScrolled ? 10 : 18,
          backgroundColor: 'rgba(255,255,255,0.96)',
        }}
        style={{
          borderBottom: navScrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between px-6 md:px-16">
          {/* Left: back + logo */}
          <div className="flex items-center gap-4">
            <Link href="/" className="text-[11px] text-gray-300 hover:text-gray-500 transition-colors tracking-wide font-light">
              ← MatbaaGross.com
            </Link>
            <span className="text-gray-200 text-xs select-none">|</span>
            <Link href="/machine-prime" className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-md bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[9px] font-bold tracking-tight">MP</span>
              </div>
              <span className="text-sm font-semibold text-[#1a1a1a] tracking-tight">Machine Prime</span>
            </Link>
          </div>

          {/* Right: nav links */}
          <div className="flex items-center gap-8">
            <a href="#showroom" className="text-sm text-gray-400 hover:text-[#1a1a1a] transition-colors font-light">
              Showroom
            </a>
            <a href="#about" className="text-sm text-gray-400 hover:text-[#1a1a1a] transition-colors font-light">
              Hakkımızda
            </a>
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="rounded-full bg-[#1a1a1a] text-white px-6 py-2.5 text-sm font-medium hover:bg-[#2d2d2d] transition-colors"
            >
              VIP İletişim
            </motion.a>
          </div>
        </div>
      </motion.nav>

      {/* ═══ SCROLLYTELLING HERO (300vh sticky) ═══ */}
      <div ref={heroRef} style={{ height: '300vh' }}>
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden bg-white">

          {/* Title — fades as assembly progresses */}
          <motion.div
            className="absolute top-28 left-0 right-0 text-center z-10 px-4 pointer-events-none"
            animate={{ opacity: assemblyProgress < 0.22 ? 1 : Math.max(0, 1 - (assemblyProgress - 0.22) * 7) }}
          >
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-[11px] font-medium tracking-[0.35em] uppercase text-gray-300 mb-5"
            >
              Endüstriyel Matbaa Makineleri
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="text-6xl md:text-8xl font-light text-[#1a1a1a] tracking-tighter leading-none"
            >
              Machine<br />
              <span className="font-semibold">Prime</span>
            </motion.h1>
          </motion.div>

          {/* SVG Assembly area */}
          <div className="relative w-full max-w-xl mx-auto px-8 flex items-center justify-center" style={{ height: 420 }}>
            <MachineParts progress={assemblyProgress} />

            {/* Floating side labels */}
            <div className="absolute inset-0 pointer-events-none">
              <FloatingLabel text="Lazer Hassasiyetinde Baskı" side="left" visible={l1} />
              <FloatingLabel text="Endüstriyel Güç" side="right" visible={l2} />
              <FloatingLabel text="Alman Mühendisliği" side="left" visible={l3} />
              <FloatingLabel text="Sıfır Tolerans" side="right" visible={l4} />
            </div>
          </div>

          {/* Scroll progress bar + cue */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
            <motion.div
              className="w-28 h-px bg-gray-200 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <motion.div
                className="h-full bg-[#1a1a1a] rounded-full origin-left"
                style={{ scaleX: assemblyProgress }}
              />
            </motion.div>
            <motion.p
              animate={{ opacity: assembled ? 0 : 0.55 }}
              className="text-[10px] tracking-[0.25em] uppercase text-gray-400 font-light"
            >
              Kaydırarak birleştirin
            </motion.p>
            <motion.div
              animate={{ y: [0, 6, 0], opacity: assembled ? 0 : 1 }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            >
              <ChevronDown className="h-4 w-4 text-gray-300" />
            </motion.div>
          </div>

          {/* Assembled reveal CTA */}
          <motion.div
            className="absolute bottom-20 left-0 right-0 text-center"
            animate={{ opacity: assembled ? 1 : 0, y: assembled ? 0 : 16 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-sm text-gray-400 font-light mb-5">
              Makine hazır. Showroom'u keşfedin.
            </p>
            <a
              href="#showroom"
              className="inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] text-white px-8 py-3.5 text-sm font-medium hover:bg-[#2d2d2d] transition-colors group"
            >
              Showroom'a Gir
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>
      </div>

      {/* ═══ STATS ═══ */}
      <section className="border-y border-gray-100 mx-6 md:mx-16">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
          <StatItem value="₺2.4B" label="Toplam İlan Değeri" delay={0} />
          <StatItem value="340+" label="Aktif İlan" delay={0.1} />
          <StatItem value="180+" label="Doğrulanmış Satıcı" delay={0.2} />
          <StatItem value="12 Ülke" label="Alıcı Coğrafyası" delay={0.3} />
        </div>
      </section>

      {/* ═══ SHOWROOM ═══ */}
      <section id="showroom" className="px-6 md:px-16 py-28">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
          <div>
            <p className="text-[11px] font-medium tracking-[0.3em] uppercase text-gray-300 mb-4">Koleksiyon</p>
            <h2 className="text-4xl md:text-5xl font-light text-[#1a1a1a] tracking-tight">Showroom</h2>
            <p className="mt-3 text-sm text-gray-400 font-light max-w-md leading-relaxed">
              Her makine titizlikle doğrulanmıştır. Görselin üzerine gelin, teknik detayları görün.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATS.map(c => (
              <motion.button
                key={c}
                onClick={() => setCat(c)}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className={`rounded-full px-5 py-2 text-xs tracking-wide transition-all duration-300 ${
                  cat === c
                    ? 'bg-[#1a1a1a] text-white font-medium'
                    : 'bg-transparent border border-gray-200 text-gray-400 font-light hover:border-gray-300 hover:text-[#1a1a1a]'
                }`}
              >
                {c}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Gallery grid — 2 columns, large cards */}
        <div className="grid md:grid-cols-2 gap-x-10 gap-y-20">
          {list.map((l, i) => (
            <GalleryCard key={l.id} l={l} delay={i * 0.08} />
          ))}
        </div>
      </section>

      {/* ═══ ABOUT ═══ */}
      <section id="about" className="mx-6 md:mx-16 border-t border-gray-100 py-28">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[11px] font-medium tracking-[0.3em] uppercase text-gray-300 mb-4">Hakkımızda</p>
            <h2 className="text-4xl font-light text-[#1a1a1a] tracking-tight leading-snug mb-6">
              Endüstriyel matbaacılığın<br />
              <span className="font-semibold">dijital vitrini.</span>
            </h2>
            <p className="text-gray-400 font-light leading-relaxed mb-4">
              Machine Prime, MatbaaGross'un profesyonel alıcı ve satıcıları bir araya getiren
              premium platformudur. Her ilan doğrulanır, her satıcı onaylanır, her işlem güvence altındadır.
            </p>
            <p className="text-gray-400 font-light leading-relaxed">
              Amacımız, Türkiye'nin endüstriyel matbaa sektöründe uluslararası standartlarda
              şeffaf ve güvenilir bir pazar yeri oluşturmaktır.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-0"
          >
            {[
              { title: 'Doğrulanmış Satıcılar', desc: 'Her satıcı kimlik, vergi ve ticaret sicil doğrulamasından geçer. Sahte ilan sıfır.' },
              { title: 'Anlık Bildirimler', desc: 'İlanınıza teklif geldiğinde veya görüntülendiğinde anında haberdar olun.' },
              { title: 'Prime Sertifikası', desc: 'Tamamlanan her işlem için dijital sertifika. Güven, şeffaflık, prestij.' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="py-7 border-b border-gray-100 last:border-0"
              >
                <h3 className="text-base font-semibold text-[#1a1a1a] mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 font-light leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ VIP CONTACT ═══ */}
      <ContactSection />

      {/* ═══ FOOTER ═══ */}
      <footer className="mx-6 md:mx-16 border-t border-gray-100 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[8px] font-bold">MP</span>
          </div>
          <span className="text-sm font-medium text-[#1a1a1a]">Machine Prime</span>
          <span className="text-xs text-gray-300 font-light">by MatbaaGross</span>
        </div>
        <p className="text-xs text-gray-300 font-light">
          © {new Date().getFullYear()} MatbaaGross. Tüm hakları saklıdır.
        </p>
        <Link href="/" className="text-xs text-gray-400 hover:text-[#1a1a1a] transition-colors font-light">
          MatbaaGross.com'a Dön
        </Link>
      </footer>
    </div>
  );
}
