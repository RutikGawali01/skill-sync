import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Repeat2, CalendarCheck, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Smart Matching Engine',
    description: 'AI-powered algorithm finds your ideal skill-swap partner based on skill overlap, timezone, and availability.',
    gradient: 'from-violet-600 to-purple-500',
    glow: 'hover:shadow-violet-100 dark:hover:shadow-violet-950/50',
  },
  {
    icon: Repeat2,
    title: 'Skill Exchange Mode',
    description: 'A barter-based system — teach what you know, learn what you need. Zero cost, maximum value.',
    gradient: 'from-indigo-600 to-blue-500',
    glow: 'hover:shadow-indigo-100 dark:hover:shadow-indigo-950/50',
  },
  {
    icon: CalendarCheck,
    title: 'Scheduling System',
    description: 'Integrated calendar with smart time-slot suggestions, reminders, and session management.',
    gradient: 'from-fuchsia-600 to-pink-500',
    glow: 'hover:shadow-fuchsia-100 dark:hover:shadow-fuchsia-950/50',
  },
  {
    icon: ShieldCheck,
    title: 'Ratings & Trust System',
    description: 'Build credibility with peer reviews, verified skill badges, and a transparent trust score.',
    gradient: 'from-emerald-600 to-teal-500',
    glow: 'hover:shadow-emerald-100 dark:hover:shadow-emerald-950/50',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: 'easeOut' },
  }),
};

const FeaturesSection = () => (
  <section className="py-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300" id="features">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <span className="inline-block bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 font-semibold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
          Why SkillX
        </span>
        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
          Powerful Features
        </h2>
        <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
          Everything you need for an effective, trust-based skill exchange experience.
        </p>
      </motion.div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map(({ icon: Icon, title, description, gradient, glow }, i) => (
          <motion.div
            key={title}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{ scale: 1.03, y: -6 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-md hover:shadow-xl ${glow} transition-all duration-300 cursor-pointer group`}
          >
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 shadow-lg`}>
              <Icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              {title}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">{description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
