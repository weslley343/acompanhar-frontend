'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { scaleService } from '@/lib/api/scales';
import { clientService } from '@/lib/api/clients';
import { evaluationService } from '@/lib/api/evaluations';
import { Scale, Question, Item } from '@/types/scale';
import { Client } from '@/types/client';
import { 
  RiArrowLeftLine, 
  RiArrowRightLine,
  RiCheckLine,
  RiLoader4Line, 
  RiErrorWarningLine,
  RiFlagLine,
  RiFileList3Line,
  RiStickyNoteLine
} from 'react-icons/ri';
import { cn } from '@/lib/utils';
import SuccessModal from '@/components/ui/SuccessModal';

export default function ScaleFilling() {
  const { clientId, scaleId } = useParams();
  const router = useRouter();
  
  const [scale, setScale] = useState<Scale | null>(null);
  const [patient, setPatient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Interface State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({}); // question_fk -> item_fk
  const [notes, setNotes] = useState('');
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scaleData, patientData] = await Promise.all([
          scaleService.getScaleById(scaleId as string),
          clientService.getClientById(clientId as string)
        ]);
        setScale(scaleData);
        setPatient(patientData);
      } catch (err: any) {
        setError('Erro ao carregar escala. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    if (clientId && scaleId) fetchData();
  }, [clientId, scaleId]);

  const questions = scale?.questions || [];
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const isFirstQuestion = currentIndex === 0;

  const handleSelectOption = (questionId: number, itemId: number) => {
    if (submitting || showReview) return;
    
    setAnswers(prev => ({ ...prev, [questionId]: itemId }));
    
    // Se a próxima questão já estiver respondida, volta para a revisão
    const nextQuestion = questions[currentIndex + 1];
    const isNextAnswered = nextQuestion ? !!answers[nextQuestion.id] : false;

    setTimeout(() => {
      if (isLastQuestion || isNextAnswered) {
        setShowReview(true);
      } else {
        setCurrentIndex(prev => Math.min(prev + 1, totalQuestions - 1));
      }
    }, 300);
  };

  const handleFinish = async () => {
    if (!scale || !patient) return;
    
    if (answeredCount < totalQuestions) {
      setError(`Por favor, responda todas as questões (${answeredCount}/${totalQuestions}).`);
      setShowReview(true);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        title: `${scale.name} - Avaliação`,
        client_fk: patient.id,
        scale_fk: scale.id,
        answers: Object.entries(answers).map(([qid, iid]) => ({
          question_fk: Number(qid),
          item_fk: iid
        })),
        metadata: {
          observations: notes
        }
      };

      await evaluationService.createEvaluation(payload);
      setSuccess('Avaliação concluída e registrada com sucesso.');
    } catch (err: any) {
      setError('Erro ao salvar avaliação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-6 space-y-4">
        <RiLoader4Line className="text-primary animate-spin" size={40} />
        <p className="text-white/40 font-medium animate-pulse">Carregando questões...</p>
      </div>
    );
  }

  if (error && !scale) {
    return (
      <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
          <RiErrorWarningLine size={40} />
        </div>
        <h2 className="text-2xl font-black text-white">Oops!</h2>
        <p className="text-white/40 max-w-xs mx-auto">{error}</p>
        <button onClick={() => router.back()} className="px-8 py-3 bg-white/5 text-white font-bold rounded-2xl">Voltar</button>
      </div>
    );
  }

  if (!scale || !patient) return null;

  return (
    <div className="min-h-screen bg-secondary text-white flex flex-col">
      <SuccessModal 
        isOpen={!!success} 
        message={success || ''} 
        redirectUrl={`/patients/${clientId}`} 
        buttonText="Voltar ao Perfil"
      />

      {/* Header & Progress */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-secondary/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-xl mx-auto w-full px-6 h-20 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => router.back()} className="text-white/40 hover:text-white transition-colors">
              <RiArrowLeftLine size={24} />
            </button>
            <div className="text-center">
              <h1 className="text-xs font-black uppercase tracking-[0.2em] text-primary">{scale.name}</h1>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{patient.full_name}</p>
            </div>
            <div className="w-6" /> {/* Spacer to keep title centered */}
          </div>
          
          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
              style={{ 
                width: `${progress}%`,
                backgroundColor: currentQuestion?.color || 'var(--primary)' 
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col pt-28 pb-36 px-6 max-w-xl mx-auto w-full overflow-y-auto scrollbar-hide">
        {!showReview ? (
          <div key={currentIndex} className="flex-1 flex flex-col justify-center space-y-10 animate-fade-in-up">
            {/* Question Card */}
            <div className="space-y-8">
              <div className="flex items-center flex-wrap gap-3">
                <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-white/40">
                  Questão {currentIndex + 1} de {totalQuestions}
                </span>
                {currentQuestion?.domain && !currentQuestion.domain.toLowerCase().includes('pontuação') && (
                  <span 
                    className="text-[10px] font-black uppercase tracking-[0.2em]"
                    style={{ color: currentQuestion.color || 'var(--primary)' }}
                  >
                    {currentQuestion.domain}
                  </span>
                )}
              </div>
              
              <h2 className="text-3xl font-black tracking-tighter leading-tight">
                {currentQuestion?.content}
              </h2>
            </div>

            {/* Options List */}
            <div className="space-y-4">
              {currentQuestion.itens.map((item) => {
                const isSelected = answers[currentQuestion.id] === item.id;
                const activeColor = currentQuestion.color || 'var(--primary)';
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectOption(currentQuestion.id, item.id)}
                    className={cn(
                      "w-full p-6 rounded-[2rem] text-left transition-all duration-300 border flex items-center justify-between group",
                      isSelected 
                        ? "text-secondary-dark shadow-xl scale-[1.02]" 
                        : "bg-tertiary border-white/5 text-white/70 hover:bg-white/5 hover:border-white/10"
                    )}
                    style={{
                      backgroundColor: isSelected ? activeColor : undefined,
                      borderColor: isSelected ? activeColor : undefined,
                      boxShadow: isSelected ? `0 20px 40px -12px ${activeColor}40` : undefined
                    }}
                  >
                    <span className="text-lg font-bold leading-snug pr-4">{item.content}</span>
                    <div 
                      className={cn(
                        "shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                        isSelected ? "bg-secondary border-secondary" : "border-white/10 text-transparent"
                      )}
                      style={{ color: isSelected ? activeColor : undefined }}
                    >
                      <RiCheckLine size={20} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Review Mode */
          <div className="flex-1 flex flex-col space-y-8 animate-fade-in-up">
            <div className="space-y-2">
              <h2 className="text-4xl font-black tracking-tighter">Revisão</h2>
              <p className="text-white/40 text-sm">Verifique se todas as questões foram respondidas antes de finalizar.</p>
            </div>

            {/* Error & Pendency Alerts */}
            <div className="space-y-4">
              {error && (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex gap-4 items-start text-red-500 animate-shake">
                  <RiErrorWarningLine size={24} className="shrink-0" />
                  <div className="space-y-1">
                    <p className="font-bold text-sm">Erro</p>
                    <p className="text-xs opacity-70">{error}</p>
                  </div>
                </div>
              )}

              {answeredCount < totalQuestions && (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex gap-4 items-start text-red-500 animate-fade-in">
                  <RiErrorWarningLine size={24} className="shrink-0" />
                  <div className="space-y-1">
                    <p className="font-bold text-sm">Pendências encontradas</p>
                    <p className="text-xs opacity-70">Ainda faltam {totalQuestions - answeredCount} questões para serem respondidas.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-5 gap-3">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowReview(false);
                    }}
                    className={cn(
                      "aspect-square rounded-2xl flex items-center justify-center text-sm font-black transition-all border",
                      isAnswered 
                        ? "bg-primary/10 border-primary/30 text-primary" 
                        : "bg-red-500/10 border-red-500/20 text-red-500 animate-pulse",
                      isCurrent && "ring-2 ring-white/50"
                    )}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Observations Input */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2 text-white/40">
                <RiStickyNoteLine size={18} />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Observações Clínicas</h4>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Insira aqui observações qualitativas sobre o comportamento do paciente durante a avaliação..."
                className="w-full min-h-[150px] bg-tertiary border border-white/5 rounded-[2rem] p-6 text-sm text-white/70 placeholder:text-white/10 focus:border-primary/30 focus:bg-primary/5 transition-all outline-none resize-none"
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-secondary via-secondary to-transparent">
        <div className="max-w-xl mx-auto w-full flex gap-4">
          {!showReview ? (
            <>
              <button
                onClick={() => setCurrentIndex(prev => prev - 1)}
                disabled={isFirstQuestion}
                className={cn(
                  "p-6 rounded-[2rem] border border-white/5 transition-all flex items-center justify-center",
                  isFirstQuestion ? "opacity-10 pointer-events-none" : "bg-white/5 hover:bg-white/10 active:scale-90"
                )}
              >
                <RiArrowLeftLine size={24} />
              </button>

              {!isLastQuestion && (
                <button
                  onClick={() => setShowReview(true)}
                  className="flex-1 bg-white/5 border border-white/5 rounded-[2rem] hover:bg-white/10 active:scale-90 transition-all flex items-center justify-center gap-2 text-white/40 hover:text-white"
                  title="Ver todas as questões"
                >
                  <RiFileList3Line size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Revisar</span>
                </button>
              )}
              
              <button
                onClick={() => {
                  if (isLastQuestion) {
                    setShowReview(true);
                  } else {
                    setCurrentIndex(prev => prev + 1);
                  }
                }}
                className={cn(
                  "flex-1 p-6 bg-white/5 border border-white/5 rounded-[2rem] font-black transition-all flex items-center justify-center gap-2 hover:bg-white/10 active:scale-90",
                  isLastQuestion ? "text-lg" : "text-lg"
                )}
              >
                {isLastQuestion ? 'REVISAR' : 'PRÓXIMA'}
                {!isLastQuestion && <RiArrowRightLine size={24} />}
                {isLastQuestion && <RiFileList3Line size={24} />}
              </button>
            </>
          ) : (
            <button
              onClick={handleFinish}
              disabled={submitting}
              className={cn(
                "w-full py-6 rounded-[2.5rem] font-black text-xl transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95",
                submitting
                  ? "bg-white/5 text-white/10 cursor-not-allowed"
                  : "bg-primary text-secondary-dark shadow-primary/20 hover:shadow-primary/40"
              )}
            >
              {submitting ? (
                <>
                  <RiLoader4Line className="animate-spin" size={24} />
                  ENVIANDO...
                </>
              ) : (
                <>
                  FINALIZAR AVALIAÇÃO <RiFlagLine size={24} />
                </>
              )}
            </button>
          )}
        </div>
      </footer>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
