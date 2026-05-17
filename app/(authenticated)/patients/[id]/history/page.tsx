'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  RiArrowLeftLine, 
  RiHistoryLine, 
  RiSearchLine, 
  RiLoader4Line, 
  RiFileCopyLine,
  RiArrowRightSLine,
  RiCalendarLine,
  RiUser3Line,
  RiDeleteBinLine,
  RiErrorWarningLine,
  RiRocketLine
} from 'react-icons/ri';
import { evaluationService } from '@/lib/api/evaluations';
import { clientService } from '@/lib/api/clients';
import { scaleService } from '@/lib/api/scales';
import { EvaluationResponse } from '@/types/evaluation';
import { Client } from '@/types/client';
import { Scale } from '@/types/scale';
import { cn } from '@/lib/utils';
import ProgressChart from '@/components/home/ProgressChart';
import { useAuthStore } from '@/lib/stores/store';

export default function PatientHistory() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [patient, setPatient] = useState<Client | null>(null);
  const [evaluations, setEvaluations] = useState<EvaluationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const [scaleFilter, setScaleFilter] = useState('');
  const [meta, setMeta] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [scales, setScales] = useState<Scale[]>([]);
  const [fetchingScales, setFetchingScales] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [evaluationToDelete, setEvaluationToDelete] = useState<EvaluationResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const data = await clientService.getClientById(id as string);
        setPatient(data);
      } catch (err: any) {
        console.error('Error fetching patient:', err);
        const apiError = err.response?.data?.error || 'Não foi possível carregar os detalhes do paciente.';
        if (apiError === 'Access denied. You are not linked to this client.') {
          setError('Acesso negado. Você não tem permissão para ver o histórico deste paciente.');
        }
      } finally {
        setLoadingPatient(false);
      }
    };

    const fetchScales = async () => {
      setFetchingScales(true);
      try {
        const data = await scaleService.getScales();
        setScales(data);
      } catch (err) {
        console.error('Error fetching scales:', err);
      } finally {
        setFetchingScales(false);
      }
    };

    if (id) {
      fetchPatient();
      fetchScales();
    }
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (id) fetchEvaluations(page);
    }, 300);

    return () => clearTimeout(timer);
  }, [id, scaleFilter, page]);

  const fetchEvaluations = async (p = 1) => {
    setLoading(true);
    try {
      const result = await evaluationService.getEvaluationsByClient(id as string, scaleFilter, p);
      setEvaluations(result.data);
      setMeta(result.meta);
    } catch (err: any) {
      console.error('Error fetching evaluations:', err);
      const apiError = err.response?.data?.error || 'Erro ao carregar histórico.';
      if (apiError === 'Access denied. You are not linked to this client.') {
        setError('Acesso negado. Você não tem permissão para ver o histórico deste paciente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvaluation = async () => {
    if (!evaluationToDelete) return;
    setDeleting(true);
    try {
      await evaluationService.deleteEvaluation(evaluationToDelete.id);
      setIsDeleteModalOpen(false);
      setEvaluationToDelete(null);
      fetchEvaluations(page);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao excluir avaliação.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary text-white flex flex-col pb-12">
      {/* Header */}
      <header className="h-20 flex items-center px-6 sticky top-0 bg-secondary/80 backdrop-blur-xl z-50 border-b border-white/5">
        <div className="max-w-4xl w-full mx-auto flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all active:scale-95"
          >
            <RiArrowLeftLine size={24} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black tracking-tighter uppercase truncate">Histórico</h1>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest truncate">
              {loadingPatient ? 'Carregando...' : patient?.full_name}
            </p>
          </div>
        </div>
      </header>

      {error ? (
        <main className="max-w-4xl w-full mx-auto px-6 py-20 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 animate-bounce">
            <RiHistoryLine size={48} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Acesso Restrito</h2>
            <p className="text-white/40 max-w-xs mx-auto">{error}</p>
          </div>
          <button 
            onClick={() => router.back()}
            className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl transition-all"
          >
            Voltar
          </button>
        </main>
      ) : (
        <main className="max-w-4xl w-full mx-auto px-6 py-8 space-y-8 animate-fade-in-up">
        {/* Scale Filter Choices */}
        <section className="bg-tertiary border border-white/5 rounded-[2.5rem] p-6 space-y-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 text-primary/5 -rotate-12 translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
            <RiHistoryLine size={100} />
          </div>

          <div className="relative space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <RiSearchLine size={20} />
              <h3 className="text-sm font-black uppercase tracking-widest">Filtrar por Escala</h3>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => {
                  setScaleFilter('');
                  setPage(1);
                }}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border",
                  scaleFilter === '' 
                    ? "bg-primary text-secondary-dark border-primary shadow-lg shadow-primary/20" 
                    : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10"
                )}
              >
                Todas
              </button>
              
              {fetchingScales ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="w-20 h-9 bg-white/5 rounded-xl animate-pulse" />
                ))
              ) : (
                scales.map((scale) => (
                  <button
                    key={scale.id}
                    onClick={() => {
                      setScaleFilter(scale.name);
                      setPage(1);
                    }}
                    className={cn(
                      "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border",
                      scaleFilter === scale.name 
                        ? "bg-primary text-secondary-dark border-primary shadow-lg shadow-primary/20" 
                        : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10"
                    )}
                  >
                    {scale.name}
                  </button>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Progress Chart Section */}
        {scaleFilter && (
          <section className="animate-fade-in">
            <ProgressChart 
              evaluations={evaluations} 
              scaleName={scaleFilter} 
            />
          </section>
        )}

        {/* List Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3 text-white/40">
              <RiHistoryLine size={20} />
              <h3 className="text-sm font-bold uppercase tracking-widest">Avaliações Realizadas</h3>
            </div>
            {meta && (
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                {meta.total} no total
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-tertiary border border-white/5 rounded-[2rem] p-6 animate-pulse flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white/5" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-white/5 rounded w-1/3" />
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                    <div className="h-2 bg-white/5 rounded w-1/4" />
                  </div>
                </div>
              ))
            ) : evaluations.length === 0 ? (
              <div className="bg-tertiary/30 border border-dashed border-white/5 rounded-[3rem] py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/10 mx-auto">
                  <RiHistoryLine size={40} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-white/60">Nenhum registro encontrado</h4>
                  <p className="text-white/20 text-sm max-w-xs mx-auto">
                    {scaleFilter 
                      ? `Não encontramos avaliações para "${scaleFilter}". Tente outro termo.` 
                      : 'Este paciente ainda não possui avaliações registradas.'}
                  </p>
                </div>
              </div>
            ) : (
              evaluations.map((ev) => (
                <div 
                  key={ev.id}
                  onClick={() => router.push(`/evaluations/view/${ev.id}`)}
                  className="group bg-tertiary hover:bg-tertiary/80 border border-white/5 hover:border-primary/20 rounded-[2rem] p-6 transition-all duration-300 cursor-pointer flex items-center gap-5 relative overflow-hidden shadow-lg"
                >
                  {/* Decorative accent */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                  
                  <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/10 transition-all shrink-0">
                    <RiFileCopyLine size={28} />
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded-lg uppercase tracking-widest border border-primary/5">
                        {ev.scales?.name}
                      </span>
                      <span className="flex items-center gap-1.5 text-white/20 text-[10px] font-bold uppercase tracking-widest">
                        <RiCalendarLine size={12} />
                        {new Date(ev.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-black text-white group-hover:text-primary transition-colors truncate tracking-tight">
                      {ev.title}
                    </h4>
                    
                    <div className="flex items-center gap-2 text-white/30">
                      <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center">
                        <RiUser3Line size={10} />
                      </div>
                      <p className="text-[11px] truncate">
                        Por: <span className="text-white/50 font-bold">{ev.professionals?.full_name}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/studio/analysis/${ev.id}?clientId=${ev.client_fk}&scaleId=${ev.scale_fk}`);
                      }}
                      className="p-3 bg-white/5 hover:bg-primary/10 hover:text-primary rounded-2xl transition-all active:scale-95 z-20"
                      title="Abrir no Studio"
                    >
                      <RiRocketLine size={20} />
                    </button>
                    
                    {(user?.role === 'admin' || user?.id === ev.professional_fk) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEvaluationToDelete(ev);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-3 bg-white/5 hover:bg-red-500/10 hover:text-red-500 rounded-2xl transition-all active:scale-95 z-20"
                        title="Excluir Avaliação"
                      >
                        <RiDeleteBinLine size={20} />
                      </button>
                    )}

                    <RiArrowRightSLine className="text-white/10 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 ml-1" size={24} />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-8">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="p-4 bg-white/5 hover:bg-white/10 disabled:opacity-20 rounded-2xl border border-white/5 transition-all"
              >
                <RiArrowLeftLine size={20} />
              </button>
              
              <div className="px-6 py-3 bg-tertiary border border-white/5 rounded-2xl text-center min-w-[120px]">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-0.5">Página</p>
                <p className="text-sm font-bold text-white">
                  <span className="text-primary">{page}</span> de {meta.totalPages}
                </p>
              </div>

              <button 
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages || loading}
                className="p-4 bg-white/5 hover:bg-white/10 disabled:opacity-20 rounded-2xl border border-white/5 transition-all"
              >
                <RiArrowRightSLine size={24} />
              </button>
            </div>
          )}
        </section>
      </main>
    )}

    {/* Delete Confirmation Modal */}
    {isDeleteModalOpen && (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-secondary-dark/80 backdrop-blur-md" onClick={() => !deleting && setIsDeleteModalOpen(false)} />
        <div className="relative w-full max-w-sm bg-secondary border border-white/5 rounded-[2.5rem] p-8 shadow-2xl space-y-6 animate-fade-in-up">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto">
            <RiErrorWarningLine size={32} />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-black uppercase tracking-tighter">Excluir Avaliação</h3>
            <p className="text-white/40 text-sm">
              Tem certeza que deseja excluir a avaliação <strong>{evaluationToDelete?.title}</strong>? Esta ação removerá permanentemente os dados do histórico.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleDeleteEvaluation}
              disabled={deleting}
              className="w-full py-4 bg-red-500 text-white font-black rounded-2xl hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {deleting ? <RiLoader4Line className="animate-spin" size={20} /> : <RiDeleteBinLine size={20} />}
              {deleting ? 'EXCLUINDO...' : 'SIM, EXCLUIR'}
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
              className="w-full py-4 bg-white/5 text-white/50 font-black rounded-2xl hover:bg-white/10 transition-all disabled:opacity-50"
            >
              CANCELAR
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
