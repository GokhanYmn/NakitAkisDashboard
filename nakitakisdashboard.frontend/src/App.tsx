// src/App.tsx
import React from 'react';
import './index.css';
import MainDashboard from './components/dashboard/MainDashboard';
import { ThemeProvider } from '../src/context/ThemeContex';
import ThemeToggle from './components/ui/ThemeToggle';

function App() {
  return (
    <ThemeProvider>
      <div className="App min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Theme Toggle - Fixed Position */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        
        <MainDashboard />
      </div>
    </ThemeProvider>
  );
}

export default App;