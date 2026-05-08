'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RiCheckboxCircleLine, RiLoader4Line, RiArrowRightLine } from 'react-icons/ri';
import { cn } from '@/lib/utils';

interface SuccessModalProps {
  isOpen: boolean;
  message: string;
  redirectUrl: string;
  autoRedirectTime?: number;
}

export default function SuccessModal({ 
  isOpen, 
  message, 
  redirectUrl, 
  autoRedirectTime = 3000 
}: SuccessModalProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(autoRedirectTime / 1000);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      router.push(redirectUrl);
    }, autoRedirectTime);

    const interval = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isOpen, redirectUrl, autoRedirectTime, router]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-secondary/80 backdrop-blur-xl" />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-tertiary border border-white/10 rounded-[3rem] p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex flex-col items-center text-center space-y-6 animate-scale-in">
        {/* Animated Icon Circle */}
        <div className="relative">
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center text-primary shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)] animate-bounce-slow">
            <RiCheckboxCircleLine size={64} />
          </div>
          {/* Progress Ring around the icon (simulated) */}
          <svg className="absolute inset-0 w-24 h-24 -rotate-90 pointer-events-none">
            <circle
              cx="48"
              cy="48"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary/20"
            />
            <circle
              cx="48"
              cy="48"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="290"
              strokeDashoffset={290 - (290 * (autoRedirectTime / 1000 - countdown)) / (autoRedirectTime / 1000)}
              className="text-primary transition-all duration-1000 ease-linear"
            />
          </svg>
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tighter text-white">Sucesso!</h2>
          <p className="text-white/40 text-sm leading-relaxed">{message}</p>
        </div>

        <div className="w-full pt-4 space-y-4">
          <button 
            onClick={() => router.push(redirectUrl)}
            className="w-full py-4 bg-primary text-secondary-dark rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 group"
          >
            Ir para Home
            <RiArrowRightLine size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="flex items-center justify-center gap-2 text-white/20 text-[10px] font-bold tracking-widest uppercase">
            <RiLoader4Line className="animate-spin" size={14} />
            Redirecionando em {Math.ceil(countdown)}s...
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
