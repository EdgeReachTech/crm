'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark'; // The actual theme being applied (resolved from system)
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  // Get system theme preference
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Update actual theme based on current theme setting
  const updateActualTheme = (newTheme: Theme) => {
    const resolvedTheme = newTheme === 'system' ? getSystemTheme() : newTheme;
    setActualTheme(resolvedTheme);
    
    // Apply theme to document
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(resolvedTheme);
    }
  };

  // Set theme and persist to localStorage
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    updateActualTheme(newTheme);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
  };

  // Toggle between light and dark (ignoring system)
  const toggleTheme = () => {
    const newTheme = actualTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Initialize theme on mount
  useEffect(() => {
    // Get saved theme from localStorage or default to system
    const savedTheme = (typeof window !== 'undefined' ? localStorage.getItem('theme') : null) as Theme | null;
    const initialTheme = savedTheme || 'system';
    
    setThemeState(initialTheme);
    updateActualTheme(initialTheme);

    // Listen for system theme changes
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleSystemThemeChange = () => {
        if (theme === 'system') {
          updateActualTheme('system');
        }
      };

      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    actualTheme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Custom hook for theme-aware styling
export function useThemeStyles() {
  const { actualTheme } = useTheme();
  
  const getStyles = (lightStyles: string, darkStyles: string) => {
    return actualTheme === 'light' ? lightStyles : darkStyles;
  };

  const isDark = actualTheme === 'dark';
  const isLight = actualTheme === 'light';

  return {
    isDark,
    isLight,
    getStyles,
    theme: actualTheme,
  };
}