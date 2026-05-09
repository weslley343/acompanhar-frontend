'use client';

import { useState, useEffect, useRef } from 'react';
import {
  RiCloseLine,
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
  RiArrowLeftSLine,
  RiSaveLine
} from 'react-icons/ri';
import { clientService } from '@/lib/api/clients';
import { assetService, AvatarTree } from '@/lib/api/assets';
import { cn, getImageUrl } from '@/lib/utils';
import Image from 'next/image';
import { Client, UpdateClientDTO } from '@/types/client';

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Client;
  onSuccess: (updatedPatient: Client) => void;
}

export default function EditPatientModal({ isOpen, onClose, patient, onSuccess }: EditPatientModalProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState<UpdateClientDTO>({
    full_name: patient.full_name,
    birthdate: patient.birthdate ? patient.birthdate.split('T')[0] : '', // Extract YYYY-MM-DD
    gender: patient.gender || 'unspecified',
    identifier: patient.identifier || '',
    description: patient.description || '',
    image_url: patient.image_url || '',
  });

  const [loading, setLoading] = useState(false);
  const [fetchingAvatars, setFetchingAvatars] = useState(false);
  const [avatars, setAvatars] = useState<AvatarTree | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (isOpen) {
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
      
      // Reset form with current patient data when opening
      setFormData({
        full_name: patient.full_name,
        birthdate: patient.birthdate ? patient.birthdate.split('T')[0] : '',
        gender: patient.gender || 'unspecified',
        identifier: patient.identifier || '',
        description: patient.description || '',
        image_url: patient.image_url || '',
      });
      setError(null);
      setFieldErrors({});
    }
  }, [isOpen, patient]);

  if (!isOpen) return null;

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
      const payload: UpdateClientDTO = {
        ...formData,
        identifier: formData.identifier || undefined,
        image_url: formData.image_url || undefined,
      };

      const updated = await clientService.updateClient(patient.id, payload);
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      const responseData = err.response?.data;
      if (responseData?.error?.fieldErrors) {
        setFieldErrors(responseData.error.fieldErrors);
      } else {
        setError(responseData?.error || 'Ocorreu um erro ao tentar atualizar o paciente.');
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-secondary-dark/80 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-xl bg-secondary border border-white/5 rounded-[3rem] shadow-2xl flex flex-col max-h-[90vh] animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <RiSaveLine size={20} />
            </div>
            <h3 className="text-xl font-black tracking-tighter uppercase">Editar Paciente</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl transition-all text-white/40 hover:text-white"
          >
            <RiCloseLine size={24} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 pt-2 scrollbar-hide">
          <form id="edit-patient-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-sm animate-shake">
                <RiErrorWarningLine size={20} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Avatar Picker */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 ml-1 flex items-center gap-2 tracking-widest uppercase">
                <RiImageAddLine className="text-primary" size={14} /> Avatar do Paciente
              </label>
              
              <div className="relative group/picker">
                <div 
                  ref={scrollContainerRef}
                  className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2 mask-linear-right scroll-smooth"
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
                            "relative shrink-0 w-16 h-16 rounded-2xl overflow-hidden transition-all duration-300 ring-2 ring-transparent",
                            isSelected ? "ring-primary scale-110 shadow-lg shadow-primary/20" : "opacity-40 grayscale hover:opacity-100 hover:grayscale-0"
                          )}
                        >
                          <Image 
                            src={displayUrl} 
                            alt="Avatar" 
                            fill 
                            sizes="(max-width: 768px) 64px, 64px"
                            className="object-cover"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                              <RiCheckboxCircleLine className="text-primary" size={20} />
                            </div>
                          )}
                        </button>
                      );
                    })
                  ) : null}
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 ml-1 flex items-center gap-2 tracking-widest uppercase">
                <RiUser6Line className="text-primary" size={14} /> Nome Completo *
              </label>
              <input 
                type="text" 
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Ex: João Silva"
                className={cn(
                  "w-full bg-white/5 border rounded-[1.5rem] py-4 px-5 text-white placeholder:text-white/10 focus:outline-none focus:ring-2 transition-all shadow-inner",
                  fieldErrors.full_name ? "border-red-500/50 focus:ring-red-500/50" : "border-white/10 focus:ring-primary/50 focus:border-primary/50"
                )}
                disabled={loading}
              />
            </div>
            
            {/* Birthdate & Gender Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 ml-1 flex items-center gap-2 tracking-widest uppercase">
                  <RiCalendarLine className="text-primary" size={14} /> Nascimento *
                </label>
                <input 
                  type="date" 
                  required
                  value={formData.birthdate}
                  onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                  className={cn(
                    "w-full bg-white/5 border rounded-[1.5rem] py-4 px-5 text-sm text-white focus:outline-none focus:ring-2 transition-all shadow-inner",
                    fieldErrors.birthdate ? "border-red-500/50 focus:ring-red-500/50" : "border-white/10 focus:ring-primary/50 focus:border-primary/50"
                  )}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 ml-1 flex items-center gap-2 tracking-widest uppercase">
                  <RiGenderlessLine className="text-primary" size={14} /> Gênero *
                </label>
                <select 
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-4 px-5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner appearance-none"
                  disabled={loading}
                >
                  <option value="male" className="bg-secondary">Masculino</option>
                  <option value="female" className="bg-secondary">Feminino</option>
                  <option value="unspecified" className="bg-secondary">Não informado</option>
                </select>
              </div>
            </div>

            {/* Identifier */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 ml-1 flex items-center gap-2 tracking-widest uppercase">
                <RiSearchLine className="text-primary" size={14} /> Identificador
              </label>
              <input 
                type="text" 
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                className={cn(
                  "w-full bg-white/5 border rounded-[1.5rem] py-4 px-5 text-sm text-white focus:outline-none focus:ring-2 transition-all shadow-inner",
                  fieldErrors.identifier ? "border-red-500/50 focus:ring-red-500/50" : "border-white/10 focus:ring-primary/50 focus:border-primary/50"
                )}
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 ml-1 flex items-center gap-2 tracking-widest uppercase">
                <RiText className="text-primary" size={14} /> Observações
              </label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Conte um pouco sobre o paciente..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-4 px-5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner resize-none"
                disabled={loading}
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-secondary/50 backdrop-blur-xl rounded-b-[3rem]">
          <button 
            form="edit-patient-form"
            type="submit"
            disabled={loading}
            className={cn(
              "w-full py-4 rounded-2xl font-black text-lg transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 group",
              loading
                ? "bg-white/5 text-white/10 cursor-not-allowed"
                : "bg-primary text-secondary-dark shadow-primary/20 hover:shadow-primary/40"
            )}
          >
            {loading ? (
              <>
                <RiLoader4Line size={24} className="animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <RiSaveLine size={24} />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
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
