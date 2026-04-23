import React from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Zap, Calendar, TrendingUp } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: PlusCircle,
    title: 'Add Your Skills',
    description: 'List the skills you want to teach and the ones you want to learn. Build your personal skill profile.',
    gradient: 'from-violet-500 to-purple-500',
    iconBg: 'bg-violet-50 dark:bg-violet-950/60',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    step: '02',
    icon: Zap,
    title: 'Get Matched',
    description: 'Our smart matching engine connects you with the perfect skill-swap partner based on compatibility.',
    gradient: 'from-indigo-500 to-blue-500',
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/60',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    step: '03',
    icon: Calendar,
    title: 'Schedule Session',
    description: 'Set up sessions at your convenience. Choose time slots that work for both parties seamlessly.',
    gradient: 'from-fuchsia-500 to-pink-500',
    iconBg: 'bg-fuchsia-50 dark:bg-fuchsia-950/60',
    iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
  },
  {
    step: '04',
    icon: TrendingUp,
    title: 'Learn & Grow',
    description: 'Exchange knowledge, earn badges, build your reputation, and track your learning journey.',
    gradient: 'from-emerald-500 to-teal-500',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: 'easeOut' },
  }),
};

const hoverTransition = { type: 'spring', stiffness: 300, damping: 20 };

const HowItWorks = () => (
  <section className="py-24 bg-white dark:bg-gray-950 transition-colors duration-300">
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
          Simple Process
        </span>
        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
          How It Works
        </h2>
        <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
          Four simple steps to start your skill exchange journey today.
        </p>
      </motion.div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map(({ step, icon: Icon, title, description, gradient, iconBg, iconColor }, i) => (
          <div key={step} className="relative">
            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className="hidden lg:block absolute top-14 left-full w-full h-px bg-gradient-to-r from-violet-200 dark:from-violet-800/50 to-transparent z-0" />
            )}

            <motion.div
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -10, boxShadow: '0 24px 48px -8px rgba(124,58,237,0.15)' }}
              transition={hoverTransition}
              className="relative z-10 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-8 shadow-sm cursor-pointer"
            >
              {/* Step badge */}
              <span className={`inline-block text-xs font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-5`}>
                STEP {step}
              </span>

              {/* Icon */}
              <motion.div
                whileHover={{ scale: 1.12 }}
                transition={hoverTransition}
                className={`w-14 h-14 ${iconBg} rounded-xl flex items-center justify-center mb-5`}
              >
                <Icon className={`w-7 h-7 ${iconColor}`} />
              </motion.div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">{description}</p>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
