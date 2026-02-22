'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Send, Phone, Mail, User, Building2, FileText } from 'lucide-react';

export function ContactSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [sent, setSent] = useState(false);

  return (
    <section id="contact" ref={ref} className="px-6 md:px-16 py-32 border-t border-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[11px] font-medium tracking-[0.35em] uppercase text-gray-300 mb-5"
          >
            VIP İletişim
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-5xl font-light text-[#1a1a1a] tracking-tight leading-tight mb-5"
          >
            Bu Güce<br />
            <span className="font-semibold">Sahip Olun</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-gray-400 font-light max-w-md mx-auto leading-relaxed"
          >
            Makinenizi bizimle birlikte en prestijli şekilde listeleyin.
            Uzman danışmanımız size özel bir sunum hazırlayacaktır.
          </motion.p>
        </div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-3xl border border-gray-200/80 p-8 md:p-12"
          style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.04)' }}
        >
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="py-16 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto mb-5">
                <Send className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-[#1a1a1a] mb-2">Başvurunuz Alındı</h3>
              <p className="text-sm text-gray-400 font-light">Danışmanımız en kısa sürede sizinle iletişime geçecektir.</p>
            </motion.div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-5 mb-5">
                {/* Name */}
                <div>
                  <label className="block text-[11px] text-gray-400 tracking-[0.2em] uppercase mb-2 font-medium">Ad Soyad</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                    <input type="text" placeholder="Adınız Soyadınız"
                      className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm text-[#1a1a1a] placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors font-light" />
                  </div>
                </div>
                {/* Company */}
                <div>
                  <label className="block text-[11px] text-gray-400 tracking-[0.2em] uppercase mb-2 font-medium">Firma</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                    <input type="text" placeholder="Firma Adınız"
                      className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm text-[#1a1a1a] placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors font-light" />
                  </div>
                </div>
                {/* Email */}
                <div>
                  <label className="block text-[11px] text-gray-400 tracking-[0.2em] uppercase mb-2 font-medium">E-posta</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                    <input type="email" placeholder="ornek@firma.com"
                      className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm text-[#1a1a1a] placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors font-light" />
                  </div>
                </div>
                {/* Phone */}
                <div>
                  <label className="block text-[11px] text-gray-400 tracking-[0.2em] uppercase mb-2 font-medium">Telefon</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                    <input type="tel" placeholder="+90 5XX XXX XX XX"
                      className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm text-[#1a1a1a] placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors font-light" />
                  </div>
                </div>
                {/* Message */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] text-gray-400 tracking-[0.2em] uppercase mb-2 font-medium">Mesajınız</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 h-4 w-4 text-gray-300" />
                    <textarea placeholder="Listelemek istediğiniz makine hakkında kısaca bilgi verin..." rows={4}
                      className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm text-[#1a1a1a] placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors font-light resize-none" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <p className="text-xs text-gray-300 font-light">
                  Bilgileriniz gizli tutulur ve yalnızca danışmanlık için kullanılır.
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setSent(true)}
                  className="flex items-center gap-2 rounded-full bg-[#1a1a1a] text-white px-8 py-3.5 text-sm font-medium hover:bg-[#2d2d2d] transition-colors"
                >
                  <Send className="h-4 w-4" />
                  Başvuru Gönder
                </motion.button>
              </div>
            </>
          )}
        </motion.div>

        {/* Bottom trust line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex items-center justify-center gap-8 mt-10"
        >
          {['Doğrulanmış Satıcılar', 'Gizli Bilgi Güvencesi', 'Prime Sertifikası'].map((t, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-300 font-light">
              <div className="w-1 h-1 rounded-full bg-gray-300" />
              {t}
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
