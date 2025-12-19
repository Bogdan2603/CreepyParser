'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="fixed top-4 right-4 z-50 px-4 py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-600 rounded text-red-500 font-mono transition-colors duration-200"
      aria-label="Toggle Dark Mode"
    >
      {theme === 'dark' ? '🕯️ LIGHT' : '🌑 DARK'}
    </button>
  );
}
