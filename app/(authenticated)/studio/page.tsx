'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  RiRocketLine, 
  RiArrowLeftLine, 
  RiBarChartBoxLine, 
  RiDatabaseLine, 
  RiLineChartLine,
  RiMagicLine
} from 'react-icons/ri';
import { useAuthStore } from '@/lib/stores/store';

export default function StudioPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && user.role === 'responsible') {
      router.replace('/403');
    }
  }, [user, router]);

  if (!user || user.role === 'responsible') {
    return null;
  }

  const upcomingFeatures = [
    {
      icon: <RiBarChartBoxLine size={24} />,
      title: "Análise Comparativa",
      description: "Compare o progresso deste paciente com a média populacional de forma automatizada."
    },
    {
      icon: <RiLineChartLine size={24} />,
      title: "Predição de Evolução",
      description: "Algoritmos de IA que sugerem a trajetória provável baseada no histórico clínico."
    },
    {
      icon: <RiDatabaseLine size={24} />,
      title: "Exportação Avançada",
      description: "Gere relatórios complexos em PDF e planilhas estruturadas para estudos de caso."
    }
  ];

  return (
    <div className="min-h-screen bg-secondary text-white flex flex-col">
      {/* Header */}
      <header className="h-20 flex items-center px-6 border-b border-white/5 bg-secondary/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl w-full mx-auto flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all active:scale-95"
          >
            <RiArrowLeftLine size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
              <RiRocketLine size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase leading-none">Acompanha Studio</h1>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">Laboratório de Análise de Dados</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col items-center justify-center text-center space-y-12">
        {/* Hero Section */}
        <div className="space-y-6 animate-fade-in-up">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full animate-pulse" />
            <div className="relative w-32 h-32 bg-secondary border border-primary/30 rounded-[2.5rem] flex items-center justify-center text-primary shadow-2xl">
              <RiMagicLine size={64} className="animate-bounce-slow" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-tight">
              Em breve: <br />
              <span className="text-primary">O Futuro da Análise Clínica</span>
            </h2>
            <p className="text-white/40 max-w-lg mx-auto text-sm leading-relaxed">
              Estamos construindo ferramentas avançadas de inteligência de dados para transformar avaliações em insights acionáveis.
            </p>
          </div>
        </div>

        {/* Feature Teasers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-8 animate-fade-in-up delay-200">
          {upcomingFeatures.map((feature, idx) => (
            <div 
              key={idx}
              className="bg-tertiary/30 border border-white/5 rounded-[2rem] p-8 text-left space-y-4 hover:border-primary/20 transition-all group"
            >
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:bg-primary group-hover:text-secondary-dark transition-all">
                {feature.icon}
              </div>
              <div className="space-y-2">
                <h4 className="font-black uppercase tracking-tighter text-white group-hover:text-primary transition-colors">
                  {feature.title}
                </h4>
                <p className="text-xs text-white/30 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="pt-8">
          <button 
            onClick={() => router.back()}
            className="px-12 py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl transition-all border border-white/5"
          >
            VOLTAR PARA A AVALIAÇÃO
          </button>
        </div>
      </main>

      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-5px); }
          50% { transform: translateY(5px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
