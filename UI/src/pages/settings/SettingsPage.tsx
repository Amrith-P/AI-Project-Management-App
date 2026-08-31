import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { Sun, Moon, User, Check, Palette } from 'lucide-react';
import { IntegrationsTab } from '../../components/settings/IntegrationsTab';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme, toggleTheme } = useTheme();
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto animate-fade-in">
      {/* Page Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-5">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Application Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Customize your theme preferences, appearance mode, system settings, and developer webhooks.
        </p>
      </div>

      {/* Developer Integrations & Webhooks Section */}
      <IntegrationsTab />

      {/* Theme & Appearance Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Appearance & Theme</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Choose between Light Mode and Dark Mode interface themes.
              </p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="px-3.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center gap-2"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                Switch to Dark Mode
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                Switch to Light Mode
              </>
            )}
          </button>
        </div>

        {/* Theme Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Light Mode Card */}
          <div
            onClick={() => setTheme('light')}
            className={`cursor-pointer p-4 rounded-2xl border-2 transition-all relative overflow-hidden ${
              theme === 'light'
                ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-md ring-2 ring-indigo-600/20'
                : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
            }`}
          >
            {theme === 'light' && (
              <span className="absolute top-3 right-3 p-1 rounded-full bg-indigo-600 text-white">
                <Check className="w-3.5 h-3.5" />
              </span>
            )}
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Light Mode</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Bright UI with crisp contrast</p>
              </div>
            </div>

            {/* Mock Light UI Preview */}
            <div className="bg-gray-100 p-2.5 rounded-xl border border-gray-200 space-y-1.5 pointer-events-none">
              <div className="h-2.5 bg-white rounded-md w-3/4 shadow-2xs"></div>
              <div className="h-2 bg-gray-200 rounded-md w-1/2"></div>
              <div className="flex gap-1.5 pt-1">
                <div className="h-3 w-8 bg-indigo-500 rounded"></div>
                <div className="h-3 w-12 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>

          {/* Dark Mode Card */}
          <div
            onClick={() => setTheme('dark')}
            className={`cursor-pointer p-4 rounded-2xl border-2 transition-all relative overflow-hidden ${
              theme === 'dark'
                ? 'border-indigo-600 bg-indigo-950/20 shadow-md ring-2 ring-indigo-600/20'
                : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
            }`}
          >
            {theme === 'dark' && (
              <span className="absolute top-3 right-3 p-1 rounded-full bg-indigo-600 text-white">
                <Check className="w-3.5 h-3.5" />
              </span>
            )}
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-indigo-900/60 text-indigo-400 rounded-xl">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Dark Mode</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Sleek, low-light dark aesthetic</p>
              </div>
            </div>

            {/* Mock Dark UI Preview */}
            <div className="bg-gray-950 p-2.5 rounded-xl border border-gray-800 space-y-1.5 pointer-events-none">
              <div className="h-2.5 bg-gray-800 rounded-md w-3/4"></div>
              <div className="h-2 bg-gray-900 rounded-md w-1/2"></div>
              <div className="flex gap-1.5 pt-1">
                <div className="h-3 w-8 bg-indigo-600 rounded"></div>
                <div className="h-3 w-12 bg-gray-800 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Info Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-xl">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Account Profile</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">User account details & authentication status</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800">
            <span className="text-gray-400 block font-medium">Full Name</span>
            <span className="font-bold text-gray-900 dark:text-white text-sm mt-0.5 block">{user?.full_name || 'Amrith'}</span>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800">
            <span className="text-gray-400 block font-medium">Email Address</span>
            <span className="font-bold text-gray-900 dark:text-white text-sm mt-0.5 block">{user?.email || 'user@example.com'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
