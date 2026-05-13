'use client';

import { useState, SyntheticEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  RiUserHeartLine, 
  RiMailLine, 
  RiLockLine, 
  RiArrowLeftLine, 
  RiLoader4Line,
  RiCheckLine,
  RiAtLine,
  RiFileTextLine
} from 'react-icons/ri';
import { responsibleApi } from '@/lib/api/responsibles';
import SuccessModal from '@/components/ui/SuccessModal';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    identifier: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: SyntheticEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await responsibleApi.create({
        ...formData,
        identifier: formData.identifier || undefined,
        description: formData.description || undefined
      });
      setSuccess(true);
    } catch (err: any) {
      console.error('Registration error:', err);
      const message = err.response?.data?.error || 'Erro ao criar conta. Verifique os dados e tente novamente.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <main className="min-h-screen bg-secondary flex flex-col items-center justify-center p-6 py-12">
      <div className="max-w-md w-full flex flex-col gap-8 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <Link 
            href="/" 
            className="self-start text-white/20 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all mb-4"
          >
            <RiArrowLeftLine size={16} /> Voltar para Login
          </Link>
          
          <div className="relative w-16 h-16 mb-2">
            <Image 
              src="/logo/logo.png" 
              alt="Logo" 
              fill 
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white">Criar Conta</h1>
          <p className="text-white/40 text-sm font-medium">
            Seja bem-vindo! Cadastre-se como responsável para acompanhar o progresso clínico.
          </p>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-6 bg-tertiary border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Nome Completo *</label>
              <div className="relative group">
                <RiUserHeartLine className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  name="full_name"
                  required
                  placeholder="Seu nome completo"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full bg-secondary border border-white/5 focus:border-primary/50 text-white px-12 py-4 rounded-2xl outline-none transition-all placeholder:text-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">E-mail *</label>
              <div className="relative group">
                <RiMailLine className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
                <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="exemplo@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-secondary border border-white/5 focus:border-primary/50 text-white px-12 py-4 rounded-2xl outline-none transition-all placeholder:text-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Usuário / Identifier (Opcional)</label>
              <div className="relative group">
                <RiAtLine className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  name="identifier"
                  placeholder="Nome de usuário para login"
                  value={formData.identifier}
                  onChange={handleChange}
                  className="w-full bg-secondary border border-white/5 focus:border-primary/50 text-white px-12 py-4 rounded-2xl outline-none transition-all placeholder:text-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Senha *</label>
              <div className="relative group">
                <RiLockLine className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
                <input 
                  type="password" 
                  name="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-secondary border border-white/5 focus:border-primary/50 text-white px-12 py-4 rounded-2xl outline-none transition-all placeholder:text-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Quem é você? (Opcional)</label>
              <div className="relative group">
                <RiFileTextLine className="absolute left-4 top-4 text-white/20 group-focus-within:text-primary transition-colors" />
                <textarea 
                  name="description"
                  rows={2}
                  placeholder="Ex: Pai da Maria, Fisioterapeuta do João..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-secondary border border-white/5 focus:border-primary/50 text-white px-12 py-4 rounded-2xl outline-none transition-all placeholder:text-white/10 resize-none"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs font-bold text-center animate-pulse">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-primary text-secondary font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RiLoader4Line className="animate-spin" size={20} />
                Criando Conta...
              </>
            ) : (
              <>
                Criar minha conta
                <RiCheckLine size={20} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-white/20 font-medium">
          Já tem uma conta? <Link href="/" className="text-primary hover:underline">Faça login aqui</Link>.
        </p>
      </div>

      <SuccessModal 
        isOpen={success}
        message="Sua conta foi criada com sucesso! Redirecionando para o login..."
        redirectUrl="/"
        autoRedirectTime={3000}
      />
    </main>
  );
}
