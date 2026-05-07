'use client';

import { useState, useEffect, SyntheticEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function AdminLogin() {
  const { isAuthenticated, setAuth, hydrate } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/home');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: SyntheticEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Request Login (Admin endpoint)
      const { data: authData } = await api.post('/auth/login/', { email, password });
      
      const token = authData.token;

      // 2. Request Me Data
      const { data: userData } = await api.get('/auth/me/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 3. Set Auth
      setAuth(userData, token);
      router.push('/home');
    } catch (err: any) {
      setError('Credenciais de administrador incorretas');
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
              className="object-contain grayscale contrast-125"
              priority
            />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white">Painel Admin</h1>
          <p className="text-white/40 text-sm font-medium text-center px-4">Acesso exclusivo para administradores do sistema</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <input
              type="email"
              placeholder="Email Admin"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-tertiary border border-white/5 focus:border-primary/50 text-white px-5 py-4 rounded-2xl outline-none transition-all placeholder:text-white/20"
            />
            <input
              type="password"
              placeholder="Senha Admin"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-tertiary border border-white/5 focus:border-primary/50 text-white px-5 py-4 rounded-2xl outline-none transition-all placeholder:text-white/20"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm font-bold text-center animate-pulse">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary hover:bg-primary/90 text-secondary font-black rounded-2xl transition-all shadow-xl shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Autenticando...' : 'Entrar no Painel'}
          </button>
        </form>

        <p className="text-center text-xs text-white/20 font-medium">
          Ao fazer login, você concorda com as políticas de segurança.
        </p>
        
        <button 
          onClick={() => router.push('/')}
          className="text-white/40 text-xs hover:text-white transition-colors"
        >
          Voltar para login comum
        </button>
      </div>
    </main>
  );
}
