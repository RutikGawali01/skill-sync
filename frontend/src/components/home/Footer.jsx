import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconBrandGithub, IconBrandX, IconBrandLinkedin } from '@tabler/icons-react';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              SkillX
            </span>
            <p className="mt-3 text-sm leading-relaxed max-w-xs">
              The world's first skill-barter platform. Teach what you know, learn what you love.
            </p>
            {/* Social icons */}
            <div className="flex gap-4 mt-5">
              <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" className="hover:text-white transition-colors">
                <IconBrandGithub size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="X / Twitter" className="hover:text-white transition-colors">
                <IconBrandX size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:text-white transition-colors">
                <IconBrandLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => navigate('/')} className="hover:text-white transition-colors">Home</button>
              </li>
              <li>
                <button onClick={() => navigate('/features')} className="hover:text-white transition-colors">Features</button>
              </li>
              <li>
                <button onClick={() => navigate('/matches')} className="hover:text-white transition-colors">Explore Matches</button>
              </li>
              <li>
                <button onClick={() => navigate('/login')} className="hover:text-white transition-colors">Login / Sign Up</button>
              </li>
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-white transition-colors">About</button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-white transition-colors">Contact</button>
              </li>
              <li>
                <button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
              </li>
              <li>
                <button onClick={() => navigate('/terms')} className="hover:text-white transition-colors">Terms of Service</button>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <p>© 2026 Skill Exchange Platform. All rights reserved.</p>
          <p className="text-gray-600">Built with ❤️ for lifelong learners</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
