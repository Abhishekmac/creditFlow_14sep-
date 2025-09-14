import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import {
  HomeIcon,
  CreditCardIcon,
  TableCellsIcon,
  BanknotesIcon,
  UserIcon,
  Cog6ToothIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Apply Card', href: '/apply', icon: CreditCardIcon },
  { name: 'Transactions', href: '/transactions', icon: TableCellsIcon },
  { name: 'Payments', href: '/payments', icon: BanknotesIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isLargeScreen: boolean;
}

export default function Sidebar({ collapsed, onToggle, isLargeScreen }: SidebarProps) {
  const location = useLocation();

  // Determine sidebar behavior based on screen size
  const isIconsOnly = isLargeScreen && collapsed;
  const isHidden = !isLargeScreen && collapsed;
  const sidebarWidth = isIconsOnly ? 64 : 256;

  return (
    <>
      {/* Mobile/Tablet Backdrop - only show when sidebar is expanded on small screens */}
      <AnimatePresence>
        {!isLargeScreen && !collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Fixed positioning for proper alignment */}
      <AnimatePresence>
        {!isHidden && (
          <motion.div
            initial={{ 
              x: isLargeScreen ? 0 : -sidebarWidth,
              width: sidebarWidth
            }}
            animate={{ 
              x: 0,
              width: sidebarWidth
            }}
            exit={{ 
              x: isLargeScreen ? 0 : -sidebarWidth
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={clsx(
              'fixed top-0 left-0 h-full bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-700 shadow-xl',
              isLargeScreen ? 'z-30' : 'z-50'
            )}
            style={{ width: sidebarWidth }}
          >
            <div className="flex h-full flex-col">
              {/* Logo - Aligned with top navbar */}
              <div className={clsx(
                'flex h-16 items-center border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800',
                isIconsOnly ? 'justify-center px-2' : 'justify-between px-4'
              )}>
                {isIconsOnly ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-primary-600">
                    <CreditCardIcon className="h-5 w-5 text-white" />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary-600">
                      <CreditCardIcon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-semibold text-neutral-900 dark:text-white">
                      CreditFlow
                    </span>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <nav className={clsx(
                'flex-1 space-y-1',
                isIconsOnly ? 'p-2' : 'p-3'
              )}>
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <div key={item.name} className="relative group">
                      <NavLink
                        to={item.href}
                        onClick={() => {
                          // Only close sidebar on small screens
                          if (!isLargeScreen) {
                            onToggle();
                          }
                        }}
                        className={clsx(
                          'group flex items-center rounded-md text-sm font-medium transition-all duration-150 relative',
                          isIconsOnly ? 'p-2 justify-center' : 'px-3 py-2',
                          isActive
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                        )}
                      >
                        <item.icon
                          className={clsx(
                            'h-5 w-5 flex-shrink-0 transition-colors',
                            isIconsOnly ? '' : 'mr-3',
                            isActive
                              ? 'text-primary-600 dark:text-primary-400'
                              : 'text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300'
                          )}
                        />
                        {!isIconsOnly && <span>{item.name}</span>}
                        
                        {/* Active indicator for collapsed mode */}
                        {isIconsOnly && isActive && (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-600 rounded-l" />
                        )}
                      </NavLink>
                      
                      {/* Tooltip for collapsed mode */}
                      {isIconsOnly && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                          {item.name}
                          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
              
              {/* Footer */}
              {!isIconsOnly && (
                <div className="p-3 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
                    © 2024 CreditFlow
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}