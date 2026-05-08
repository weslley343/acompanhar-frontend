'use client';

import Link from 'next/link';
import { RiHome4Line, RiGhostLine } from 'react-icons/ri';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-6 text-center space-y-8 animate-fade-in">
      <div className="relative">
        {/* Decorative background 404 */}
        <div className="text-[10rem] md:text-[15rem] font-black text-white/5 select-none leading-none tracking-tighter">
          404
        </div>
        
        {/* Ghost icon with bounce animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <RiGhostLine size={100} className="text-primary animate-bounce opacity-80" style={{ animationDuration: '3s' }} />
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Página não encontrada</h1>
        <p className="text-white/40 max-w-md mx-auto text-sm md:text-base leading-relaxed">
          Ops! Parece que o caminho que você tentou seguir desapareceu ou nunca existiu. 
          Não se preocupe, vamos te levar de volta.
        </p>
      </div>

      <Link 
        href="/home" 
        className="flex items-center gap-3 bg-primary hover:bg-primary-dark text-secondary-dark px-10 py-4.5 rounded-2xl font-bold transition-all shadow-xl shadow-primary/20 active:scale-95 group relative overflow-hidden"
      >
        <RiHome4Line size={24} className="group-hover:-translate-y-0.5 transition-transform" />
        Voltar para o Início
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>
    </div>
  );
}
