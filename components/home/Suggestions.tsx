'use client';

import { RiLightbulbLine, RiSendPlane2Line, RiHistoryLine } from 'react-icons/ri';

export default function Suggestions() {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Sugestões</h2>
          <p className="text-white/50 text-sm">Ajude-nos a melhorar o sistema com suas ideias.</p>
        </div>
        <div className="w-14 h-14 rounded-full bg-yellow-400/10 flex items-center justify-center text-yellow-400 border border-yellow-400/20">
          <RiLightbulbLine size={28} />
        </div>
      </div>

      <div className="bg-tertiary border border-white/5 p-8 rounded-[2.5rem] space-y-6">
        <div className="space-y-4">
          <textarea 
            rows={6}
            className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none"
            placeholder="Qual é a sua sugestão ou feedback?"
          />
          
          <button 
            className="w-full py-5 bg-white/5 hover:bg-primary hover:text-secondary-dark text-white font-bold rounded-2xl transition-all border border-white/10 hover:border-primary flex items-center justify-center gap-2 group"
          >
            <RiSendPlane2Line size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            Enviar Sugestão
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-white/40 px-2">
          <RiHistoryLine size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Minhas últimas sugestões</span>
        </div>
        
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white/5 border border-white/5 p-5 rounded-3xl">
              <p className="text-white/70 text-sm italic">"Sugestão de exemplo numero {i} para melhoria da interface mobile..."</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-white/30 font-bold uppercase">07 de Maio, 2026</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase">Em Análise</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
