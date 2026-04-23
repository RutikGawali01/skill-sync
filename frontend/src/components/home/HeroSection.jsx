import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: 'easeOut' },
  }),
};

const stats = [
  { label: 'Active Learners', value: '12K+' },
  { label: 'Skills Listed', value: '3.5K+' },
  { label: 'Sessions Done', value: '48K+' },
];

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-violet-950 to-indigo-950 pt-20">
      {/* Animated mesh blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-violet-600 rounded-full opacity-20 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-indigo-500 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-24 left-1/4 w-80 h-80 bg-purple-500 rounded-full opacity-15 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-violet-900 rounded-full opacity-10 blur-3xl" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(to right, #ffffff 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-28 text-center">
        {/* Pill badge */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-400/30 backdrop-blur-sm text-violet-300 px-4 py-2 rounded-full text-sm font-medium mb-8"
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          The future of peer-to-peer learning is here
        </motion.div>

        {/* Heading */}
        <motion.h1
          custom={0.15}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-6"
        >
          Learn &amp; Teach Skills{' '}
          <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">
            Seamlessly
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          custom={0.3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-xl sm:text-2xl text-violet-200/80 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Exchange skills with talented people around the world. Teach what you know,
          learn what you love — no money required.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          custom={0.45}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-400 hover:to-indigo-400 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl shadow-violet-500/30 transition-all"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/matches')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg backdrop-blur-sm transition-all"
          >
            Explore Matches
          </motion.button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          custom={0.6}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto border-t border-white/10 pt-12"
        >
          {stats.map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-extrabold text-white">{value}</p>
              <p className="text-violet-300/70 text-sm mt-1">{label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
