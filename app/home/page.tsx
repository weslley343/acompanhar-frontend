'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function HomePage() {
  const { user, isAuthenticated, logout, hydrate } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null; // Or a loading spinner
  }

  return (
    <main className="min-h-screen bg-secondary flex flex-col items-center justify-center p-6 animate-fade-in-up">
      <div className="max-w-md w-full bg-tertiary p-8 rounded-3xl border border-white/5 shadow-2xl flex flex-col items-center text-center gap-6">
        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary border-2 border-primary/30 relative overflow-hidden">
          {user.image_url ? (
            <Image src={user.image_url} alt={user.full_name} fill className="object-cover" />
          ) : (
            <span className="text-4xl font-bold">{user.full_name.charAt(0)}</span>
          )}
        </div>
        
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">{user.full_name}</h1>
          <p className="text-primary text-sm font-semibold tracking-widest uppercase">{user.role}</p>
        </div>

        <div className="w-full space-y-4 text-left py-4 border-y border-white/5">
          <div>
            <p className="text-xs text-white/40 uppercase font-bold tracking-tighter">Email</p>
            <p className="text-white/80">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 uppercase font-bold tracking-tighter">Identificador</p>
            <p className="text-white/80 font-mono text-sm">{user.identifier}</p>
          </div>
          {user.description && (
            <div>
              <p className="text-xs text-white/40 uppercase font-bold tracking-tighter">Sobre</p>
              <p className="text-white/80 text-sm italic">"{user.description}"</p>
            </div>
          )}
        </div>

        <button 
          onClick={logout}
          className="w-full py-4 bg-white/5 hover:bg-red-500/10 text-white/60 hover:text-red-400 rounded-2xl transition-all font-bold border border-white/5 hover:border-red-500/20"
        >
          Sair da conta
        </button>
      </div>
    </main>
  );
}
