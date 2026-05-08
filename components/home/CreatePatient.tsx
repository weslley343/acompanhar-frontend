'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  RiArrowLeftLine,
  RiUserAddLine,
  RiUser6Line,
  RiCalendarLine,
  RiGenderlessLine,
  RiText,
  RiSearchLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiCheckboxCircleLine,
  RiImageAddLine,
  RiArrowRightSLine,
  RiArrowLeftSLine
} from 'react-icons/ri';
import { useAuthStore } from '@/lib/stores/store';
import { clientService } from '@/lib/api/clients';
import { assetService, AvatarTree } from '@/lib/api/assets';
import { cn, getImageUrl } from '@/lib/utils';
import Image from 'next/image';
import SuccessModal from '@/components/ui/SuccessModal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://acompanhar-production.up.railway.app';

export default function CreatePatient() {
  const router = useRouter();
  const { user } = useAuthStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    birthdate: '',
    gender: 'unspecified' as 'male' | 'female' | 'unspecified',
    identifier: '',
    description: '',
    image_url: '',
  });

  const [loading, setLoading] = useState(false);
  const [fetchingAvatars, setFetchingAvatars] = useState(false);
  const [avatars, setAvatars] = useState<AvatarTree | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvatars = async () => {
      setFetchingAvatars(true);
      try {
        const data = await assetService.getAvatars();
        setAvatars(data);
      } catch (err) {
        console.error('Failed to fetch avatars', err);
      } finally {
        setFetchingAvatars(false);
      }
    };
    fetchAvatars();
  }, []);

  // Check if user is responsible
  useEffect(() => {
    if (user && user.role !== 'responsible') {
      router.push('/home');
    }
  }, [user, router]);

  if (!user || user.role !== 'responsible') return null;

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!formData.full_name || !formData.birthdate || !formData.gender) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);

    try {
      // Send data to API
      // Backend expects: identifier (optional), full_name, birthdate, gender, description
      const payload = {
        ...formData,
        identifier: formData.identifier || undefined,
        image_url: formData.image_url || undefined,
      };

      await clientService.createClient(payload as any);
      setSuccess('O paciente foi cadastrado com sucesso em nossa plataforma.');
    } catch (err: any) {
      const responseData = err.response?.data;
      if (responseData?.error?.fieldErrors) {
        setFieldErrors(responseData.error.fieldErrors);
      } else {
        setError(responseData?.error || 'Ocorreu um erro ao tentar criar o paciente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = 240;
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getAvailableAvatars = () => {
    if (!avatars) return [];
    return [...avatars.tree.clients.boys, ...avatars.tree.clients.girls];
  };

  return (
    <div className="min-h-screen bg-secondary text-white flex flex-col">
      <SuccessModal 
        isOpen={!!success} 
        message={success || ''} 
        redirectUrl="/home" 
      />
      
      {/* Header */}
      <header className="h-16 bg-secondary/80 backdrop-blur-xl border-b border-white/5 flex items-center px-6 sticky top-0 z-50">
        <div className="max-w-xl w-full mx-auto flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            disabled={loading}
            className="p-2 hover:bg-white/5 rounded-xl transition-all active:scale-90 text-white/50 hover:text-white disabled:opacity-20"
          >
            <RiArrowLeftLine size={20} />
          </button>
          <h1 className="text-lg font-bold">Novo Paciente</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col px-6 max-w-xl mx-auto w-full py-8 space-y-8 animate-fade-in-up">
        {/* Intro */}
        <div className="space-y-2">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <RiUserAddLine size={24} />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tighter">Criar Perfil</h2>
            <p className="text-white/40 text-sm leading-relaxed">
              Preencha as informações para cadastrar um novo paciente sob sua responsabilidade.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-tertiary border border-white/5 p-6 rounded-[2.5rem] space-y-6 shadow-2xl relative overflow-hidden">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-3 text-red-500 text-xs animate-shake">
                <RiErrorWarningLine size={16} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Avatar Picker */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-white/30 ml-1 flex items-center gap-2 tracking-widest uppercase">
                <RiImageAddLine className="text-primary" size={14} /> Avatar do Paciente
              </label>
              
              <div className="relative group/picker">
                <div 
                  ref={scrollContainerRef}
                  className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2 mask-linear-right scroll-smooth"
                >
                  {fetchingAvatars ? (
                    <div className="flex items-center gap-3 py-4 text-white/20 text-xs italic">
                      <RiLoader4Line className="animate-spin" size={16} /> Carregando avatares...
                    </div>
                  ) : avatars ? (
                    getAvailableAvatars().map((avatarPath) => {
                      const relativeUrl = `${avatars.baseUrl}/${avatarPath}`;
                      const displayUrl = getImageUrl(relativeUrl) || '';
                      const isSelected = formData.image_url === relativeUrl;
                      
                      return (
                        <button
                          key={avatarPath}
                          type="button"
                          onClick={() => setFormData({ ...formData, image_url: relativeUrl })}
                          className={cn(
                            "relative shrink-0 w-20 h-20 rounded-2xl overflow-hidden transition-all duration-300 ring-2 ring-transparent",
                            isSelected ? "ring-primary scale-110 shadow-lg shadow-primary/20" : "opacity-40 grayscale hover:opacity-100 hover:grayscale-0"
                          )}
                        >
                          <Image 
                            src={displayUrl} 
                            alt="Avatar" 
                            fill 
                            className="object-cover"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                              <RiCheckboxCircleLine className="text-primary" size={24} />
                            </div>
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-white/20 text-xs py-4 italic">Nenhum avatar encontrado.</div>
                  )}
                </div>

                {/* Desktop Navigation Arrows */}
                <div className="hidden md:block">
                  <button
                    type="button"
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-8 h-8 bg-secondary/80 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-primary hover:border-primary transition-all shadow-xl opacity-0 group-hover/picker:opacity-100 z-10"
                  >
                    <RiArrowLeftSLine size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-8 h-8 bg-secondary/80 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-primary hover:border-primary transition-all shadow-xl opacity-0 group-hover/picker:opacity-100 z-10"
                  >
                    <RiArrowRightSLine size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/30 ml-1 flex items-center gap-2 tracking-widest uppercase">
                <RiUser6Line className="text-primary" size={14} /> Nome Completo *
              </label>
              <input 
                type="text" 
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Ex: João Silva"
                className={cn(
                  "w-full bg-white/5 border rounded-2xl py-4 px-5 text-lg text-white placeholder:text-white/10 focus:outline-none focus:ring-2 transition-all shadow-inner",
                  fieldErrors.full_name || (error && !formData.full_name) ? "border-red-500/50 focus:ring-red-500/50" : "border-white/10 focus:ring-primary/50 focus:border-primary/50"
                )}
                disabled={loading}
              />
              {(fieldErrors.full_name || (error && !formData.full_name)) && (
                <p className="text-red-400 text-[10px] ml-1">{fieldErrors.full_name?.[0] || 'Nome completo é obrigatório'}</p>
              )}
            </div>
            
            {/* Birthdate & Gender Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 ml-1 flex items-center gap-2 tracking-widest uppercase">
                  <RiCalendarLine className="text-primary" size={14} /> Nascimento *
                </label>
                <input 
                  type="date" 
                  required
                  value={formData.birthdate}
                  onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                  className={cn(
                    "w-full bg-white/5 border rounded-2xl py-4 px-5 text-sm text-white focus:outline-none focus:ring-2 transition-all shadow-inner appearance-none",
                    fieldErrors.birthdate || (error && !formData.birthdate) ? "border-red-500/50 focus:ring-red-500/50" : "border-white/10 focus:ring-primary/50 focus:border-primary/50"
                  )}
                  disabled={loading}
                />
                {(fieldErrors.birthdate || (error && !formData.birthdate)) && (
                  <p className="text-red-400 text-[10px] ml-1">{fieldErrors.birthdate?.[0] || 'Data de nascimento é obrigatória'}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 ml-1 flex items-center gap-2 tracking-widest uppercase">
                  <RiGenderlessLine className="text-primary" size={14} /> Gênero *
                </label>
                <select 
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className={cn(
                    "w-full bg-white/5 border rounded-2xl py-4 px-5 text-sm text-white focus:outline-none focus:ring-2 transition-all shadow-inner appearance-none",
                    fieldErrors.gender ? "border-red-500/50 focus:ring-red-500/50" : "border-white/10 focus:ring-primary/50 focus:border-primary/50"
                  )}
                  disabled={loading}
                >
                  <option value="male" className="bg-secondary">Masculino</option>
                  <option value="female" className="bg-secondary">Feminino</option>
                  <option value="unspecified" className="bg-secondary">Não informado</option>
                </select>
                {fieldErrors.gender && (
                  <p className="text-red-400 text-[10px] ml-1">{fieldErrors.gender[0]}</p>
                )}
              </div>
            </div>

            {/* Identifier (Optional) */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/30 ml-1 flex items-center gap-2 tracking-widest uppercase">
                <RiSearchLine className="text-primary" size={14} /> Identificador Customizado
              </label>
              <input 
                type="text" 
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                placeholder="Ex: JOAO_2024 (Opcional)"
                className={cn(
                  "w-full bg-white/5 border rounded-2xl py-4 px-5 text-sm text-white placeholder:text-white/10 focus:outline-none focus:ring-2 transition-all shadow-inner",
                  fieldErrors.identifier ? "border-red-500/50 focus:ring-red-500/50" : "border-white/10 focus:ring-primary/50 focus:border-primary/50"
                )}
                disabled={loading}
              />
              <p className="text-[9px] text-white/20 ml-1 italic">
                Se deixado em branco, o sistema gerará um identificador único automaticamente.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/30 ml-1 flex items-center gap-2 tracking-widest uppercase">
                <RiText className="text-primary" size={14} /> Observações
              </label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Conte um pouco sobre o paciente..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-inner resize-none"
                disabled={loading}
              />
            </div>
          </div>

          <div className="pb-12">
            <button 
              type="submit"
              disabled={loading}
              className={cn(
                "w-full py-5 rounded-[2rem] font-black text-xl transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 group",
                loading
                  ? "bg-white/5 text-white/10 cursor-not-allowed border border-white/5"
                  : "bg-primary text-secondary-dark shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1"
              )}
            >
              {loading ? (
                <>
                  <RiLoader4Line size={24} className="animate-spin" />
                  Criando Paciente...
                </>
              ) : (
                <>
                  <RiUserAddLine size={24} className="group-hover:scale-110 transition-transform" />
                  Cadastrar Paciente
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .mask-linear-right {
          mask-image: linear-gradient(to right, black 80%, transparent 100%);
        }
      `}</style>
    </div>
  );
}
