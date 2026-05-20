'use client';

import { useState, useEffect } from 'react';
import { RiUserLine, RiSearchLine, RiArrowLeftSLine, RiArrowRightSLine, RiInformationLine, RiErrorWarningLine, RiGenderlessLine } from 'react-icons/ri';
import { useAuthStore } from '@/lib/stores/store';
import { clientService } from '@/lib/api/clients';
import { ClientRelation, PaginationMeta } from '@/types/client';
import Image from 'next/image';
import Link from 'next/link';
import { cn, getImageUrl } from '@/lib/utils';


export default function UserList() {
  const { user } = useAuthStore();
  const [relations, setRelations] = useState<ClientRelation[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('');

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://acompanhar-production.up.railway.app';


  const fetchClients = async (p: number) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const response = await clientService.getClients(user.role, p, 9, searchTerm, genderFilter);
      setRelations(response.data);
      setMeta(response.meta);
    } catch (err: any) {
      setError(
        err.response?.status === 401 
          ? 'Sessão expirada. Faça login novamente.' 
          : 'Erro ao carregar pacientes. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients(page);
    }, 300);

    return () => clearTimeout(timer);
  }, [page, user?.role, searchTerm, genderFilter]);

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-tertiary/20 rounded-[3rem] border border-white/5 animate-fade-in">
      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/10">
        <RiInformationLine size={40} />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white">Nada por aqui ainda</h3>
        <p className="text-white/40 max-w-xs mx-auto text-sm leading-relaxed">
          {user?.role === 'professional' 
            ? "Não há nada aqui por enquanto, experimente adicionar pacientes para começar o acompanhamento."
            : "Você ainda não possui pacientes vinculados. Experimente criar ou solicitar o vínculo."}
        </p>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-red-500/5 rounded-[3rem] border border-red-500/10 animate-fade-in">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
        <RiErrorWarningLine size={40} />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white">Ops! Algo deu errado</h3>
        <p className="text-white/40 max-w-xs mx-auto text-sm">{error}</p>
        <button 
          onClick={() => fetchClients(page)}
          className="mt-4 px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all text-sm font-medium"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Pacientes</h2>
          <p className="text-white/50 text-sm">Visualize e gerencie o progresso dos pacientes sob seu cuidado.</p>
        </div>

        <div className="space-y-4">
          <div className="relative group">
            <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou identificador..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full md:w-72 bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => { setGenderFilter(''); setPage(1); }}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0",
                genderFilter === '' 
                  ? "bg-primary text-secondary-dark border-primary shadow-lg shadow-primary/10" 
                  : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10"
              )}
            >
              Todos
            </button>
            <button
              onClick={() => { setGenderFilter('male'); setPage(1); }}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0",
                genderFilter === 'male' 
                  ? "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/10" 
                  : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10"
              )}
            >
              Masculino
            </button>
            <button
              onClick={() => { setGenderFilter('female'); setPage(1); }}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0",
                genderFilter === 'female' 
                  ? "bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-500/10" 
                  : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10"
              )}
            >
              Feminino
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-tertiary/40 border border-white/5 p-6 rounded-[2.5rem] animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-white/5 rounded" />
                  <div className="h-3 w-16 bg-white/5 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        renderErrorState()
      ) : relations.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relations.map((relation) => {
              const client = relation.clients;
              return (
                <Link 
                  href={`/patients/${client.id}?rel=${relation.id}`}
                  key={relation.id} 
                  className="bg-tertiary border border-white/5 p-6 rounded-[2.5rem] hover:border-primary/30 hover:bg-primary/5 transition-all group cursor-pointer relative overflow-hidden block"
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all overflow-hidden border border-white/5">
                      {client.image_url && !imageErrors[relation.id] ? (
                        <Image 
                          src={getImageUrl(client.image_url) || ''} 
                          alt={client.full_name} 
                          width={56} 
                          height={56} 
                          className="object-cover"
                          onError={() => handleImageError(relation.id)}
                        />
                      ) : (
                        <RiUserLine size={28} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold truncate group-hover:text-primary transition-colors">{client.full_name}</h3>
                      <div className="flex flex-col mt-0.5">
                        <span className="text-[10px] text-card-identifier uppercase tracking-widest font-black truncate">{client.identifier || 'S/ USER'}</span>
                      </div>
                    </div>
                  </div>
                  {/* Glass highlight effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            })}
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
    </div>
  );
}
