import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Rocket } from 'lucide-react';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gradient-to-br from-slate-950 via-violet-950 to-indigo-950 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-violet-600 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-16 right-0 w-[500px] h-[500px] bg-indigo-600 rounded-full opacity-15 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-fuchsia-700 rounded-full opacity-10 blur-3xl" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(to right, #ffffff 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Bouncing rocket */}
        <motion.div
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="flex justify-center mb-8"
        >
          <div className="w-20 h-20 bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl shadow-violet-500/20">
            <Rocket className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6"
        >
          Start Your Skill{' '}
          <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">
            Journey Today
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-xl text-violet-200/80 mb-12 max-w-xl mx-auto"
        >
          Join 12,000+ learners already exchanging skills worldwide. Free forever — no credit card needed.
        </motion.p>

        {/* Pulsing CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <motion.button
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(167,139,250,0.4)',
                '0 0 0 18px rgba(167,139,250,0)',
                '0 0 0 0 rgba(167,139,250,0)',
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-400 hover:to-indigo-400 text-white px-10 py-5 rounded-xl font-bold text-lg shadow-2xl shadow-violet-500/30 transition-colors"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-8 text-violet-300/60 text-sm"
        >
          🔒 No credit card required &nbsp;·&nbsp; 🌍 Available worldwide &nbsp;·&nbsp; ⚡ Set up in 2 minutes
        </motion.p>
      </div>
    </section>
  );
};

export default CTASection;
