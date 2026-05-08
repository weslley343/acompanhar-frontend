'use client';

import { useAuthStore } from '@/lib/stores/store';
import { RiEditBoxLine, RiMailLine, RiUser3Line, RiInformationLine, RiLogoutBoxRLine } from 'react-icons/ri';

export default function ProfileEdit() {
  const { user, logout } = useAuthStore();

  if (!user) return null;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-fade-in-up pb-12">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Editar Perfil</h2>
        <p className="text-white/50 text-sm">Atualize suas informações pessoais e de acesso.</p>
      </div>

      <form className="space-y-6">
        <div className="bg-tertiary border border-white/5 p-8 rounded-[2.5rem] space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/60 ml-1 flex items-center gap-2">
              <RiUser3Line className="text-primary" /> Nome Completo
            </label>
            <input 
              type="text" 
              defaultValue={user.full_name}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/60 ml-1 flex items-center gap-2">
              <RiMailLine className="text-primary" /> Email
            </label>
            <input 
              type="email" 
              defaultValue={user.email}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all opacity-60"
              disabled
            />
            <p className="text-[10px] text-white/30 ml-1 italic">O email não pode ser alterado diretamente.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/60 ml-1 flex items-center gap-2">
              <RiInformationLine className="text-primary" /> Sobre Você
            </label>
            <textarea 
              defaultValue={user.description || ''}
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none"
              placeholder="Conte um pouco sobre sua atuação..."
            />
          </div>
        </div>

        <div className="space-y-4">
          <button 
            type="button"
            className="w-full py-5 bg-primary hover:bg-primary-dark text-secondary-dark font-bold rounded-2xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
          >
            <RiEditBoxLine size={20} className="group-hover:scale-110 transition-transform" />
            Salvar Alterações
          </button>

          <button 
            type="button"
            onClick={() => logout()}
            className="w-full py-4 border border-white/5 bg-white/5 hover:bg-red-500/10 hover:border-red-500/20 text-white/40 hover:text-red-500 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group"
          >
            <RiLogoutBoxRLine size={20} className="group-hover:translate-x-1 transition-transform" />
            Sair da Conta
          </button>
        </div>
      </form>
    </div>
  );
}
