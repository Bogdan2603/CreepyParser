import { VT323, Creepster } from 'next/font/google';
import "./globals.css";
import { Providers } from "../components/Providers";
import ThemeToggle from "../components/ThemeToggle";

// Configurăm fonturile
const vt323 = VT323({ 
  weight: '400', 
  subsets: ['latin'],
  variable: '--font-vt323',
});

const creepster = Creepster({ 
  weight: '400', 
  subsets: ['latin'],
  variable: '--font-creepster',
});

export const metadata = {
  title: 'CreepyParser',
  description: 'Horror Metadata Extraction Tool',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${vt323.variable} ${creepster.variable} bg-gray-100 dark:bg-black text-gray-900 dark:text-gray-100 antialiased transition-colors duration-300`}>
        <Providers>
          <ThemeToggle />
          {children}
        </Providers>
      </body>
    </html>
  );
}