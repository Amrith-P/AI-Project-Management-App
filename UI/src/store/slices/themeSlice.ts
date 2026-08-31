import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'dark' | 'light';

interface ThemeState {
  mode: ThemeMode;
}

const initialMode = (localStorage.getItem('themeMode') as ThemeMode) || 'dark';

const initialState: ThemeState = {
  mode: initialMode,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      localStorage.setItem('themeMode', action.payload);
      if (action.payload === 'light') {
        document.documentElement.classList.add('light-mode');
      } else {
        document.documentElement.classList.remove('light-mode');
      }
    },
    toggleTheme: (state) => {
      const nextMode = state.mode === 'dark' ? 'light' : 'dark';
      state.mode = nextMode;
      localStorage.setItem('themeMode', nextMode);
      if (nextMode === 'light') {
        document.documentElement.classList.add('light-mode');
      } else {
        document.documentElement.classList.remove('light-mode');
      }
    },
  },
});

export const { setThemeMode, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
