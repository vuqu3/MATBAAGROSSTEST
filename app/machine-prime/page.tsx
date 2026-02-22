'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { AssemblyAnimation, FloatingText } from './components/AssemblyAnimation';
import { NotifyForm } from './components/NotifyForm';

export default function MachinePrimeTeaserPage() {
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

  // Text visibility based on scroll progress
  const text1Visible = assemblyProgress > 0.15 && assemblyProgress < 0.45;
  const text2Visible = assemblyProgress > 0.35 && assemblyProgress < 0.65;
  const text3Visible = assemblyProgress > 0.55 && assemblyProgress < 0.85;
  const assemblyComplete = assemblyProgress > 0.9;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* ═══ NAV ═══ */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50"
        animate={{
          paddingTop: navScrolled ? 12 : 20,
          paddingBottom: navScrolled ? 12 : 20,
          backgroundColor: 'rgba(255,255,255,0.98)',
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
            <Link href="/" className="text-[11px] text-black/30 hover:text-black/60 transition-colors tracking-wide font-light">
              ← MatbaaGross.com
            </Link>
            <span className="text-black/20 text-xs select-none">|</span>
            <Link href="/machine-prime" className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded bg-black flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[8px] font-bold tracking-tight">MP</span>
              </div>
              <span className="text-sm font-medium text-black tracking-tight">Machine Prime</span>
            </Link>
          </div>

          {/* Right: simple nav */}
          <div className="flex items-center gap-6">
            <a href="#notify" className="text-sm text-black/40 hover:text-black transition-colors font-light">
              Lansman
            </a>
            <Link href="/" className="text-xs text-black/30 hover:text-black/60 transition-colors font-light">
              Ana Sayfa
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ═══ SCROLLYTELLING HERO (400vh sticky) ═══ */}
      <div ref={heroRef} style={{ height: '400vh' }}>
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden bg-white">

          {/* Floating Texts */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <FloatingText text="ENDÜSTRİYEL GÜÇ" visible={text1Visible} delay={0.2} />
            <FloatingText text="KUSURSUZ HASSASİYET" visible={text2Visible} delay={0.1} />
            <FloatingText text="YENİ BİR ÇAĞ" visible={text3Visible} delay={0} />
          </div>

          {/* Assembly Animation */}
          <div className="relative w-full max-w-2xl mx-auto px-8 flex items-center justify-center" style={{ height: 500 }}>
            <AssemblyAnimation progress={assemblyProgress} />
          </div>

          {/* Scroll progress bar + cue */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
            <motion.div
              className="w-32 h-px bg-black/10 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <motion.div
                className="h-full bg-black rounded-full origin-left"
                style={{ scaleX: assemblyProgress }}
              />
            </motion.div>
            <motion.p
              animate={{ opacity: assemblyComplete ? 0 : 0.6 }}
              className="text-[10px] tracking-[0.3em] uppercase text-black/30 font-light"
            >
              Kaydırarak birleştirin
            </motion.p>
            <motion.div
              animate={{ y: [0, 8, 0], opacity: assemblyComplete ? 0 : 1 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
              <ChevronDown className="h-4 w-4 text-black/20" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* ═══ COMING SOON SECTION ═══ */}
      <section id="notify" className="min-h-screen flex items-center justify-center px-6 py-32">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center max-w-2xl mx-auto w-full"
        >
          {/* Coming Soon Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-5xl md:text-7xl font-light text-[#1a1a1a] tracking-tight leading-tight mb-6">
              Çok Yakında<br />
              <span className="font-medium">Hizmetinizde</span>
            </h2>
            <p className="text-lg text-black/40 font-light leading-relaxed max-w-lg mx-auto">
              Matbaa makinelerinde yeni bir standart. 
              Premium, güvenilir ve şeffaf pazar yeri.
            </p>
          </motion.div>

          {/* Notify Form */}
          <NotifyForm />

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-20 pt-12 border-t border-black/5"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {[
                { title: 'Doğrulanmış Satıcılar', desc: 'Her makine titizlikle incelenir' },
                { title: 'Premium Destek', desc: 'Uzman danışmanlık hizmeti' },
                { title: 'Güvenli Ödeme', desc: 'Escrow korumalı işlemler' }
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.8 + i * 0.1 }}
                >
                  <h3 className="text-sm font-medium text-[#1a1a1a] mb-2">{item.title}</h3>
                  <p className="text-xs text-black/30 font-light">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ MINIMAL FOOTER ═══ */}
      <footer className="border-t border-black/5 py-8">
        <div className="px-6 md:px-16 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-black flex items-center justify-center">
              <span className="text-white text-[7px] font-bold">MP</span>
            </div>
            <span className="text-xs font-medium text-black">Machine Prime</span>
            <span className="text-xs text-black/30">by MatbaaGross</span>
          </div>
          <p className="text-xs text-black/20">
            © {new Date().getFullYear()} MatbaaGross. Tüm hakları saklıdır.
          </p>
          <Link href="/" className="text-xs text-black/30 hover:text-black/60 transition-colors font-light">
            MatbaaGross.com
          </Link>
        </div>
      </footer>
    </div>
  );
}
