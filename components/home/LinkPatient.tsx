'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RiArrowLeftLine, RiUserAddLine, RiSearchLine, RiInformationLine, RiHashtag, RiLoader4Line, RiErrorWarningLine, RiCheckboxCircleLine } from 'react-icons/ri';
import { useAuthStore } from '@/lib/stores/store';
import { clientService } from '@/lib/api/clients';
import { cn } from '@/lib/utils';

export default function LinkPatient() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!user) return null;

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!identifier || !code) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await clientService.linkClient(identifier, code);
      setSuccess(response.message || 'Paciente vinculado com sucesso!');

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/home');
      }, 2000);
    } catch (err: any) {
      let apiError = err.response?.data?.error || 'Ocorreu um erro ao tentar vincular o paciente.';
      if (apiError === 'Client not found') {
        apiError = 'Cliente não encontrado';
      } else if (apiError === 'Invalid code for this client') {
        apiError = 'Código inválido para este cliente';
      } else if (apiError === 'You are already linked to this client') {
        apiError = 'Você já está vinculado a este cliente';
      }
      setError(apiError);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-8 animate-fade-in">
        <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center text-primary shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)] animate-bounce-slow">
          <RiCheckboxCircleLine size={64} />
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl font-black tracking-tighter text-white">Sucesso!</h2>
          <p className="text-white/40 text-lg">{success}</p>
        </div>
        <div className="flex items-center gap-3 text-primary font-medium text-sm">
          <RiLoader4Line className="animate-spin" size={20} />
          Retornando para a home...
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-secondary text-white overflow-hidden flex flex-col">
      {/* Header */}
      <header className="h-16 bg-secondary/80 backdrop-blur-xl border-b border-white/5 flex items-center px-6 shrink-0">
        <div className="max-w-xl w-full mx-auto flex items-center gap-4">
          <button
            onClick={() => router.back()}
            disabled={loading}
            className="p-2 hover:bg-white/5 rounded-xl transition-all active:scale-90 text-white/50 hover:text-white disabled:opacity-20"
          >
            <RiArrowLeftLine size={20} />
          </button>
          <h1 className="text-lg font-bold">Vincular Paciente</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center px-6 max-w-xl mx-auto w-full space-y-6 animate-fade-in-up pb-8">
        {/* Intro */}
        <div className="space-y-2">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <RiUserAddLine size={24} />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tighter">Vincular Perfil</h2>
            <p className="text-white/40 text-sm leading-relaxed">
              Digite as credenciais do paciente para realizar o vínculo.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-tertiary border border-white/5 p-6 rounded-[2rem] space-y-5 shadow-2xl">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-3 text-red-500 text-xs animate-shake">
                <RiErrorWarningLine size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/30 ml-1 flex items-center gap-2 tracking-widest">
                <RiSearchLine className="text-primary" size={14} /> IDENTIFICADOR
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Ex: Brad1"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-lg text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-inner"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/30 ml-1 flex items-center gap-2 tracking-widest">
                <RiHashtag className="text-primary" size={14} /> CÓDIGO
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ex: NXXD5"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-lg text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-mono tracking-widest shadow-inner"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading || !identifier || !code}
              className={cn(
                "w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95",
                loading || !identifier || !code
                  ? "bg-white/5 text-white/20 cursor-not-allowed"
                  : "bg-primary text-secondary-dark shadow-primary/20 hover:bg-primary-dark"
              )}
            >
              {loading ? (
                <>
                  <RiLoader4Line size={20} className="animate-spin" />
                  Vinculando...
                </>
              ) : (
                <>
                  <RiCheckboxCircleLine size={20} />
                  Confirmar Vínculo
                </>
              )}
            </button>

            <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-start gap-3">
              <RiInformationLine className="text-white/20 shrink-0 mt-0.5" size={16} />
              <p className="text-[11px] text-white/20 leading-relaxed italic">
                O código do paciente é gerado automaticamente pela plataforma e atualizado após cada vínculo realizado com sucesso.
              </p>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
