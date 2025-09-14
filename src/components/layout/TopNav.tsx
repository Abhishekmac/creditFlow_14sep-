import React, { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  SunIcon,
  MoonIcon,
  UserIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import NotificationDropdown from '../ui/NotificationDropdown';

interface TopNavProps {
  onMenuClick: () => void;
  collapsed: boolean;
  isLargeScreen: boolean;
}

export default function TopNav({ onMenuClick, collapsed, isLargeScreen }: TopNavProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Get tooltip text based on screen size and sidebar state
  const getToggleTooltip = () => {
    if (isLargeScreen) {
      return collapsed ? 'Expand sidebar' : 'Collapse to icons only';
    } else {
      return collapsed ? 'Open menu' : 'Close menu';
    }
  };

  return (
    <div className="flex h-16 items-center justify-between">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
          title={getToggleTooltip()}
        >
          {isLargeScreen ? (
            collapsed ? (
              <ChevronRightIcon className="h-5 w-5" />
            ) : (
              <ChevronLeftIcon className="h-5 w-5" />
            )
          ) : (
            collapsed ? (
            <ChevronRightIcon className="h-5 w-5" />
          ) : (
            <ChevronLeftIcon className="h-5 w-5" />
          ))}
        </button>
        
        <div className="hidden sm:block">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
            Dashboard
          </h1>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Theme toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="p-2 rounded text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'light' ? (
            <MoonIcon className="h-5 w-5" />
          ) : (
            <SunIcon className="h-5 w-5" />
          )}
        </motion.button>

        {/* Notification Dropdown */}
        <NotificationDropdown />

        {/* User menu */}
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center space-x-2 sm:space-x-3 p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <img
              className="h-8 w-8 rounded-full ring-1 ring-neutral-300 dark:ring-neutral-600"
              src={user?.avatar}
              alt={user?.name}
            />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {user?.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Premium Member
              </p>
            </div>
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-48 sm:w-56 origin-top-right rounded bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-slate-200 dark:border-slate-700">
              <div className="p-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => navigate('/profile')}
                      className={clsx(
                        'flex w-full items-center rounded px-3 py-2 text-sm',
                        active
                          ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                          : 'text-slate-700 dark:text-slate-300'
                      )}
                    >
                      <UserIcon className="mr-3 h-4 w-4" />
                      Profile
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => navigate('/settings')}
                      className={clsx(
                        'flex w-full items-center rounded px-3 py-2 text-sm',
                        active
                          ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                          : 'text-slate-700 dark:text-slate-300'
                      )}
                    >
                      <CogIcon className="mr-3 h-4 w-4" />
                      Settings
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={logout}
                      className={clsx(
                        'flex w-full items-center rounded px-3 py-2 text-sm',
                        active
                          ? 'bg-error-50 dark:bg-error-900/50 text-error-600 dark:text-error-400'
                          : 'text-error-600 dark:text-error-400'
                      )}
                    >
                      <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
}