import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-10 border-t transition-colors duration-300 border-gray-200 text-gray-900 dark:border-white/20 dark:text-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <img
              src="/models/logo.png"
              alt="StudyTracker"
              className="h-10 w-auto rounded-md ring-1 ring-black/5 dark:ring-white/10"
            />
            <div>
              <div className="text-lg font-bold bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                StudyTracker
              </div>
              <div className="text-xs text-gray-700 dark:text-gray-400">by FocusLabs</div>
            </div>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <Link
              to="/terms"
              className="dark:hover:text-white dark:text-gray-500 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/privacy"
              className="dark:hover:text-white dark:text-gray-500 transition-colors"
            >
              Privacy Policy
            </Link>
            <a
              href="mailto:hello@focuslabs.app"
              className="dark:hover:text-white dark:text-gray-500 transition-colors"
            >
              Contact Us
            </a>
          </nav>
        </div>

        <div className="mt-6 text-xs text-gray-600 dark:text-gray-400">
          © {year} StudyTracker • FocusLabs. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
