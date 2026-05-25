'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  RiRocketLine,
  RiArrowLeftLine,
  RiLoader4Line,
  RiCheckLine,
  RiErrorWarningLine,
  RiListSettingsLine,
  RiInformationLine,
  RiBarChartLine,
  RiBrainLine,
  RiArrowRightSLine,
  RiShieldCheckLine,
  RiPulseLine,
  RiTimeLine
} from 'react-icons/ri';
import { useAuthStore } from '@/lib/stores/store';
import { Suspense } from 'react';
import { cn } from '@/lib/utils';
import { evaluationService } from '@/lib/api/evaluations';
import { scaleService } from '@/lib/api/scales';

interface Recommendation {
  questionid: number;
  intensity_score: number;
  content?: string;
  domain?: string;
  color?: string;
}

interface LogEntry {
  timestamp: string;
  step?: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'lgpd' | 'process';
  details?: any;
}

interface AnalysisState {
  status: 'idle' | 'connected' | 'processing' | 'completed' | 'error';
  step: 'fetching_answers' | 'similarity' | 'ranking' | 'done';
  message: string;
  recommendations: Recommendation[];
  logs: LogEntry[];
  error?: string;
}

const similarityOptions = [3, 5, 10];
const recOptions = [3, 5, 10];
const windowOptions = [7, 30, 60];

function StudioAnalysisContent() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token: storeToken, user } = useAuthStore();

  useEffect(() => {
    if (user && user.role === 'responsible') {
      router.replace('/403');
    }
  }, [user, router]);

  if (!user || user.role === 'responsible') {
    return null;
  }

  // Fallback robusto para o localStorage (evita problemas de hidratação do Zustand)
  const token = storeToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

  // Parâmetros obrigatórios como estado para permitirem recuperação assíncrona da API
  const [clientId, setClientId] = useState<string | null>(searchParams.get('clientId'));
  const [scaleId, setScaleId] = useState<string | null>(searchParams.get('scaleId'));

  // Efeito para recuperar clientId e scaleId automaticamente se não estiverem na URL
  useEffect(() => {
    if (clientId && scaleId) return;
    if (!id) return;

    const fetchParamsFromEvaluation = async () => {
      try {
        console.log(`[STUDIO DEBUG] Buscando dados da avaliação #${id} para restaurar clientId e scaleId...`);
        const evaluation = await evaluationService.getEvaluationById(Number(id));
        console.log('[STUDIO DEBUG] Avaliação carregada:', evaluation);

        if (evaluation.client_fk && !clientId) {
          setClientId(evaluation.client_fk);
        }
        if (evaluation.scale_fk && !scaleId) {
          setScaleId(String(evaluation.scale_fk));
        }
      } catch (err) {
        console.error('❌ [STUDIO DEBUG] Erro ao recuperar avaliação via API:', err);
      }
    };

    fetchParamsFromEvaluation();
  }, [id, clientId, scaleId]);

  const [state, setState] = useState<AnalysisState>({
    status: 'idle',
    step: 'fetching_answers',
    message: 'Iniciando conexão...',
    recommendations: [],
    logs: []
  });

  const [params, setParams] = useState({
    ntop_similarity: 5,
    ntop_recommendations: 5,
    days_window: 30
  });

  const wsRef = useRef<WebSocket | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);



  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.logs]);

  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});
  const [questionDetails, setQuestionDetails] = useState<Record<number, any>>({});
  const [loadingQuestionId, setLoadingQuestionId] = useState<number | null>(null);

  const toggleExpandQuestion = async (questionId: number) => {
    if (expandedQuestions[questionId]) {
      setExpandedQuestions(prev => ({ ...prev, [questionId]: false }));
      return;
    }

    if (!questionDetails[questionId]) {
      setLoadingQuestionId(questionId);
      try {
        const details = await scaleService.getQuestionById(questionId);
        setQuestionDetails(prev => ({ ...prev, [questionId]: details }));
      } catch (err) {
        console.error(`Erro ao carregar detalhes da questão #${questionId}:`, err);
      } finally {
        setLoadingQuestionId(null);
      }
    }

    setExpandedQuestions(prev => ({ ...prev, [questionId]: true }));
  };

  const startAnalysis = async () => {
    console.log('=== [STUDIO DEBUG] Iniciando Análise ===');
    console.log('Valores das variáveis obrigatórias:');
    console.log('- token:', token ? `${token.substring(0, 15)}... (presente)` : 'AUSENTE ❌');
    console.log('- id (evaluation_fk):', id ? `${id} (presente)` : 'AUSENTE ❌');
    console.log('- clientId:', clientId ? `${clientId} (presente)` : 'AUSENTE ❌');
    console.log('- scaleId:', scaleId ? `${scaleId} (presente)` : 'AUSENTE ❌');

    const missingParams: string[] = [];
    if (!token) missingParams.push('Token de autenticação');
    if (!id) missingParams.push('ID da avaliação (id)');
    if (!clientId) missingParams.push('ID do cliente (clientId)');
    if (!scaleId) missingParams.push('ID da escala (scaleId)');

    if (missingParams.length > 0) {
      const errorMessage = `Parâmetros obrigatórios ausentes: ${missingParams.join(', ')}. Verifique as credenciais e os parâmetros da URL.`;
      console.error('❌ Cancelando análise: Faltam parâmetros obrigatórios:', missingParams);
      setState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage,
        message: 'Erro de Parâmetros'
      }));
      return;
    }

    const addLog = (msg: string, type: LogEntry['type'], details?: any) => {
      const time = new Date().toLocaleTimeString('pt-BR', { hour12: false });
      setState(prev => ({
        ...prev,
        logs: [...prev.logs, { timestamp: time, message: msg, type, details }]
      }));
    };

    try {
      // 1. Inicia o fluxo visual de carregamento e limpa logs anteriores
      setState(prev => ({
        ...prev,
        status: 'processing',
        step: 'fetching_answers',
        message: 'Buscando informações da escala...',
        logs: []
      }));

      addLog('Iniciando análise clínica...', 'info');
      addLog('Buscando estrutura e perguntas da escala no banco principal...', 'info');

      // Busca as perguntas da escala no banco principal para termos textos/domínios reais das sugestões
      let questionsList: any[] = [];
      try {
        const questionsData = await scaleService.getScaleById(Number(scaleId));
        questionsList = questionsData?.questions || [];
        addLog(`Estrutura da escala carregada com sucesso. Total de perguntas: ${questionsList.length}`, 'success');
      } catch (scaleErr) {
        console.warn('⚠️ Não foi possível carregar os detalhes das perguntas da escala para enriquecimento:', scaleErr);
        addLog('Aviso: Não foi possível carregar o dicionário de perguntas da escala. As sugestões usarão placeholders textuais.', 'warning');
      }

      addLog('Conectando ao canal WebSocket do RecSys...', 'info');
      setState(prev => ({
        ...prev,
        message: 'Conectando ao canal WebSocket do RecSys...'
      }));

      const studioBaseUrl = process.env.NEXT_PUBLIC_STUDIO_URL || 'https://acompanhar-recsys-production.up.railway.app/';

      // Remove barras extras e ajusta para wss:// ou ws://
      const wsBase = studioBaseUrl.replace(/\/+$/, '').replace(/^http/, 'ws');
      const wsUrl = `${wsBase}/ws/recommend?token=${encodeURIComponent(token || '')}`;

      console.log('Iniciando conexão WebSocket ao RecSys...');
      console.log('- WS URL:', wsUrl);

      // Função auxiliar para delay de animação suave
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      await new Promise<void>((resolve, reject) => {
        const ws = new WebSocket(wsUrl);

        // Define um timeout de 35 segundos para evitar travamento em caso de conexões pendentes
        const connectionTimeout = setTimeout(() => {
          ws.close();
          addLog('Tempo limite de conexão com o servidor de busca excedido (Timeout).', 'error');
          reject(new Error('Tempo limite de conexão com o servidor de busca excedido (Timeout).'));
        }, 35000);

        ws.onopen = () => {
          console.log('🔌 Conectado ao canal WebSocket do RecSys!');
          addLog('🔌 Conexão WebSocket estabelecida com sucesso!', 'success');
          addLog('Enviando parâmetros de busca e análise ao RecSys...', 'info');

          ws.send(JSON.stringify({
            client: clientId,
            evaluationid: Number(id),
            scale: Number(scaleId),
            ntop_similarity: params.ntop_similarity,
            ntop_recommendations: params.ntop_recommendations,
            days_window: params.days_window
          }));
        };

        ws.onmessage = (event) => {
          try {
            const response = JSON.parse(event.data);
            console.log('📥 Mensagem recebida do WebSocket:', response);

            if (response.status === 'error') {
              clearTimeout(connectionTimeout);
              ws.close();
              addLog(`Erro reportado pelo motor de busca: ${response.message}`, 'error');
              reject(new Error(response.message || 'Erro retornado pelo motor de busca.'));
              return;
            }

            if (response.status === 'connected') {
              addLog(response.message || 'Conectado ao canal de recomendação.', 'success');
              setState(prev => ({
                ...prev,
                step: 'fetching_answers',
                message: 'Parâmetros enviados!'
              }));
            } else if (response.status === 'processing') {
              if (response.step === 'starting') {
                addLog(response.message || 'Iniciando análise de dados.', 'process');
                setState(prev => ({
                  ...prev,
                  step: 'fetching_answers',
                  message: 'Coletando respostas...'
                }));
              } else if (response.step === 'similarity_search') {
                addLog(response.message || 'Processando busca de similaridade (LGPD-Safe).', 'lgpd', response.details);
                setState(prev => ({
                  ...prev,
                  step: 'similarity',
                  message: 'Buscando pacientes similares...'
                }));
              } else if (response.step === 'window_filtering') {
                addLog(response.message || 'Filtrando janela temporal...', 'process');
                setState(prev => ({
                  ...prev,
                  step: 'similarity',
                  message: 'Filtrando histórico temporal...'
                }));
              } else if (response.step === 'intensity_calculation') {
                addLog(response.message || 'Calculando delta e coeficientes de melhoria...', 'process', response.details);
                setState(prev => ({
                  ...prev,
                  step: 'ranking',
                  message: 'Calculando coeficientes de intensidade...'
                }));
              } else if (response.step === 'intensity_completed') {
                addLog(response.message || 'Cálculo de coeficientes finalizado.', 'success', response.details);
              } else if (response.step === 'ranking_generation') {
                addLog(response.message || 'Consolidando ranking global...', 'process', response.details);
                setState(prev => ({
                  ...prev,
                  step: 'ranking',
                  message: 'Agrupando ranking final...'
                }));
              }
            } else if (response.status === 'completed') {
              clearTimeout(connectionTimeout);
              ws.close();

              addLog('Processamento finalizado com sucesso pelo motor de busca.', 'success');

              const rawRecs = response.data?.recommendations || [];
              if (rawRecs.length === 0) {
                addLog('Aviso: Nenhuma recomendação gerada para o perfil deste paciente.', 'warning');
                reject(new Error('Nenhuma recomendação de intervenção gerada para o perfil deste paciente.'));
                return;
              }

              // Mapeia e enriquece os question IDs com o conteúdo do banco de dados principal
              const mappedRecommendations: Recommendation[] = rawRecs.map((rec: any, idx: number) => {
                const fullQuestion = questionsList.find((q: any) => q.id === rec.questionid);
                return {
                  questionid: rec.questionid,
                  intensity_score: typeof rec.intensity_score === 'number' ? rec.intensity_score : 0,
                  content: fullQuestion?.content || `Questão #${rec.questionid}`,
                  domain: fullQuestion?.domain || '',
                  color: fullQuestion?.color || '#FFFFFF'
                };
              });

              addLog(`Enriquecimento concluído! Mapeadas ${mappedRecommendations.length} sugestões de prioridade clínica.`, 'success');

              setState(prev => ({
                ...prev,
                status: 'completed',
                step: 'done',
                message: 'Análise concluída com sucesso!',
                recommendations: mappedRecommendations
              }));

              // Busca em background qualquer questão que tenha ficado com fallback (como Questão #151)
              const missingRecs = mappedRecommendations.filter(rec => !rec.content || rec.content.startsWith('Questão #'));
              if (missingRecs.length > 0) {
                console.log(`[STUDIO DEBUG] Buscando em background ${missingRecs.length} questões com dados incompletos...`);
                Promise.all(missingRecs.map(async (rec) => {
                  try {
                    const fullQuestion = await scaleService.getQuestionById(rec.questionid);
                    if (fullQuestion && fullQuestion.content) {
                      setQuestionDetails(prev => ({ ...prev, [rec.questionid]: fullQuestion }));
                      setState(prev => {
                        const updatedRecs = prev.recommendations.map(r => {
                          if (r.questionid === rec.questionid) {
                            return {
                              ...r,
                              content: fullQuestion.content,
                              domain: fullQuestion.domain || r.domain,
                              color: fullQuestion.color || r.color
                            };
                          }
                          return r;
                        });
                        return { ...prev, recommendations: updatedRecs };
                      });
                    }
                  } catch (fetchErr) {
                    console.error(`Erro ao carregar detalhes assíncronos da questão #${rec.questionid}:`, fetchErr);
                  }
                }));
              }

              resolve();
            }
          } catch (jsonErr) {
            console.error('Erro ao ler payload do WS:', jsonErr);
          }
        };

        ws.onerror = (wsErr) => {
          console.error('❌ Erro na conexão WebSocket:', wsErr);
          addLog('O Firefox não conseguiu estabelecer uma conexão WebSocket segura com o servidor RecSys.', 'error');
          clearTimeout(connectionTimeout);
          reject(new Error('O Firefox não conseguiu estabelecer uma conexão WebSocket segura com o servidor RecSys. Verifique se o servidor de busca está online.'));
        };

        ws.onclose = () => {
          console.log('🔌 Conexão WebSocket encerrada pelo servidor.');
          addLog('Conexão com o servidor de busca encerrada.', 'info');
        };
      });

    } catch (err: any) {
      console.error('❌ Erro no processamento da análise do Studio:', err);
      addLog(`Falha geral no processamento: ${err.message || err}`, 'error');
      setState(prev => ({
        ...prev,
        status: 'error',
        error: err.message || 'Ocorreu um erro inesperado ao conectar com o motor de busca.',
        message: 'Erro no processamento'
      }));
    }
  };

  return (
    <div 
      className="min-h-screen text-white flex flex-col pb-12 studio-page-bg"
    >
      {/* Header */}
      <header 
        className="h-20 flex items-center px-6 border-b border-white/5 sticky top-0 z-50 studio-header-bg"
      >
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
              <h1 className="text-xl font-black tracking-tighter uppercase leading-none">Studio</h1>
              <p className="text-[10px] font-bold text-card-code uppercase tracking-widest mt-1">Motor de Busca</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl w-full mx-auto px-6 py-8 space-y-8 animate-fade-in-up">
        {/* Status Card */}
        <section className="bg-tertiary border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-primary/5 -rotate-12 translate-x-4 -translate-y-4">
            <RiBrainLine size={120} />
          </div>

          <div className="relative space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Status da Análise</p>
                <h2 className="text-2xl font-black uppercase tracking-tighter">{state.message}</h2>
              </div>
              {state.status === 'processing' && (
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary animate-spin">
                  <RiLoader4Line size={28} />
                </div>
              )}
              {state.status === 'completed' && (
                <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-500">
                  <RiCheckLine size={28} />
                </div>
              )}
              {state.status === 'error' && (
                <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500">
                  <RiErrorWarningLine size={28} />
                </div>
              )}
            </div>

            {/* Stepper logic */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { id: 'fetching_answers', label: 'Coleta', icon: <RiListSettingsLine size={18} /> },
                { id: 'similarity', label: 'Similaridade', icon: <RiBarChartLine size={18} /> },
                { id: 'ranking', label: 'Ranking', icon: <RiBrainLine size={18} /> }
              ].map((step, idx) => {
                const isPast = state.status === 'completed' ||
                  (state.step === 'similarity' && step.id === 'fetching_answers') ||
                  (state.step === 'ranking' && (step.id === 'fetching_answers' || step.id === 'similarity'));
                const isCurrent = state.step === step.id && state.status === 'processing';

                return (
                  <div key={step.id} className="space-y-3">
                    <div className={cn(
                      "h-1.5 rounded-full transition-all duration-500",
                      isPast ? "bg-primary" : isCurrent ? "bg-primary/40 animate-pulse" : "bg-white/5"
                    )} />
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                        isPast ? "bg-primary text-secondary-dark" : isCurrent ? "bg-primary/20 text-primary" : "bg-white/5 text-white/20"
                      )}>
                        {isPast ? <RiCheckLine size={16} /> : step.icon}
                      </div>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        isPast || isCurrent ? "text-white" : "text-white/20"
                      )}>{step.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {state.status !== 'idle' && (
          <section className="bg-tertiary border border-white/5 rounded-[2.5rem] p-8 shadow-2xl space-y-6 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Rastreabilidade Clínica</p>
                <h3 className="text-xl font-black uppercase tracking-tighter">Histórico de Diagnóstico RecSys</h3>
                <p className="text-xs text-card-code">Detalhamento técnico da busca de similaridade e cálculos de intensidade efetuados</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
                <span className="text-[9px] font-black text-primary uppercase tracking-widest leading-none">Live Feed</span>
              </div>
            </div>

            <div className="max-h-[350px] overflow-y-auto pr-2 space-y-6 relative scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {state.logs.map((log, idx) => {
                const isLast = idx === state.logs.length - 1;

                return (
                  <div key={idx} className="relative flex items-start gap-4 group/item">
                    {/* Vertical connector line */}
                    {!isLast && (
                      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-white/5 group-hover/item:bg-white/15 transition-colors" style={{ bottom: '-24px' }} />
                    )}

                    {/* Styled timeline bullet based on type */}
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 z-10",
                      log.type === 'success' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                        log.type === 'error' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          log.type === 'warning' ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                            log.type === 'lgpd' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                              log.type === 'process' ? "bg-primary/10 text-primary border-primary/20" :
                                "bg-white/5 text-white/40 border-white/10"
                    )}>
                      {log.type === 'success' && <RiCheckLine size={16} />}
                      {log.type === 'error' && <RiErrorWarningLine size={16} />}
                      {log.type === 'warning' && <RiInformationLine size={16} />}
                      {log.type === 'lgpd' && <RiShieldCheckLine size={16} />}
                      {log.type === 'process' && <RiPulseLine className="animate-pulse" size={16} />}
                      {log.type === 'info' && <RiTimeLine size={16} />}
                    </div>

                    {/* Log Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-bold text-white/90 leading-tight">
                          {log.message}
                        </span>
                        <span className="text-[10px] font-black text-white/20 select-none bg-white/5 px-2 py-0.5 rounded-md">
                          {log.timestamp}
                        </span>
                      </div>

                      {/* Render statistics in a clean grid card if details are present */}
                      {log.details && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-white/5 border border-white/5 rounded-[1.25rem] p-4 animate-fade-in-up">
                          {Object.entries(log.details).map(([key, val]: [string, any]) => {
                            let formattedKey = key;
                            if (key === 'similar_evaluations_count') formattedKey = 'Avaliações similares';
                            else if (key === 'clients_count') formattedKey = 'Pacientes correspondentes';
                            else if (key === 'average_similarity') formattedKey = 'Similaridade média';
                            else if (key === 'patients_count') formattedKey = 'Pacientes processados';
                            else if (key === 'calculated_patients_count') formattedKey = 'Pacientes calculados';
                            else if (key === 'contributing_patients_count') formattedKey = 'Pacientes contribuintes';

                            let formattedVal = val;
                            if (typeof val === 'number' && key === 'average_similarity') {
                              formattedVal = `${(val * 100).toFixed(1)}%`;
                            }

                            return (
                              <div key={key} className="bg-tertiary/40 border border-white/5 rounded-xl p-3 flex flex-col justify-center">
                                <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider mb-1 leading-none">{formattedKey}</span>
                                <span className="text-sm font-black text-white">{formattedVal}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={logEndRef} className="h-2" />
            </div>
          </section>
        )}

        {state.status === 'idle' && (
          <section className="bg-tertiary/30 border border-white/5 rounded-[2.5rem] p-8 space-y-6 animate-fade-in-up">
            <div className="flex items-center gap-3 text-primary">
              <RiListSettingsLine size={24} />
              <h3 className="text-lg font-black uppercase tracking-tighter">Parâmetros da Análise</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Similarity Slider */}
              <div className="space-y-4 bg-white/5 border border-white/5 p-6 rounded-[2rem] hover:border-primary/10 transition-all">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-card-identifier uppercase tracking-widest">Similaridade</label>
                  <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-xl">
                    {params.ntop_similarity} {params.ntop_similarity === 1 ? 'Paciente' : 'Pacientes'}
                  </span>
                </div>
                <div className="relative pt-2">
                  <input
                    type="range"
                    min={0}
                    max={2}
                    step={1}
                    value={similarityOptions.indexOf(params.ntop_similarity)}
                    onChange={(e) => {
                      const val = similarityOptions[Number(e.target.value)];
                      setParams(p => ({ ...p, ntop_similarity: val }));
                    }}
                    className="w-full accent-primary h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer focus:outline-none"
                  />
                  <div className="flex justify-between text-[9px] text-card-code font-black mt-2 px-1">
                    <span>3 Pacientes</span>
                    <span>5 Pacientes</span>
                    <span>10 Pacientes</span>
                  </div>
                </div>
              </div>

              {/* Recommendations Slider */}
              <div className="space-y-4 bg-white/5 border border-white/5 p-6 rounded-[2rem] hover:border-primary/10 transition-all">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-card-identifier uppercase tracking-widest">Recomendações</label>
                  <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-xl">
                    {params.ntop_recommendations} {params.ntop_recommendations === 1 ? 'Item' : 'Itens'}
                  </span>
                </div>
                <div className="relative pt-2">
                  <input
                    type="range"
                    min={0}
                    max={2}
                    step={1}
                    value={recOptions.indexOf(params.ntop_recommendations)}
                    onChange={(e) => {
                      const val = recOptions[Number(e.target.value)];
                      setParams(p => ({ ...p, ntop_recommendations: val }));
                    }}
                    className="w-full accent-primary h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer focus:outline-none"
                  />
                  <div className="flex justify-between text-[9px] text-card-code font-black mt-2 px-1">
                    <span>3 Itens</span>
                    <span>5 Itens</span>
                    <span>10 Itens</span>
                  </div>
                </div>
              </div>

              {/* Time Window Slider */}
              <div className="space-y-4 bg-white/5 border border-white/5 p-6 rounded-[2rem] hover:border-primary/10 transition-all">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-card-identifier uppercase tracking-widest">Janela Temporal</label>
                  <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-xl">
                    {params.days_window} {params.days_window === 1 ? 'Dia' : 'Dias'}
                  </span>
                </div>
                <div className="relative pt-2">
                  <input
                    type="range"
                    min={0}
                    max={2}
                    step={1}
                    value={windowOptions.indexOf(params.days_window)}
                    onChange={(e) => {
                      const val = windowOptions[Number(e.target.value)];
                      setParams(p => ({ ...p, days_window: val }));
                    }}
                    className="w-full accent-primary h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer focus:outline-none"
                  />
                  <div className="flex justify-between text-[9px] text-card-code font-black mt-2 px-1">
                    <span>7 Dias</span>
                    <span>30 Dias</span>
                    <span>60 Dias</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={startAnalysis}
              className="w-full py-5 bg-primary text-secondary-dark font-black rounded-[2rem] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/10"
            >
              <RiRocketLine size={24} />
              INICIAR ANÁLISE
            </button>
          </section>
        )}

        {state.status === 'completed' && (
          <section className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3 text-primary">
                <RiBrainLine size={24} />
                <h3 className="text-lg font-black uppercase tracking-tighter">Sugestões de Foco Clínico</h3>
              </div>
              <span className="px-3 py-1 bg-white/5 text-card-identifier text-[10px] font-black rounded-full uppercase tracking-widest border border-white/5">
                Top {state.recommendations.length} Prioridades
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {state.recommendations.map((rec, idx) => {
                const cardColor = rec.color || '#3b82f6';
                return (
                  <div key={idx}
                    onClick={() => toggleExpandQuestion(rec.questionid)}
                    className="group bg-tertiary border border-white/5 hover:border-primary/20 rounded-[2rem] p-6 transition-all duration-300 flex flex-col relative overflow-hidden cursor-pointer active:scale-[0.99] select-none hover:shadow-lg hover:shadow-primary/5"
                    style={{ borderLeftColor: cardColor }}
                  >
                    <div 
                      className="absolute top-0 left-0 w-1.5 h-full opacity-40 group-hover:opacity-100 transition-opacity" 
                      style={{ backgroundColor: cardColor }}
                    />

                    {/* Main Row */}
                    <div className="flex items-center gap-6">
                      {/* Ranking badge/item with universal border stroke and dark text outline */}
                      <div 
                        className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 border border-slate-200 dark:border-white/10"
                        style={{ color: cardColor }}
                      >
                        <span 
                          className="text-xl font-black"
                          style={{
                            WebkitTextStroke: '1px #475569'
                          }}
                        >
                          #{idx + 1}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-card-code uppercase tracking-widest mb-1">
                          {rec.domain ? `${rec.domain} • ` : ''}Questão ID: {rec.questionid}
                        </p>
                        <h4 className="text-base font-bold text-white group-hover:text-primary transition-colors leading-tight">
                          {rec.content || `Questão #${rec.questionid}`}
                        </h4>
                      </div>

                      <div className="flex items-center shrink-0">
                        {/* Expand Arrow Indicator */}
                        <div 
                          className={cn(
                            "w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-card-identifier transition-all duration-300 group-hover:text-white group-hover:bg-white/10",
                            expandedQuestions[rec.questionid] && "rotate-90 border-primary/20"
                          )}
                          style={expandedQuestions[rec.questionid] ? { 
                            color: cardColor, 
                            backgroundColor: `${cardColor}15`, 
                            borderColor: `${cardColor}30` 
                          } : {}}
                        >
                          <RiArrowRightSLine size={20} />
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Clinical Answer Options */}
                    {expandedQuestions[rec.questionid] && (
                      <div
                        onClick={(e) => e.stopPropagation()} // Prevent closing when interacting inside details
                        className="mt-4 pt-4 border-t border-white/5 space-y-3 animate-fade-in select-text"
                      >
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.15em] flex items-center gap-1.5">
                          <RiListSettingsLine size={14} />
                          <span>Opções de Resposta e Pontuação no Formulário</span>
                        </p>

                        {loadingQuestionId === rec.questionid ? (
                          <div className="flex items-center gap-2 py-2 text-xs text-card-code animate-pulse">
                            <RiLoader4Line className="animate-spin" size={14} />
                            <span>Buscando alternativas na base clínica principal...</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-2">
                            {questionDetails[rec.questionid]?.itens?.map((item: any) => (
                              <div key={item.id} className="flex items-center justify-between gap-4 p-3.5 bg-secondary/40 border border-white/5 rounded-xl hover:border-white/10 hover:bg-secondary/65 transition-all">
                                <div className="flex items-start gap-2.5">
                                  <span className="w-5 h-5 rounded bg-white/5 flex items-center justify-center font-black text-card-identifier text-[10px] shrink-0 border border-white/5">
                                    {item.item_order}
                                  </span>
                                  <span className="text-xs font-semibold text-white leading-normal">{item.content}</span>
                                </div>
                                <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full font-black text-primary text-[10px] leading-none shrink-0 shadow-inner">
                                  Pontuação: {parseFloat(item.score).toFixed(1)}
                                </span>
                              </div>
                            ))}
                            {(!questionDetails[rec.questionid]?.itens || questionDetails[rec.questionid]?.itens.length === 0) && (
                              <p className="text-xs text-card-code italic py-2">Nenhuma alternativa cadastrada para esta questão.</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex flex-col md:flex-row gap-4">
              <button
                onClick={() => setState(prev => ({ ...prev, status: 'idle', step: 'fetching_answers', recommendations: [] }))}
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl transition-all border border-white/5"
              >
                NOVA ANÁLISE
              </button>
              <button
                onClick={() => router.back()}
                className="flex-1 py-4 bg-primary text-secondary-dark font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                VOLTAR AO PACIENTE
              </button>
            </div>
          </section>
        )}

        {state.status === 'error' && (
          <section className="bg-red-500/5 border border-red-500/10 rounded-[2.5rem] p-12 text-center space-y-6 animate-fade-in">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto">
              <RiErrorWarningLine size={48} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Ops! Algo deu errado</h3>
              <p className="text-card-code max-w-sm mx-auto">{state.error || 'Ocorreu um erro inesperado durante o processamento.'}</p>
            </div>
            <button
              onClick={() => setState(prev => ({ ...prev, status: 'idle', error: undefined }))}
              className="px-12 py-4 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl transition-all"
            >
              TENTAR NOVAMENTE
            </button>
          </section>
        )}

        {/* Info Box */}
        <section className="bg-blue-500/5 border border-blue-500/10 rounded-[2rem] p-6 flex gap-4 animate-fade-in-up delay-300">
          <div className="text-blue-500 shrink-0">
            <RiInformationLine size={24} />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest">Como funciona?</h4>
            <p className="text-[11px] text-card-code leading-relaxed">
              O Studio utiliza técnicas de similaridade (distância euclidiana) para encontrar perfis de pacientes semelhantes.
              As recomendações são baseadas em itens onde pacientes com evolução positiva apresentaram melhor desempenho, sugerindo focos prioritários para intervenção.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function StudioAnalysis() {
  return (
    <Suspense fallback={
      <div 
        className="min-h-screen flex flex-col items-center justify-center studio-page-bg"
      >
        <RiLoader4Line className="text-primary animate-spin" size={40} />
      </div>
    }>
      <StudioAnalysisContent />
    </Suspense>
  );
}
