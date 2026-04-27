import React from 'react';
import { motion } from 'framer-motion';
import { Search, Zap, BookOpen, Star } from 'lucide-react';

const SkillsPage = () => (
  <div className="min-h-[80vh] bg-white dark:bg-gray-950 transition-colors duration-300">
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-14"
      >
        <span className="inline-block bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 font-semibold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
          Skill Exchange
        </span>
        <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
          Explore Skills
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
          Discover skills people are offering and find your perfect learning match.
        </p>

        {/* Search bar */}
        <div className="mt-8 flex items-center gap-3 max-w-lg mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search skills (e.g. Python, Guitar, Spanish…)"
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all shadow-sm"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-violet-500/25"
          >
            Search
          </motion.button>
        </div>
      </motion.div>

      {/* Placeholder skill cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { skill: 'Python Programming', offer: 'UI/UX Design', user: 'Priya S.', level: 'Intermediate', icon: '🐍', rating: 4.9 },
          { skill: 'Spanish Language', offer: 'Web Development', user: 'Marcus J.', level: 'Beginner', icon: '🇪🇸', rating: 4.8 },
          { skill: 'Guitar & Music', offer: 'Data Science', user: 'Aisha P.', level: 'Advanced', icon: '🎸', rating: 5.0 },
          { skill: 'Photography', offer: 'Digital Marketing', user: 'Rahul K.', level: 'Intermediate', icon: '📷', rating: 4.7 },
          { skill: 'Graphic Design', offer: 'React Development', user: 'Emma W.', level: 'Advanced', icon: '🎨', rating: 4.9 },
          { skill: 'Public Speaking', offer: 'Machine Learning', user: 'Carlos M.', level: 'Beginner', icon: '🎤', rating: 4.6 },
        ].map(({ skill, offer, user, level, icon, rating }, i) => (
          <motion.div
            key={skill}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            whileHover={{ y: -6, boxShadow: '0 20px 40px -8px rgba(124,58,237,0.15)' }}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm cursor-pointer group transition-shadow duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-4xl">{icon}</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                level === 'Advanced'
                  ? 'bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400'
                  : level === 'Intermediate'
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
              }`}>
                {level}
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              {skill}
            </h3>

            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <Zap className="w-3.5 h-3.5 text-violet-500" />
              <span>Offers: <span className="font-medium text-gray-700 dark:text-gray-300">{offer}</span></span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  {user.charAt(0)}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">{user}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{rating}</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="mt-4 w-full py-2.5 bg-violet-50 dark:bg-violet-950/50 hover:bg-violet-100 dark:hover:bg-violet-900/50 text-violet-600 dark:text-violet-400 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Request Exchange
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

export default SkillsPage;
