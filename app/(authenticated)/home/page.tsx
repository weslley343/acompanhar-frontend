'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/store';
import Navigation, { TabType, ROLE_MENUS } from '@/components/layout/Navigation';
import UserList from '@/components/home/UserList';
import ProfileEdit from '@/components/home/ProfileEdit';
import Suggestions from '@/components/home/Suggestions';
import ProfessionalDashboard from '@/components/home/ProfessionalDashboard';
import FAB from '@/components/ui/FAB';
import { RiAddLine, RiLink } from 'react-icons/ri';
import ProfessionalList from '@/components/admin/ProfessionalList';

export default function HomePage() {
  const { user } = useAuthStore();

  // Profissionais começam no dashboard; demais papéis na primeira aba do menu
  const initialTab = (): TabType => {
    if (typeof window === 'undefined') return 'users';
    // lido diretamente do store para ser síncrono
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState<TabType>(initialTab());

  // Ajusta a aba inicial baseada no papel do usuário e no menu configurado
  useEffect(() => {
    if (user) {
      const menu = ROLE_MENUS[user.role] || [];
      const allowedTabs = menu.map((item) => item.id);
      if (allowedTabs.length > 0 && !allowedTabs.includes(activeTab)) {
        setActiveTab(allowedTabs[0]);
      }
    }
  }, [user?.role]);

  if (!user) {
    return null;
  }

  const renderContent = () => {
    const menu = ROLE_MENUS[user?.role || ''] || [];
    const allowedTabs = menu.map((item) => item.id);

    if (user && allowedTabs.length > 0 && !allowedTabs.includes(activeTab)) {
      return null;
    }

    switch (activeTab) {
      case 'dashboard':
        return <ProfessionalDashboard />;
      case 'users':
        return <UserList />;
      case 'profile':
        return <ProfileEdit />;
      case 'suggestions':
        return <Suggestions />;
      case 'professionals':
        return <ProfessionalList />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-secondary text-white pt-16 pb-32 md:pb-0 md:pr-20">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="px-6 py-8 md:px-12 lg:px-24">
        {renderContent()}
      </main>

      {/* Floating Action Buttons — mobile only, shown on 'users' tab */}
      {activeTab === 'users' && (
        <div className="md:hidden fixed bottom-32 left-6 flex flex-col gap-4 z-40 animate-fade-in-up">
          <FAB
            href="/patients/link"
            icon={<RiLink size={24} />}
            label={user.role === 'responsible' ? 'ADICIONAR VÍNCULO' : 'VINCULAR PACIENTE'}
            labelSide="right"
            variant="secondary"
          />
          {user.role === 'responsible' && (
            <FAB
              href="/patients/create"
              icon={<RiAddLine size={32} />}
              label="NOVO USUÁRIO"
              labelSide="right"
              variant="primary"
            />
          )}
        </div>
      )}
    </div>
  );
}
