'use client';

import { useState, useEffect } from 'react';
import { 
  RiUserStarLine, 
  RiSearchLine, 
  RiArrowLeftSLine, 
  RiArrowRightSLine, 
  RiInformationLine, 
  RiErrorWarningLine,
  RiDeleteBinLine,
  RiAddLine,
  RiMailLine,
  RiHashtag
} from 'react-icons/ri';
import { professionalApi, Professional } from '@/lib/api/professionals';
import Image from 'next/image';
import { cn, getImageUrl } from '@/lib/utils';
import CreateProfessionalModal from '@/components/admin/CreateProfessionalModal';

export default function ProfessionalList() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchProfessionals = async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await professionalApi.list({ 
        page: p, 
        limit: 9, 
        name: searchTerm 
      });
      setProfessionals(response.data);
      setMeta(response.meta);
    } catch (err: any) {
      setError('Erro ao carregar profissionais. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProfessionals(page);
    }, 300);
    return () => clearTimeout(timer);
  }, [page, searchTerm]);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este profissional?')) return;
    
    setIsDeleting(id);
    try {
      await professionalApi.delete(id);
      fetchProfessionals(page);
    } catch (err: any) {
      alert('Erro ao deletar profissional.');
    } finally {
      setIsDeleting(null);
    }
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-tertiary/20 rounded-[3rem] border border-white/5 animate-fade-in">
      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/10">
        <RiInformationLine size={40} />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white">Nenhum profissional</h3>
        <p className="text-white/40 max-w-xs mx-auto text-sm">
          Ainda não há profissionais cadastrados no sistema.
        </p>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="mt-4 px-6 py-3 bg-primary text-secondary font-black rounded-2xl hover:scale-105 transition-all flex items-center gap-2 mx-auto"
        >
          <RiAddLine size={20} />
          Cadastrar Primeiro
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in-up pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Equipe Profissional</h2>
          <p className="text-white/50 text-sm">Gerencie os profissionais de saúde cadastrados no sistema.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group flex-1 md:flex-none">
            <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar por nome..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full md:w-64 bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm shadow-inner"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="p-4 bg-primary text-secondary font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
            title="Novo Profissional"
          >
            <RiAddLine size={24} />
            <span className="hidden md:inline">NOVO</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-tertiary/40 border border-white/5 h-48 rounded-[2.5rem] animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-24 bg-red-500/5 rounded-[3rem] border border-red-500/10">
          <RiErrorWarningLine size={40} className="mx-auto text-red-500 mb-4" />
          <p className="text-white/40">{error}</p>
        </div>
      ) : professionals.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals.map((prof) => (
              <div 
                key={prof.id} 
                className="bg-tertiary border border-white/5 p-6 rounded-[2.5rem] hover:border-primary/30 transition-all group relative overflow-hidden flex flex-col justify-between h-full"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all overflow-hidden border border-white/5">
                      {prof.image_url ? (
                        <Image 
                          src={getImageUrl(prof.image_url) || ''} 
                          alt={prof.full_name} 
                          width={64} 
                          height={64} 
                          className="object-cover"
                        />
                      ) : (
                        <RiUserStarLine size={32} />
                      )}
                    </div>
                    <button 
                      onClick={() => handleDelete(prof.id)}
                      disabled={isDeleting === prof.id}
                      className="p-2 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <RiDeleteBinLine size={20} />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-white font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">{prof.full_name}</h3>
                    <p className="text-primary/60 text-xs font-black uppercase tracking-widest mt-1">{prof.specialty}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/30 text-xs">
                      <RiMailLine className="shrink-0" />
                      <span className="truncate">{prof.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/30 text-xs">
                      <RiHashtag className="shrink-0" />
                      <span>{prof.identifier || 'Sem registro'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/5">
                  <p className="text-[10px] text-white/20 font-medium line-clamp-2 italic">
                    {prof.description || 'Nenhuma biografia informada.'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-8">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className={cn(
                  "p-3 rounded-2xl border border-white/10 transition-all",
                  page === 1 ? "opacity-20 cursor-not-allowed" : "hover:bg-white/5 active:scale-90"
                )}
              >
                <RiArrowLeftSLine size={24} className="text-white" />
              </button>
              <div className="bg-white/5 px-6 py-2.5 rounded-2xl border border-white/10">
                <span className="text-sm font-bold text-white">
                  Página <span className="text-primary">{page}</span> de {meta.totalPages}
                </span>
              </div>
              <button 
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages || loading}
                className={cn(
                  "p-3 rounded-2xl border border-white/10 transition-all",
                  page === meta.totalPages ? "opacity-20 cursor-not-allowed" : "hover:bg-white/5 active:scale-90"
                )}
              >
                <RiArrowRightSLine size={24} className="text-white" />
              </button>
            </div>
          )}
        </>
      )}

      <CreateProfessionalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          setIsModalOpen(false);
          fetchProfessionals(1);
        }}
      />
    </div>
  );
}
