import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { toggleTheme } from '../../store/slices/themeSlice';

export const ThemeToggle: React.FC = () => {
  const dispatch = useDispatch();
  const mode = useSelector((state: RootState) => state.theme?.mode || 'dark');

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      title={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} Mode`}
      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700/60 transition-all"
    >
      {mode === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-400 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
};
