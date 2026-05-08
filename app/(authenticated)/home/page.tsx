'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/store';
import Navigation, { TabType, ROLE_MENUS } from '@/components/layout/Navigation';
import UserList from '@/components/home/UserList';
import ProfileEdit from '@/components/home/ProfileEdit';
import Suggestions from '@/components/home/Suggestions';
import FAB from '@/components/ui/FAB';
import { RiAddLine, RiLink } from 'react-icons/ri';

export default function HomePage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('users');

  // Ajusta a aba inicial baseada no papel do usuário e no menu configurado
  useEffect(() => {
    if (user) {
      const allowedTabs = ROLE_MENUS[user.role].map(item => item.id);
      if (!allowedTabs.includes(activeTab)) {
        setActiveTab(allowedTabs[0]);
      }
    }
  }, [user?.role, activeTab]);

  if (!user) {
    return null;
  }

  const renderContent = () => {
    // Proteção extra: se a aba atual não estiver no menu do usuário, não renderiza conteúdo indevido
    const allowedTabs = ROLE_MENUS[user.role].map(item => item.id);
    if (!allowedTabs.includes(activeTab)) {
      return null;
    }

    switch (activeTab) {
      case 'users':
        return <UserList />;
      case 'profile':
        return <ProfileEdit />;
      case 'suggestions':
        return <Suggestions />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-secondary text-white pb-32 md:pb-0 pt-20 md:pt-24">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="px-6 py-8 md:px-12 lg:px-24">
        {renderContent()}
      </main>
      
      {/* Floating Action Buttons */}
      {activeTab === 'users' && (
        <div className="fixed bottom-32 right-6 md:bottom-12 md:right-12 flex flex-col gap-4 z-50 animate-fade-in-up">
          <FAB 
            href="/patients/link" 
            icon={<RiLink size={24} />} 
            label="VINCULAR PACIENTE"
            variant="secondary"
          />
          {user.role === 'responsible' && (
            <FAB 
              href="/patients/create" 
              icon={<RiAddLine size={32} />} 
              label="NOVO PACIENTE"
              variant="primary"
            />
          )}
        </div>
      )}
    </div>
  );
}

