'use client';

import { RiGroupLine, RiUserSettingsLine, RiLightbulbFlashLine, RiLogoutBoxLine } from 'react-icons/ri';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useAuthStore } from '@/lib/stores/store';
import { UserRole } from '@/types/auth';

import { IconType } from 'react-icons';

export type TabType = 'users' | 'profile' | 'suggestions';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export interface NavItem {
  id: TabType;
  label: string;
  icon: IconType;
}

export const ROLE_MENUS: Record<string, NavItem[]> = {
  admin: [
    { id: 'profile', label: 'Perfil', icon: RiUserSettingsLine },
    { id: 'suggestions', label: 'FAQ', icon: RiLightbulbFlashLine },
  ],
  professional: [
    { id: 'users', label: 'Pacientes', icon: RiGroupLine },
    { id: 'profile', label: 'Perfil', icon: RiUserSettingsLine },
    { id: 'suggestions', label: 'FAQ', icon: RiLightbulbFlashLine },
  ],
  responsible: [
    { id: 'users', label: 'Pacientes', icon: RiGroupLine },
    { id: 'profile', label: 'Meu Perfil', icon: RiUserSettingsLine },
    { id: 'suggestions', label: 'FAQ', icon: RiLightbulbFlashLine },
  ],
};

// Aliases para compatibilidade
ROLE_MENUS.professionals = ROLE_MENUS.professional;
ROLE_MENUS.responsibles = ROLE_MENUS.responsible;

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const menuItems = user ? (ROLE_MENUS[user.role] || []) : [];

  return (
    <>
      {/* Desktop Top Tab Bar */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 h-20 bg-secondary/80 backdrop-blur-xl border-b border-white/5 z-50 items-center justify-center px-6">
        <div className="max-w-4xl w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo/logo.png" alt="Acompanha Logo" width={40} height={40} className="rounded-lg" />
          </div>

          <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-bold text-sm",
                  activeTab === item.id
                    ? "bg-primary text-secondary-dark shadow-lg shadow-primary/20"
                    : "text-white/40 hover:text-white/60 hover:bg-white/5"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              title="Sair do sistema"
              className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20 shadow-lg shadow-red-500/5 group"
            >
              <RiLogoutBoxLine size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-20 bg-tertiary/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] z-50 flex items-center justify-around px-4 shadow-2xl shadow-black/50 overflow-hidden">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 transition-all duration-300 w-full h-full",
                isActive ? "text-primary scale-110" : "text-white/30"
              )}
            >
              {isActive && (
                <div className="absolute -top-1 w-12 h-1 bg-primary rounded-full blur-[2px] animate-pulse" />
              )}
              <item.icon size={24} />
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest transition-all",
                isActive ? "opacity-100" : "opacity-0"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}

        <button
          onClick={() => {
            logout();
            router.push('/login');
          }}
          className="relative flex flex-col items-center justify-center text-red-500/40 hover:text-red-500 transition-all duration-300 w-full h-full group"
        >
          <RiLogoutBoxLine size={24} className="group-active:scale-90 transition-transform" />
        </button>
      </nav>
    </>
  );
}
