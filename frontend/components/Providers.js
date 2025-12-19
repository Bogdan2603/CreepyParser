'use client';

import { ThemeProvider } from 'next-themes';
import { useEffect, useState } from 'react';

export function Providers({ children }) {
  const [mounted, setMounted] = useState(false);

  // UseEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}
