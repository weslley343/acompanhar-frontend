'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/stores/store';
import {
  RiEditBoxLine,
  RiMailLine,
  RiUser3Line,
  RiInformationLine,
  RiImageAddLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiLoader4Line,
  RiCheckboxCircleLine,
  RiDeleteBinLine
} from 'react-icons/ri';
import { authApi } from '@/lib/api/auth';
import { getImageUrl, cn } from '@/lib/utils';
import Image from 'next/image';

const LOCAL_AVATARS = {
  professional: {
    boys: ['bruno.png', 'diego.png', 'francisco.png', 'hermano.png', 'roberto.png'],
    girls: ['augusta.png', 'bruna.png', 'emanuele.png', 'isadora.png', 'livia.png']
  },
  responsible: {
    boys: ['eitor.png', 'enzo.png', 'leandro.png', 'paulo.png', 'welington.png'],
    girls: ['eloisa.png', 'emilia.png', 'milena.png', 'regina.png', 'veronica.png']
  },
  admin: {
    boys: ['bruno.png', 'diego.png', 'francisco.png', 'hermano.png', 'roberto.png'],
    girls: ['augusta.png', 'bruna.png', 'emanuele.png', 'isadora.png', 'livia.png']
  }
};

export default function ProfileEdit() {
  const { user, setUser } = useAuthStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [description, setDescription] = useState(user?.description || '');
  const [imageUrl, setImageUrl] = useState(user?.image_url || '');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // No need to fetch avatars from API, using local ones
  }, []);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const updatedUser = await authApi.updateProfile(user.id, user.role, {
        full_name: fullName,
        description,
        image_url: imageUrl
      });
      setUser(updatedUser);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = 200;
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getAvailableAvatars = () => {
    const role = user.role as keyof typeof LOCAL_AVATARS;
    // Mapeia o role singular para o nome da pasta plural no diretório public
    const folderMap: Record<string, string> = {
      professional: 'professionals',
      responsible: 'responsibles',
      admin: 'professionals' // Admin usa os mesmos de profissional por padrão
    };

    const folder = folderMap[role];

    if (LOCAL_AVATARS[role]) {
      const { boys, girls } = LOCAL_AVATARS[role];
      return [
        ...boys.map(img => `/static/avatars/${folder}/boys/${img}`),
        ...girls.map(img => `/static/avatars/${folder}/girls/${img}`)
      ];
    }
    return [];
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-fade-in-up pb-12">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Editar Perfil</h2>
        <p className="text-white/50 text-sm">Atualize suas informações pessoais e de acesso.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Selection - Hidden for Admins */}
        {user.role !== 'admin' && (
          <div className="bg-tertiary border border-white/5 p-8 rounded-3xl space-y-6">
            <div className="flex items-center gap-3 text-primary mb-2">
              <RiImageAddLine size={20} />
              <h3 className="text-sm font-black uppercase tracking-widest">Foto de Perfil</h3>
            </div>

            <div className="flex flex-col items-center gap-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative w-32 h-32 rounded-3xl bg-secondary border-2 border-white/10 overflow-hidden flex items-center justify-center shadow-2xl group-hover:border-primary/30 transition-colors">
                  {imageUrl ? (
                    <Image
                      src={getImageUrl(imageUrl) || ''}
                      alt="Preview"
                      fill
                      sizes="(max-width: 768px) 128px, 128px"
                      className="object-cover"
                    />
                  ) : (
                    <RiUser3Line size={48} className="text-white/10" />
                  )}

                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-all duration-300 z-20 hover:scale-110 active:scale-95"
                      title="Remover Foto"
                    >
                      <RiDeleteBinLine size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="w-full relative group/carousel">
                {/* Navigation Arrows */}
                <button
                  type="button"
                  onClick={() => scroll('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 p-2 bg-secondary/80 backdrop-blur-md border border-white/10 rounded-full text-white/40 hover:text-primary hover:border-primary/30 transition-all opacity-0 group-hover/carousel:opacity-100"
                >
                  <RiArrowLeftSLine size={20} />
                </button>

                <button
                  type="button"
                  onClick={() => scroll('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 p-2 bg-secondary/80 backdrop-blur-md border border-white/10 rounded-full text-white/40 hover:text-primary hover:border-primary/30 transition-all opacity-0 group-hover/carousel:opacity-100"
                >
                  <RiArrowRightSLine size={20} />
                </button>

                <div
                  ref={scrollContainerRef}
                  className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth px-2 py-2"
                >
                  {getAvailableAvatars().map((avatar, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImageUrl(avatar)}
                      className={cn(
                        "relative min-w-[80px] h-20 rounded-xl bg-secondary border transition-all duration-300 overflow-hidden shrink-0",
                        imageUrl === avatar
                          ? "border-primary ring-4 ring-primary/20 scale-110 z-10"
                          : "border-white/5 hover:border-white/20 grayscale hover:grayscale-0"
                      )}
                    >
                      <Image
                        src={getImageUrl(avatar) || ''}
                        alt="Avatar Option"
                        fill
                        sizes="(max-width: 768px) 80px, 80px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-tertiary border border-white/5 p-8 rounded-3xl space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/60 ml-1 flex items-center gap-2">
              <RiUser3Line className="text-primary" /> Nome Completo
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/60 ml-1 flex items-center gap-2">
              <RiMailLine className="text-primary" /> Email
            </label>
            <input
              type="email"
              defaultValue={user.email}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all opacity-60"
              disabled
            />
            <p className="text-[10px] text-white/30 ml-1 italic">O email não pode ser alterado diretamente.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/60 ml-1 flex items-center gap-2">
              <RiInformationLine className="text-primary" /> Sobre Você
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none"
              placeholder="Conte um pouco sobre sua atuação..."
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-sm flex items-center gap-3 animate-shake">
            <RiLoader4Line className="animate-spin" />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full py-5 font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 group",
              success
                ? "bg-green-500 text-white shadow-green-500/20"
                : "bg-primary text-secondary-dark shadow-primary/20 hover:bg-primary-dark"
            )}
          >
            {loading ? (
              <RiLoader4Line size={20} className="animate-spin" />
            ) : success ? (
              <>
                <RiCheckboxCircleLine size={20} className="animate-bounce" />
                Perfil Atualizado!
              </>
            ) : (
              <>
                <RiEditBoxLine size={20} className="group-hover:scale-110 transition-transform" />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
