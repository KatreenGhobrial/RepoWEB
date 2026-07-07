import { useState, useEffect } from 'react';

/**
 * Custom hook for managing dark/light mode.
 * 
 * - Reads the saved preference from localStorage on mount.
 * - Falls back to the user's OS preference if nothing is saved.
 * - Syncs the `dark` class on <html> and persists changes to localStorage.
 * 
 * @returns {{ isDark: boolean, theme: 'dark'|'light', toggleTheme: () => void, setTheme: (t: 'dark'|'light') => void }}
 */
export default function useDarkMode() {
  // Initialize theme from localStorage, falling back to OS preference
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;

    // Respect OS preference when there is no saved value
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  // Apply or remove the 'dark' class on <html> and save the choice whenever theme changes
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Persist the user's theme choice across page reloads
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Listen for OS-level preference changes (e.g. user switches system theme)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      // Only follow OS if user hasn't explicitly saved a preference
      if (!localStorage.getItem('theme')) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', handler);
    // Clean up the listener when the hook unmounts
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Toggle between dark and light mode
  const toggleTheme = () => setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  // Directly set a specific theme value
  const setTheme = (t) => setThemeState(t);

  return { isDark: theme === 'dark', theme, toggleTheme, setTheme };
}
