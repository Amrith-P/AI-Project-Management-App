import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, User, LogOut, Sparkles } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import type { RootState } from '../../store';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onToggleAiCopilot?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleAiCopilot }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleViewProfile = () => {
    setIsProfileOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center flex-1">
        <button className="md:hidden p-2 text-gray-400 hover:text-gray-500 mr-4">
          <Menu className="h-6 w-6" />
        </button>
        <div className="max-w-md w-full lg:max-w-xs relative hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
            placeholder="Search projects, tasks..."
            type="search"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* AI Copilot Button */}
        {onToggleAiCopilot && (
          <button
            onClick={onToggleAiCopilot}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold hover:from-indigo-700 hover:to-purple-700 shadow-sm transition-all transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Copilot
          </button>
        )}

        <button className="p-2 text-gray-400 hover:text-gray-500 relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        <div className="relative flex items-center border-l border-gray-200 pl-3" ref={dropdownRef}>
          <button 
            className="flex items-center space-x-3 focus:outline-none"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <span className="hidden md:block text-sm font-medium text-gray-700">
              {user?.full_name || 'User'}
            </span>
            <img
              className="h-8 w-8 rounded-full border border-gray-200 object-cover"
              src={`https://ui-avatars.com/api/?name=${user?.full_name || 'U'}&background=c7d2fe&color=3730a3`}
              alt="Profile"
            />
          </button>

          {isProfileOpen && (
            <div className="origin-top-right absolute right-0 top-10 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleViewProfile}
                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <User className="mr-3 h-4 w-4 text-gray-400" />
                View Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="mr-3 h-4 w-4 text-red-500" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
