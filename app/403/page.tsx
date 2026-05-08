'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RiShieldFlashLine, RiLoader4Line } from 'react-icons/ri';

export default function Forbidden() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/home');
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-6 text-center space-y-8 animate-fade-in">
      <div className="relative">
        <div className="w-32 h-32 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-pulse">
          <RiShieldFlashLine size={64} />
        </div>
        
        {/* Loading ring around the shield */}
        <div className="absolute inset-0 border-2 border-red-500/20 rounded-full scale-110 border-t-red-500 animate-spin" style={{ animationDuration: '3s' }} />
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Acesso Negado</h1>
        <p className="text-white/40 max-w-sm mx-auto text-sm md:text-base leading-relaxed">
          Você tentou acessar uma área restrita ou não tem as permissões necessárias.
        </p>
      </div>

      <div className="flex items-center gap-3 text-primary font-medium text-sm">
        <RiLoader4Line className="animate-spin" size={20} />
        Redirecionando para a página inicial...
      </div>
    </div>
  );
}
