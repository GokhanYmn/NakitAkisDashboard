
import React from 'react';
import { useTheme } from '../../context/ThemeContex';

const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span className="text-lg">
        {isDark ? '☀️' : '🌙'}
      </span>
      <span className="text-sm font-medium">
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </span>
    </button>
  );
};

export default ThemeToggle;