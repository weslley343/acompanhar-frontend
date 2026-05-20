'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface FABProps {
  href?: string;
  onClick?: () => void;
  icon: ReactNode;
  label?: string;
  className?: string;
  variant?: 'primary' | 'secondary';
  showLabel?: boolean;
  labelSide?: 'left' | 'right';
}

export default function FAB({ 
  href, 
  onClick, 
  icon, 
  label, 
  className,
  variant = 'primary',
  showLabel = false,
  labelSide = 'left',
}: FABProps) {
  const baseClassName = cn(
    "flex items-center justify-center transition-all active:scale-95 group relative z-40",
    variant === 'primary' 
      ? "bg-primary text-secondary-dark shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_50px_rgba(var(--primary-rgb),0.5)] border-4 border-secondary/80 hover:border-primary/20"
      : "bg-tertiary text-white shadow-xl border border-white/10 hover:bg-white/5",
    "w-14 h-14 md:w-16 md:h-16 rounded-full",
    className
  );

  const labelContent = label && (
    <span className={cn(
      "absolute px-3 py-1.5 bg-secondary/90 backdrop-blur-md border border-white/10 text-white text-xs font-bold rounded-xl whitespace-nowrap transition-all duration-300 pointer-events-none",
      labelSide === 'left'
        ? "right-full mr-4"
        : "left-full ml-4",
      showLabel ? "opacity-100 translate-x-0" : cn(
        "opacity-0 group-hover:opacity-100",
        labelSide === 'left' ? "translate-x-4 group-hover:translate-x-0" : "-translate-x-4 group-hover:translate-x-0"
      )
    )}>
      {label}
    </span>
  );

  const content = (
    <>
      <div className="relative z-10">
        {icon}
      </div>
      {labelContent}
      {/* Glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl",
        variant === 'primary' ? "bg-primary/20" : "bg-white/5"
      )} />
    </>
  );

  if (href) {
    return (
      <Link href={href} className={baseClassName} aria-label={label}>
        {content}
      </Link>
    );
  }

  return (
    <button 
      onClick={onClick}
      className={baseClassName}
      aria-label={label}
    >
      {content}
    </button>
  );
}
