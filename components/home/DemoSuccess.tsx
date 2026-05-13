'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  RiFileCopyLine, 
  RiCheckLine, 
  RiArrowRightLine, 
  RiUserStarLine, 
  RiHeartLine,
  RiInformationLine
} from 'react-icons/ri';
import { DemoResponse } from '@/types/demo';
import { cn } from '@/lib/utils';

interface DemoSuccessProps {
  data: DemoResponse;
}

export default function DemoSuccess({ data }: DemoSuccessProps) {
  const router = useRouter();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCopyAll = () => {
    const origin = window.location.origin;
    const text = `
CREDENCIAIS DEMO - ACOMPANHAR

URL de Acesso: ${origin}

PROFISSIONAL:
E-mail: ${data.credentials.professional.email}
Senha: ${data.credentials.professional.password}

RESPONSÁVEL:
E-mail: ${data.credentials.responsible.email}
Senha: ${data.credentials.responsible.password}
    `.trim();
    
    navigator.clipboard.writeText(text);
    setCopiedField('copy-all');
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up space-y-8 pb-12">
      <div className="text-center space-y-2">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-primary mx-auto mb-4 shadow-[0_0_40px_rgba(100,205,199,0.2)]">
          <RiCheckLine size={48} />
        </div>
        <h2 className="text-3xl font-black tracking-tighter text-white">Ambiente Gerado!</h2>
        <p className="text-white/40 text-sm max-w-md mx-auto">
          Seu ambiente de demonstração está pronto em <span className="text-primary font-bold">{typeof window !== 'undefined' ? window.location.hostname : ''}</span>. Copie as credenciais abaixo para acessar o sistema.
        </p>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleCopyAll}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all border animate-bounce-slow",
            copiedField === 'copy-all' 
              ? "bg-primary text-secondary border-primary" 
              : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
          )}
        >
          {copiedField === 'copy-all' ? (
            <>
              <RiCheckLine size={16} />
              Copiado com Sucesso!
            </>
          ) : (
            <>
              <RiFileCopyLine size={16} />
              Copiar Todas as Credenciais
            </>
          )}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Professional Credentials */}
        <div className="bg-tertiary border border-white/5 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <RiUserStarLine size={80} />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <RiUserStarLine size={20} />
            </div>
            <h3 className="font-bold text-white tracking-tight">Profissional</h3>
          </div>

          <div className="space-y-4">
            <CredentialItem 
              label="E-mail" 
              value={data.credentials.professional.email} 
              onCopy={() => handleCopy(data.credentials.professional.email, 'p-email')}
              isCopied={copiedField === 'p-email'}
            />
            <CredentialItem 
              label="Senha" 
              value={data.credentials.professional.password || ''} 
              onCopy={() => handleCopy(data.credentials.professional.password || '', 'p-pass')}
              isCopied={copiedField === 'p-pass'}
              isPassword
            />
          </div>
        </div>

        {/* Responsible Credentials */}
        <div className="bg-tertiary border border-white/5 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <RiHeartLine size={80} />
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500">
              <RiHeartLine size={20} />
            </div>
            <h3 className="font-bold text-white tracking-tight">Responsável</h3>
          </div>

          <div className="space-y-4">
            <CredentialItem 
              label="E-mail" 
              value={data.credentials.responsible.email} 
              onCopy={() => handleCopy(data.credentials.responsible.email, 'r-email')}
              isCopied={copiedField === 'r-email'}
            />
            <CredentialItem 
              label="Senha" 
              value={data.credentials.responsible.password || ''} 
              onCopy={() => handleCopy(data.credentials.responsible.password || '', 'r-pass')}
              isCopied={copiedField === 'r-pass'}
              isPassword
            />
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-tertiary/50 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
            <RiInformationLine size={20} />
          </div>
          <h3 className="font-bold text-white tracking-tight">O que foi gerado?</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.summary.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-4 bg-secondary/50 rounded-2xl border border-white/5">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 truncate">{item.scale}</span>
                <span className="text-sm font-medium text-white/80 truncate">{item.child}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          onClick={() => router.push('/')}
          className="flex-1 py-5 bg-primary text-secondary font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-2"
        >
          Ir para Login
          <RiArrowRightLine size={20} />
        </button>
        <button
          onClick={() => window.location.reload()}
          className="flex-1 py-5 bg-white/5 text-white/60 font-bold rounded-2xl hover:bg-white/10 transition-all"
        >
          Gerar outro ambiente
        </button>
      </div>

      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

function CredentialItem({ label, value, onCopy, isCopied }: any) {
  return (
    <div className="space-y-1.5 overflow-hidden">
      <span className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">{label}</span>
      <button
        onClick={onCopy}
        className="w-full flex items-center justify-between p-4 bg-secondary rounded-2xl border border-white/5 hover:border-white/10 transition-all group overflow-hidden"
      >
        <span className={cn(
          "text-xs font-mono tracking-tight transition-colors truncate pr-2",
          isCopied ? "text-primary" : "text-white/80"
        )}>
          {value}
        </span>
        <div className={cn(
          "shrink-0 transition-all",
          isCopied ? "text-primary scale-110" : "text-white/20 group-hover:text-white/40"
        )}>
          {isCopied ? <RiCheckLine size={18} /> : <RiFileCopyLine size={18} />}
        </div>
      </button>
    </div>
  );
}
