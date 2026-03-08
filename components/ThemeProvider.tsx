'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextValue {
  isLight: boolean;
  toggleTheme: () => void;
  gameUnlocked: boolean;
  setGameUnlocked: (v: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  isLight: false,
  toggleTheme: () => {},
  gameUnlocked: false,
  setGameUnlocked: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isLight, setIsLight] = useState(false);
  const [gameUnlocked, setGameUnlockedState] = useState(false);

  useEffect(() => {
    // Hydrate dari localStorage
    if (localStorage.getItem('theme') === 'light') setIsLight(true);
    if (localStorage.getItem('gameUnlocked') === 'true') setGameUnlockedState(true);
  }, []);

  // Sinkronkan body background supaya tidak flicker saat navigasi
  useEffect(() => {
    document.body.style.background = isLight ? '#f0f4ff' : '#0a0e27';
    document.body.style.color = isLight ? '#0f172a' : '#e2e8f0';
  }, [isLight]);

  const toggleTheme = () => {
    const next = !isLight;
    setIsLight(next);
    localStorage.setItem('theme', next ? 'light' : 'dark');
  };

  const setGameUnlocked = (v: boolean) => {
    setGameUnlockedState(v);
    localStorage.setItem('gameUnlocked', v ? 'true' : 'false');
  };

  return (
    <ThemeContext.Provider value={{ isLight, toggleTheme, gameUnlocked, setGameUnlocked }}>
      {children}
    </ThemeContext.Provider>
  );
}