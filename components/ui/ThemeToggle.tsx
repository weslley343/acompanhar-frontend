'use client';

import { useEffect, useState } from 'react';
import { RiSunLine, RiMoonLine } from 'react-icons/ri';
import { cn } from '@/lib/utils';

export default function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (savedTheme) return savedTheme;
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  });
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);

    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!mounted) {
    // Skeleton placeholder to prevent layout shifts
    return (
      <div className={cn("w-10 h-10 rounded-xl bg-tertiary border border-white/5 animate-pulse", className)} />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative w-10 h-10 rounded-xl bg-tertiary border border-white/5 flex items-center justify-center text-white/60 hover:text-primary hover:border-primary/20 hover:scale-105 active:scale-95 transition-all duration-300 shadow-md group overflow-hidden cursor-pointer",
        className
      )}
      title={theme === 'light' ? "Mudar para modo escuro" : "Mudar para modo claro"}
      aria-label="Alternar tema"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {theme === 'light' ? (
          <RiMoonLine size={20} className="text-foreground transition-all duration-300 group-hover:rotate-12" />
        ) : (
          <RiSunLine size={20} className="text-foreground transition-all duration-300 group-hover:rotate-45" />
        )}
      </div>
    </button>
  );
}
