import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'UX Designer → Learning Python',
    avatar: 'PS',
    rating: 5,
    feedback:
      'SkillX is a game-changer! I taught UI/UX design and learned Python from a brilliant developer. The matching was spot-on and sessions were super smooth.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    name: 'Marcus Johnson',
    role: 'Full-Stack Dev → Learning Spanish',
    avatar: 'MJ',
    rating: 5,
    feedback:
      "The scheduling system is fantastic. I found a Spanish tutor within 24 hours, and we exchange lessons every weekend. Best learning platform I've used!",
    gradient: 'from-indigo-500 to-blue-600',
  },
  {
    name: 'Aisha Patel',
    role: 'Data Scientist → Learning Guitar',
    avatar: 'AP',
    rating: 5,
    feedback:
      'I never imagined I could learn guitar by teaching data science! SkillX made it completely effortless. The trust system gives real confidence.',
    gradient: 'from-fuchsia-500 to-pink-600',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: 'easeOut' },
  }),
};

const Testimonials = () => (
  <section className="py-24 bg-white dark:bg-gray-950 transition-colors duration-300" id="testimonials">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <span className="inline-block bg-fuchsia-50 dark:bg-fuchsia-950/50 text-fuchsia-600 dark:text-fuchsia-400 font-semibold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
          Real Stories
        </span>
        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
          What Our Community Says
        </h2>
        <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
          Thousands of learners and teachers trust SkillX. Here are a few of their stories.
        </p>
      </motion.div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map(({ name, role, avatar, rating, feedback, gradient }, i) => (
          <motion.div
            key={name}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-8 shadow-md hover:shadow-xl dark:hover:shadow-gray-800/50 transition-shadow duration-300"
          >
            <Quote className="absolute top-6 right-6 w-8 h-8 text-gray-100 dark:text-gray-800" />

            {/* Stars */}
            <div className="flex gap-1 mb-5">
              {Array.from({ length: rating }).map((_, idx) => (
                <Star key={idx} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm mb-6 italic">
              "{feedback}"
            </p>

            {/* Author */}
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg`}>
                {avatar}
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-sm">{name}</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">{role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
