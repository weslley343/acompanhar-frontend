'use client';

import { useState, SyntheticEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/store';
import { UserRole } from '@/types/auth';
import { RiUserStarLine, RiHeartLine, RiArrowLeftLine, RiMagicLine } from 'react-icons/ri';

export default function Home() {
  const { setAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: SyntheticEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!activeTab) return;
      // Login com base no papel selecionado
      const authData = await authApi.login({ email, password }, activeTab);
      
      if (!authData || !authData.token) {
        throw new Error('Resposta de login inválida do servidor.');
      }

      const token = authData.token;

      // 2. Request Me Data
      const userData = await authApi.getMe(token);

      // 3. Set Auth
      setAuth(userData, token, authData.refreshToken);
      router.push('/home');
    } catch (err: any) {
      console.error('Login error detail:', err);
      setError('usuário ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-secondary flex flex-col items-center justify-center p-6">
      <div className="max-w-sm w-full flex flex-col gap-8">
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-20 h-20 mb-2">
            <Image 
              src="/logo/logo.png" 
              alt="Logo" 
              fill 
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white">Acompanhar</h1>
          <p className="text-white/40 text-sm font-medium">Faça login para continuar</p>
        </div>



        {!activeTab ? (
          <div className="flex flex-col gap-4 animate-fade-in">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest text-center mb-2">Quem é você?</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('professional')}
                className="flex flex-col items-center gap-4 p-6 bg-tertiary border border-white/5 rounded-[2rem] hover:bg-primary hover:border-primary group transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-secondary group-hover:text-primary transition-all">
                  <RiUserStarLine size={24} />
                </div>
                <span className="text-sm font-bold text-white group-hover:text-secondary">Profissional</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('responsible')}
                className="flex flex-col items-center gap-4 p-6 bg-tertiary border border-white/5 rounded-[2rem] hover:bg-primary hover:border-primary group transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-secondary group-hover:text-primary transition-all">
                  <RiHeartLine size={24} />
                </div>
                <span className="text-sm font-bold text-white group-hover:text-secondary">Responsável</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setActiveTab(null)}
                className="text-white/20 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all"
              >
                <RiArrowLeftLine size={16} /> Voltar
              </button>
              <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-widest border border-primary/20">
                {activeTab === 'professional' ? 'Profissional' : 'Responsável'}
              </span>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-tertiary border border-white/5 focus:border-primary/50 text-white px-5 py-4 rounded-2xl outline-none transition-all placeholder:text-white/20"
                />
                <input
                  type="password"
                  placeholder="Senha"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-tertiary border border-white/5 focus:border-primary/50 text-white px-5 py-4 rounded-2xl outline-none transition-all placeholder:text-white/20"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm font-bold text-center">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary hover:bg-primary/90 text-secondary font-black rounded-2xl transition-all shadow-xl shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <p className="text-center text-xs text-white/20 font-medium">
            Acesso restrito a profissionais e responsáveis autorizados.
          </p>
          <div className="h-px bg-white/5 w-full" />
          <Link 
            href="/generate-demo"
            className="flex items-center justify-center gap-2 py-4 bg-tertiary border border-white/5 text-white/60 hover:text-primary hover:border-primary/20 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all group"
          >
            <RiMagicLine size={16} className="group-hover:rotate-12 transition-transform" />
            Experimentar Demo
          </Link>
          <p className="text-center text-[10px] text-white/20 font-bold uppercase tracking-widest mt-2">
            É responsável? <Link href="/register" className="text-primary/60 hover:text-primary transition-colors">Crie sua conta aqui</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

