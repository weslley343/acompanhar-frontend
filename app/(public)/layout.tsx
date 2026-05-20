'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/store';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, hydrate } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    hydrate();
    setIsHydrated(true);
  }, [hydrate]);

  useEffect(() => {
    // Redirect authenticated users away from login pages to the dashboard
    const isLoginPage = pathname === '/' || pathname === '/admin';
    if (isHydrated && isAuthenticated && isLoginPage) {
      router.push('/home');
    }
  }, [isHydrated, isAuthenticated, router, pathname]);

  return (
    <>
      <div className="fixed top-6 right-6 z-50 animate-fade-in">
        <ThemeToggle />
      </div>
      {children}
    </>
  );
}
