'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  RiArrowLeftLine,
  RiFileCopyLine,
  RiCalendarLine,
  RiUser3Line,
  RiBarChartFill,
  RiInformationLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiStickyNoteLine,
  RiQuestionAnswerLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiRocketLine
} from 'react-icons/ri';
import { evaluationService } from '@/lib/api/evaluations';
import { EvaluationResponse } from '@/types/evaluation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/stores/store';

export default function EvaluationView() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const data = await evaluationService.getEvaluationById(Number(id));
        setEvaluation(data);
      } catch (err: any) {
        console.error('Error fetching evaluation:', err);
        setError(err.response?.data?.error || 'Não foi possível carregar os detalhes da avaliação.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEvaluation();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-6 space-y-4">
        <RiLoader4Line className="text-primary animate-spin" size={40} />
        <p className="text-white/40 font-medium animate-pulse">Carregando detalhes da avaliação...</p>
      </div>
    );
  }

  if (error || !evaluation) {
    return (
      <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
          <RiErrorWarningLine size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">Oops!</h2>
          <p className="text-white/40 max-w-xs mx-auto">{error || 'Avaliação não encontrada.'}</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all"
        >
          Voltar
        </button>
      </div>
    );
  }

  const scores = evaluation.metadata?.scores || {};
  const totalScore = evaluation.metadata?.total_score || 0;

  return (
    <div className="min-h-screen bg-secondary text-white flex flex-col pb-12">
      {/* Header */}
      <header className="h-20 flex items-center px-6 sticky top-0 bg-secondary/80 backdrop-blur-xl z-50 border-b border-white/5">
        <div className="max-w-3xl w-full mx-auto flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all active:scale-95"
          >
            <RiArrowLeftLine size={24} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black tracking-tighter uppercase truncate">Detalhes da Avaliação</h1>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest truncate">
              {evaluation.scales?.name}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl w-full mx-auto px-6 py-8 space-y-8 animate-fade-in-up">
        {/* Main Info Card */}
        <section className="bg-tertiary border border-white/5 rounded-[3rem] p-8 space-y-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-primary/5 -rotate-12 translate-x-4 -translate-y-4">
            <RiFileCopyLine size={120} />
          </div>

          <div className="relative space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-lg uppercase tracking-widest border border-primary/5">
                {evaluation.scales?.name}
              </span>
              <span className="flex items-center gap-1.5 text-white/20 text-[10px] font-bold uppercase tracking-widest">
                <RiCalendarLine size={14} />
                {new Date(evaluation.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>

            <h2 className="text-3xl font-black text-white tracking-tighter leading-none">
              {evaluation.title}
            </h2>

            <div className="flex items-center gap-3 pt-2">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                <RiUser3Line size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Avaliador</p>
                <p className="text-sm font-bold text-white/60">{evaluation.professionals?.full_name}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Results Summary */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-tertiary/50 border border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-2">
              <RiBarChartFill size={28} />
            </div>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Pontuação Total</p>
            <h3 className="text-5xl font-black text-white tracking-tighter">{totalScore}</h3>
          </div>

          <div className="bg-tertiary/50 border border-white/5 rounded-[2.5rem] p-8 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <RiInformationLine size={18} />
              <h4 className="text-[10px] font-black uppercase tracking-widest">Resumo de Áreas</h4>
            </div>
            <div className="space-y-3">
              {Object.entries(scores).map(([area, score]) => (
                <div key={area} className="space-y-2 group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/40 group-hover:text-white/60 transition-colors tracking-wide">
                      {area}
                    </span>
                    <span className="text-sm font-black text-primary">
                      {score as number}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/40 group-hover:bg-primary transition-all duration-1000 shadow-[0_0_8px_rgba(var(--primary-rgb),0.2)]"
                      style={{ width: `${Math.min(Number(score) * 2, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Studio CTA Section */}
        {user?.role !== 'responsible' && (
          <section className="animate-fade-in-up delay-100">
            <button
              onClick={() => {
                router.push(`/studio/analysis/${evaluation.id}?clientId=${evaluation.client_fk}&scaleId=${evaluation.scale_fk}`);
              }}
              className="w-full p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 group hover:border-primary/40 transition-all hover:shadow-[0_20px_40px_-15px_rgba(var(--primary-rgb),0.1)] active:scale-[0.98]"
            >
              <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-12 transition-all">
                <RiRocketLine size={40} />
              </div>
              <div className="flex-1 text-center md:text-left space-y-1">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Ferramentas Avançadas</p>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Explorar no Studio</h3>
                <p className="text-white/40 text-sm max-w-sm mx-auto md:mx-0">
                  Crie e acesse insights baseados em inteligência coletiva e análise comparativa.
                </p>
              </div>
              <div className="hidden md:flex w-12 h-12 bg-white/5 rounded-2xl items-center justify-center text-white/20 group-hover:bg-primary group-hover:text-secondary-dark transition-all">
                <RiRocketLine size={20} />
              </div>
            </button>
          </section>
        )}

        {/* Detailed Answers Section (Mirror View) flights */}
        {evaluation.answers && evaluation.answers.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <RiQuestionAnswerLine className="text-primary" size={20} />
              <h3 className="text-sm font-black uppercase tracking-widest text-white/60">Espelho da Avaliação</h3>
            </div>

            <div className="space-y-4">
              {/* Grouping by domain could be done here, but let's list them clearly first */}
              {evaluation.answers.map((answer, index) => (
                <div
                  key={answer.id}
                  className="bg-tertiary/40 border border-white/5 rounded-[2rem] p-6 space-y-4 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-md">
                          {answer.questions.domain}
                        </span>
                        <span className="text-[10px] font-bold text-white/20 uppercase">
                          Questão {index + 1}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white/80 leading-snug">
                        {answer.questions.content}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm font-bold text-white">{answer.itens.content}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-white/20 uppercase">Peso</span>
                      <span className="text-sm font-black text-primary">{Number(answer.itens.score)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Notes Section */}
        {(evaluation.notes || evaluation.metadata?.observations) && (
          <section className="bg-tertiary/30 border border-white/5 rounded-[2.5rem] p-8 space-y-4">
            <div className="flex items-center gap-2 text-white/40">
              <RiStickyNoteLine size={18} />
              <h4 className="text-[10px] font-black uppercase tracking-widest">Observações Clínicas</h4>
            </div>
            <p className="text-white/60 text-sm leading-relaxed italic">
              "{evaluation.metadata?.observations || evaluation.notes}"
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
