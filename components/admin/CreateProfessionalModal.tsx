'use client';

import { useState } from 'react';
import { 
  RiCloseLine, 
  RiUserStarLine, 
  RiMailLine, 
  RiLockLine, 
  RiHashtag, 
  RiStethoscopeLine, 
  RiFileTextLine,
  RiImageLine,
  RiLoader4Line
} from 'react-icons/ri';
import { professionalApi } from '@/lib/api/professionals';
import { cn } from '@/lib/utils';

interface CreateProfessionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateProfessionalModal({ isOpen, onClose, onSuccess }: CreateProfessionalModalProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    specialty: '',
    identifier: '',
    image_url: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await professionalApi.create(formData);
      onSuccess();
      setFormData({
        full_name: '',
        email: '',
        password: '',
        specialty: '',
        identifier: '',
        image_url: '',
        description: ''
      });
    } catch (err: any) {
      console.error('Error creating professional:', err);
      const message = err.response?.data?.error || 'Erro ao cadastrar profissional. Verifique os dados.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-secondary/80 backdrop-blur-xl" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-tertiary border border-white/10 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh] animate-scale-in overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <RiUserStarLine size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Novo Profissional</h2>
              <p className="text-white/40 text-xs font-medium uppercase tracking-widest">Cadastro no sistema</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-2xl transition-all"
          >
            <RiCloseLine size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold text-center animate-pulse">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Nome Completo *</label>
              <div className="relative group">
                <RiUserStarLine className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  name="full_name"
                  required
                  placeholder="Ex: Dra. Ana Paula"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full bg-secondary border border-white/5 focus:border-primary/50 text-white px-12 py-4 rounded-2xl outline-none transition-all placeholder:text-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">E-mail de Acesso *</label>
              <div className="relative group">
                <RiMailLine className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
                <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="ana.paula@clinica.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-secondary border border-white/5 focus:border-primary/50 text-white px-12 py-4 rounded-2xl outline-none transition-all placeholder:text-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Senha Inicial *</label>
              <div className="relative group">
                <RiLockLine className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
                <input 
                  type="password" 
                  name="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-secondary border border-white/5 focus:border-primary/50 text-white px-12 py-4 rounded-2xl outline-none transition-all placeholder:text-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Especialidade *</label>
              <div className="relative group">
                <RiStethoscopeLine className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  name="specialty"
                  required
                  placeholder="Ex: Psicóloga Infantil"
                  value={formData.specialty}
                  onChange={handleChange}
                  className="w-full bg-secondary border border-white/5 focus:border-primary/50 text-white px-12 py-4 rounded-2xl outline-none transition-all placeholder:text-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Registro (CRM/CRP/CRFA)</label>
              <div className="relative group">
                <RiHashtag className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  name="identifier"
                  placeholder="Ex: CRP 06/12345"
                  value={formData.identifier}
                  onChange={handleChange}
                  className="w-full bg-secondary border border-white/5 focus:border-primary/50 text-white px-12 py-4 rounded-2xl outline-none transition-all placeholder:text-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">URL da Imagem de Perfil</label>
              <div className="relative group">
                <RiImageLine className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
                <input 
                  type="url" 
                  name="image_url"
                  placeholder="https://sua-imagem.com/foto.jpg"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="w-full bg-secondary border border-white/5 focus:border-primary/50 text-white px-12 py-4 rounded-2xl outline-none transition-all placeholder:text-white/10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Breve Descrição / Biografia</label>
            <div className="relative group">
              <RiFileTextLine className="absolute left-4 top-4 text-white/20 group-focus-within:text-primary transition-colors" />
              <textarea 
                name="description"
                rows={3}
                placeholder="Conte um pouco sobre a experiência do profissional..."
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-secondary border border-white/5 focus:border-primary/50 text-white px-12 py-4 rounded-2xl outline-none transition-all placeholder:text-white/10 resize-none"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-8 border-t border-white/5 bg-white/[0.02] flex items-center gap-4">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="flex-[2] py-4 bg-primary text-secondary font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RiLoader4Line className="animate-spin" size={20} />
                Cadastrando...
              </>
            ) : (
              'Cadastrar Profissional'
            )}
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
