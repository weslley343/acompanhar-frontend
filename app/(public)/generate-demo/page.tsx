'use client';

import { useState, SyntheticEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RiArrowLeftLine, RiMagicLine, RiLoader4Line, RiUserStarLine, RiHeartLine } from 'react-icons/ri';
import { demoApi } from '@/lib/api/demo';
import { DemoResponse } from '@/types/demo';
import DemoSuccess from '@/components/home/DemoSuccess';

export default function GenerateDemoPage() {
  const [professionalName, setProfessionalName] = useState('');
  const [responsibleName, setResponsibleName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<DemoResponse | null>(null);

  const handleGenerate = async (e: SyntheticEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await demoApi.generateDemo(
        professionalName || undefined,
        responsibleName || undefined
      );
      setResult(data);
    } catch (err: any) {
      console.error('Demo generation error:', err);
      setError('Ocorreu um erro ao gerar o ambiente. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <main className="min-h-screen bg-secondary flex flex-col items-center p-6 pt-12">
        <DemoSuccess data={result} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-secondary flex flex-col items-center justify-center p-6">
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
          <h1 className="text-3xl font-black tracking-tighter text-white">Modo Demonstração</h1>
          <p className="text-white/40 text-sm font-medium max-w-xs">
            Gere um ambiente completo com pacientes e avaliações simuladas para testar todas as funcionalidades.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-6 animate-pulse">
            <div className="relative">
              <RiLoader4Line size={64} className="text-primary animate-spin" />
              <RiMagicLine size={24} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-white">Criando sua experiência...</h3>
              <p className="text-white/20 text-xs font-bold uppercase tracking-[0.2em]">Isso pode levar alguns segundos</p>
            </div>

            <div className="w-full max-w-xs bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-[loading-bar_3s_ease-in-out_infinite]" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleGenerate} className="flex flex-col gap-6 bg-tertiary border border-white/5 p-8 rounded-[2.5rem]">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1 flex items-center gap-2">
                  <RiUserStarLine /> Nome do Profissional (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Dr. Reges Santos"
                  value={professionalName}
                  onChange={(e) => setProfessionalName(e.target.value)}
                  className="w-full bg-secondary border border-white/5 focus:border-primary/50 text-white px-5 py-4 rounded-2xl outline-none transition-all placeholder:text-white/10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1 flex items-center gap-2">
                  <RiHeartLine /> Nome do Responsável (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Maria Oliveira"
                  value={responsibleName}
                  onChange={(e) => setResponsibleName(e.target.value)}
                  className="w-full bg-secondary border border-white/5 focus:border-primary/50 text-white px-5 py-4 rounded-2xl outline-none transition-all placeholder:text-white/10"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm font-bold text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-5 bg-primary hover:bg-primary/90 text-secondary font-black rounded-2xl transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-2 group"
            >
              Gerar Ambiente Demo
              <RiMagicLine size={20} className="group-hover:rotate-12 transition-transform" />
            </button>
          </form>
        )}

        <div className="text-center">
          <p className="text-[10px] text-white/10 font-bold uppercase tracking-widest leading-relaxed">
            O ambiente gerado expirará automaticamente <br /> após o período de testes.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading-bar {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 50%; margin-left: 25%; }
          100% { width: 100%; margin-left: 0%; }
        }
      `}</style>
    </main>
  );
}
