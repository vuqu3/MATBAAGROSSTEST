'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send } from 'lucide-react';

export function NotifyForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/prime-waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, company }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setEmail('');
        setName('');
        setCompany('');
      } else {
        setError(data.error || 'Bir hata oluştu');
      }
    } catch (err) {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-6">
          <Send className="h-8 w-8 text-black/40" />
        </div>
        <h3 className="text-2xl font-light text-[#1a1a1a] mb-3 tracking-tight">
          Teşekkürler
        </h3>
        <p className="text-sm text-black/40 font-light leading-relaxed max-w-md mx-auto">
          Lansman olduğunda sizi ilk bilgilendirecek olanlar arasında olacaksınız.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-md mx-auto w-full"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-posta adresiniz"
            required
            className="w-full px-6 py-4 bg-transparent border border-black/10 rounded-full text-sm placeholder:text-black/30 focus:outline-none focus:border-black/30 transition-colors font-light"
            style={{ fontSize: '15px' }}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Adınız"
            className="w-full px-6 py-4 bg-transparent border border-black/10 rounded-full text-sm placeholder:text-black/30 focus:outline-none focus:border-black/30 transition-colors font-light"
            style={{ fontSize: '15px' }}
          />
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Firma"
            className="w-full px-6 py-4 bg-transparent border border-black/10 rounded-full text-sm placeholder:text-black/30 focus:outline-none focus:border-black/30 transition-colors font-light"
            style={{ fontSize: '15px' }}
          />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-red-500 text-center font-light"
          >
            {error}
          </motion.p>
        )}

        <motion.button
          type="submit"
          disabled={loading || !email}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-[#1a1a1a] text-white rounded-full py-4 px-8 text-sm font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ fontSize: '15px' }}
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            />
          ) : (
            <>
              <Mail className="h-4 w-4" />
              Beni Haberdar Et
            </>
          )}
        </motion.button>
      </form>

      <p className="text-xs text-black/20 text-center mt-6 font-light">
        Spam göndermiyoruz. Lansman haberi dışında e-posta almazsınız.
      </p>
    </motion.div>
  );
}
