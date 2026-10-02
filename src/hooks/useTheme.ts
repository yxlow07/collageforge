'use client';

import { useState, useEffect, useCallback } from 'react';

export type AppTheme = 'dark' | 'light';

export function useTheme() {
  const [theme, setTheme] = useState<AppTheme>('dark');
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    const savedTheme = localStorage.getItem('collage_theme') as AppTheme | null;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      const initial = prefersLight ? 'light' : 'dark';
      setTheme(initial);
      document.documentElement.setAttribute('data-theme', initial);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const nextTheme: AppTheme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('collage_theme', nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
      return nextTheme;
    });
  }, []);

  return {
    theme,
    toggleTheme,
    isMounted,
  };
}
