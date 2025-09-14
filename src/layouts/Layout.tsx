import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import TopNav from '../components/layout/TopNav';
import { useTheme } from '../contexts/ThemeContext';
import clsx from 'clsx';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const isLargeScreen = window.innerWidth >= 1024;
      const saved = localStorage.getItem('sidebar-collapsed');
      
      if (saved !== null) {
        return saved === 'true';
      }
      return isLargeScreen; // Default collapsed on large screens
    }
    return true;
  });

  const [isLargeScreen, setIsLargeScreen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  const { theme } = useTheme();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const newIsLargeScreen = window.innerWidth >= 1024;
      setIsLargeScreen(newIsLargeScreen);
      
      // Auto-collapse on large screens if not manually set
      if (newIsLargeScreen && localStorage.getItem('sidebar-collapsed') === null) {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    const newCollapsed = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsed);
    localStorage.setItem('sidebar-collapsed', newCollapsed.toString());
  };

  // Calculate main content margin based on sidebar state
  const getMainContentMargin = () => {
    if (!isLargeScreen) {
      // On small/medium screens, sidebar is overlay, so no margin needed
      return 'ml-0';
    }
    
    if (sidebarCollapsed) {
      // Collapsed sidebar on large screens (64px width)
      return 'ml-16';
    } else {
      // Expanded sidebar on large screens (256px width)
      return 'ml-64';
    }
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200 overflow-hidden">
      {/* Sidebar - Fixed positioning */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={toggleSidebar}
        isLargeScreen={isLargeScreen}
      />
      
      {/* Main Content Area - Adjusts based on sidebar state */}
      <div className={clsx(
        'h-screen transition-all duration-300 ease-in-out overflow-hidden',
        getMainContentMargin()
      )}>
        {/* Top Navigation - Aligned with main content */}
        <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 shadow-sm">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TopNav 
              onMenuClick={toggleSidebar} 
              collapsed={sidebarCollapsed}
              isLargeScreen={isLargeScreen}
            />
          </div>
        </nav>
        
        {/* Main Content - Centered within available space */}
        <main className="w-full overflow-y-auto overscroll-none">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}