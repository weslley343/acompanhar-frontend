'use client';

import { useState } from 'react';
import {
  RiGroupLine,
  RiUserSettingsLine,
  RiLightbulbFlashLine,
  RiLogoutBoxLine,
  RiUserStarLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiAddLine,
  RiLink,
  RiDashboardLine,
} from 'react-icons/ri';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useAuthStore } from '@/lib/stores/store';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { IconType } from 'react-icons';

export type TabType = 'users' | 'profile' | 'suggestions' | 'professionals' | 'dashboard';

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
    { id: 'professionals', label: 'Equipe', icon: RiUserStarLine },
    { id: 'profile', label: 'Perfil', icon: RiUserSettingsLine },
    { id: 'suggestions', label: 'FAQ', icon: RiLightbulbFlashLine },
  ],
  professional: [
    { id: 'dashboard', label: 'Dashboard', icon: RiDashboardLine },
    { id: 'users', label: 'Pacientes', icon: RiGroupLine },
    { id: 'profile', label: 'Perfil', icon: RiUserSettingsLine },
    { id: 'suggestions', label: 'FAQ', icon: RiLightbulbFlashLine },
  ],
  responsible: [
    { id: 'users', label: 'Vínculos', icon: RiGroupLine },
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
  const [expanded, setExpanded] = useState(false);

  const menuItems = user ? (ROLE_MENUS[user.role] || []) : [];

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          DESKTOP — Top Navbar (logo + nome + theme toggle)
      ══════════════════════════════════════════════════════════════ */}
      <header
        className="flex fixed top-0 left-0 right-0 h-16 z-50 items-center px-6 gap-4"
        style={{
          background: 'color-mix(in srgb, var(--secondary) 80%, transparent)',
          borderBottom: '1px solid color-mix(in srgb, var(--adaptive-white) 6%, transparent)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Logo + nome */}
        <div className="flex items-center gap-3 select-none">
          <Image
            src="/logo/logo.png"
            alt="Acompanhar SR"
            width={36}
            height={36}
            className="rounded-xl"
            style={{ width: 'auto', height: 'auto' }}
          />
          <div className="flex flex-col leading-tight">
            <span
              className="text-base font-extrabold tracking-tight"
              style={{ color: 'var(--foreground)' }}
            >
              Acompanhar
            </span>
            <span
              className="text-[10px] font-bold uppercase tracking-[0.2em] -mt-0.5"
              style={{ color: 'var(--primary)' }}
            >
              SR
            </span>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Theme toggle */}
        <ThemeToggle />
      </header>

      {/* ═══════════════════════════════════════════════════════════
          DESKTOP — Right-side Full-height Vertical Tab Bar
      ══════════════════════════════════════════════════════════════ */}
      <nav
        aria-label="Navegação principal"
        className={cn(
          'hidden md:flex fixed right-0 top-16 bottom-0 z-40',
          'flex-col items-stretch gap-1 py-4',
          'transition-all duration-300 ease-in-out',
          expanded ? 'w-56 px-3' : 'w-[4.5rem] px-2',
        )}
        style={{
          background: 'color-mix(in srgb, var(--tertiary) 95%, transparent)',
          borderLeft: '1px solid color-mix(in srgb, var(--adaptive-white) 6%, transparent)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* ── Collapse toggle ──────────────────────────────────── */}
        <div className={cn(
          'flex items-center mb-2 px-1',
          expanded ? 'justify-end' : 'justify-center',
        )}>
          <button
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? 'Recolher menu' : 'Expandir menu'}
            className="p-2 rounded-xl transition-all duration-200"
            style={{ color: 'color-mix(in srgb, var(--adaptive-white) 40%, transparent)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'color-mix(in srgb, var(--adaptive-white) 8%, transparent)';
              e.currentTarget.style.color = 'color-mix(in srgb, var(--adaptive-white) 70%, transparent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'color-mix(in srgb, var(--adaptive-white) 40%, transparent)';
            }}
          >
            {expanded ? <RiMenuFoldLine size={18} /> : <RiMenuUnfoldLine size={18} />}
          </button>
        </div>

        {/* ── Nav items + Actions ───────────────────────────────── */}
        <div className="flex flex-col gap-1 flex-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                title={!expanded ? item.label : undefined}
                className={cn(
                  'relative flex items-center gap-3 rounded-2xl transition-all duration-200',
                  'text-sm font-semibold overflow-hidden',
                  expanded ? 'px-3 py-3' : 'justify-center py-3',
                )}
                style={
                  isActive
                    ? {
                        background: 'var(--primary)',
                        boxShadow: '0 4px 20px color-mix(in srgb, var(--primary) 30%, transparent)',
                        color: 'var(--secondary-dark)',
                      }
                    : { color: 'color-mix(in srgb, var(--adaptive-white) 45%, transparent)' }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'color-mix(in srgb, var(--adaptive-white) 7%, transparent)';
                    e.currentTarget.style.color = 'color-mix(in srgb, var(--adaptive-white) 70%, transparent)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'color-mix(in srgb, var(--adaptive-white) 45%, transparent)';
                  }
                }}
              >
                {/* Left-edge active indicator */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                    style={{ background: 'var(--secondary-dark)', opacity: 0.35 }}
                  />
                )}

                <item.icon size={20} className="shrink-0" />

                <span
                  className={cn(
                    'whitespace-nowrap transition-all duration-200 origin-left',
                    expanded ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 w-0',
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* ── Action buttons (only on 'users' tab) ────────────── */}
          {activeTab === 'users' && (
            <div className="flex flex-col gap-1 mt-1">
              <Divider />
              {expanded && (
                <span
                  className="px-2 text-[9px] font-black uppercase tracking-[0.15em] mb-0.5"
                  style={{ color: 'color-mix(in srgb, var(--adaptive-white) 28%, transparent)' }}
                >
                  Ações
                </span>
              )}

              {/* Link/Vínculo button */}
              <Link
                href="/patients/link"
                title={!expanded ? (user?.role === 'responsible' ? 'Adicionar Vínculo' : 'Vincular Paciente') : undefined}
                aria-label={user?.role === 'responsible' ? 'Adicionar Vínculo' : 'Vincular Paciente'}
                className={cn(
                  'flex items-center gap-3 rounded-2xl transition-all duration-200',
                  'text-sm font-semibold overflow-hidden border',
                  expanded ? 'px-3 py-2.5' : 'justify-center py-2.5',
                )}
                style={{
                  color: 'var(--primary)',
                  borderColor: 'color-mix(in srgb, var(--primary) 30%, transparent)',
                  background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
                }}
              >
                <RiLink size={18} className="shrink-0" />
                <span
                  className={cn(
                    'whitespace-nowrap transition-all duration-200 origin-left',
                    expanded ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 w-0',
                  )}
                >
                  {user?.role === 'responsible' ? 'Adicionar Vínculo' : 'Vincular Paciente'}
                </span>
              </Link>

              {/* New user button — responsible only */}
              {user?.role === 'responsible' && (
                <Link
                  href="/patients/create"
                  title={!expanded ? 'Novo Usuário' : undefined}
                  aria-label="Novo Usuário"
                  className={cn(
                    'flex items-center gap-3 rounded-2xl transition-all duration-200',
                    'text-sm font-semibold overflow-hidden',
                    expanded ? 'px-3 py-2.5' : 'justify-center py-2.5',
                  )}
                  style={{
                    background: 'var(--primary)',
                    color: 'var(--secondary-dark)',
                    boxShadow: '0 4px 16px color-mix(in srgb, var(--primary) 25%, transparent)',
                  }}
                >
                  <RiAddLine size={18} className="shrink-0" />
                  <span
                    className={cn(
                      'whitespace-nowrap transition-all duration-200 origin-left',
                      expanded ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 w-0',
                    )}
                  >
                    Novo Usuário
                  </span>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* ── Divider ──────────────────────────────────────────── */}
        <Divider />

        {/* ── Logout ───────────────────────────────────────────── */}
        <button
          onClick={() => { logout(); router.push('/login'); }}
          aria-label="Sair do sistema"
          title={!expanded ? 'Sair' : undefined}
          className={cn(
            'flex items-center gap-3 rounded-2xl transition-all duration-200 group overflow-hidden',
            expanded ? 'px-3 py-3' : 'justify-center py-3',
          )}
          style={{ color: 'rgba(239,68,68,0.45)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgb(239,68,68)';
            e.currentTarget.style.background = 'rgba(239,68,68,0.10)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(239,68,68,0.45)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <RiLogoutBoxLine size={20} className="shrink-0 group-active:scale-90 transition-transform" />
          <span
            className={cn(
              'text-sm font-semibold whitespace-nowrap transition-all duration-200 origin-left',
              expanded ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 w-0',
            )}
          >
            Sair
          </span>
        </button>
      </nav>

      {/* ═══════════════════════════════════════════════════════════
          MOBILE — Bottom pill tab bar
      ══════════════════════════════════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-20 bg-tertiary/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] z-50 flex items-center justify-around px-4 shadow-2xl shadow-black/50 overflow-hidden">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 transition-all duration-300 w-full h-full',
                isActive ? 'text-primary scale-110' : 'text-white/30',
              )}
            >
              {isActive && (
                <div className="absolute -top-1 w-12 h-1 bg-primary rounded-full blur-[2px] animate-pulse" />
              )}
              <item.icon size={24} />
              <span className={cn(
                'text-[10px] font-bold uppercase tracking-widest transition-all',
                isActive ? 'opacity-100' : 'opacity-0',
              )}>
                {item.label}
              </span>
            </button>
          );
        })}

        <button
          onClick={() => { logout(); router.push('/login'); }}
          className="relative flex flex-col items-center justify-center gap-1 text-red-500/40 hover:text-red-500 transition-all duration-300 w-full h-full group"
        >
          <RiLogoutBoxLine size={24} className="group-active:scale-90 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-widest transition-all opacity-0 pointer-events-none select-none">
            Sair
          </span>
        </button>
      </nav>
    </>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────── */
function Divider() {
  return (
    <div
      className="mx-auto my-1 h-px w-8 rounded-full"
      style={{ background: 'color-mix(in srgb, var(--adaptive-white) 10%, transparent)' }}
    />
  );
}
