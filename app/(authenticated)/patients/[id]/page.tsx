'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { clientService } from '@/lib/api/clients';
import { Client } from '@/types/client';
import {
  RiArrowLeftLine,
  RiCalendarLine,
  RiUser6Line,
  RiHashtag,
  RiInformationLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiTimeLine,
  RiGenderlessLine,
  RiUserAddLine,
  RiEditLine,
  RiFileCopyLine,
  RiShieldCheckLine,
  RiTeamLine,
  RiUserHeartLine,
  RiMailLine,
  RiDeleteBinLine,
  RiSearchLine,
  RiHistoryLine,
  RiArrowRightSLine,
  RiUserUnfollowLine
} from 'react-icons/ri';
import { getImageUrl } from '@/lib/utils';
import Image from 'next/image';
import { useAuthStore } from '@/lib/stores/store';
import EditPatientModal from '@/components/home/EditPatientModal';
import { Professional, Responsible } from '@/types/client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { UserRole } from '@/types/auth';

function PatientDetailContent() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const relationId = searchParams.get('rel');
  const { user } = useAuthStore();
  const [patient, setPatient] = useState<Client | null>(null);
  const [responsibles, setResponsibles] = useState<Responsible[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingExtras, setLoadingExtras] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isUnlinkConfirmOpen, setIsUnlinkConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [unlinking, setUnlinking] = useState(false);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const data = await clientService.getClientById(id as string);
        setPatient(data);

        // Fetch extras in parallel but separately to not block main info
        fetchExtras();
      } catch (err: any) {
        const apiError = err.response?.data?.error || 'Não foi possível carregar os detalhes do paciente.';
        setError(apiError === 'Access denied. You are not linked to this client.'
          ? 'Acesso negado. Você não tem permissão para ver este paciente.'
          : (apiError === 'Client not found' ? 'Paciente não encontrado.' : apiError));
      } finally {
        setLoading(false);
      }
    };

    const fetchExtras = async () => {
      setLoadingExtras(true);
      try {
        const [respData, profData] = await Promise.allSettled([
          clientService.getClientResponsibles(id as string),
          clientService.getClientProfessionals(id as string)
        ]);

        if (respData.status === 'fulfilled') {
          setResponsibles(respData.value.data);
        }

        if (profData.status === 'fulfilled') {
          setProfessionals(profData.value.data);
        }
      } catch (err) {
        console.error('Error fetching extras:', err);
      } finally {
        setLoadingExtras(false);
      }
    };

    if (id) fetchPatient();
  }, [id]);

  const handleUnlink = async () => {
    if (!relationId || !user) return;
    setUnlinking(true);
    try {
      await clientService.unlinkClient(user.role, relationId);
      router.push('/home');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao desvincular paciente.');
      setUnlinking(false);
      setIsUnlinkConfirmOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!patient) return;
    setDeleting(true);
    try {
      await clientService.deleteClient(patient.id);
      router.push('/home');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao excluir paciente.');
      setDeleting(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  const canEdit = (user?.id === patient?.creator_fk) || user?.role === 'admin';
  const isCreator = user?.id === patient?.creator_fk;

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-6 space-y-4">
        <RiLoader4Line className="text-primary animate-spin" size={40} />
        <p className="text-white/40 font-medium animate-pulse">Carregando detalhes...</p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
          <RiErrorWarningLine size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">Oops!</h2>
          <p className="text-white/40 max-w-xs mx-auto">{error || 'Paciente não encontrado.'}</p>
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

  const formattedDate = patient.birthdate ? new Date(patient.birthdate).toLocaleDateString('pt-BR') : 'Não informada';
  const createdAtDate = new Date(patient.created_at).toLocaleDateString('pt-BR');

  return (
    <div className="min-h-screen bg-secondary text-white flex flex-col pb-12">
      {/* Header with Back Button */}
      <header className="h-20 flex items-center px-6 sticky top-0 bg-secondary/80 backdrop-blur-xl z-50 border-b border-white/5">
        <div className="max-w-4xl w-full mx-auto flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all active:scale-95"
          >
            <RiArrowLeftLine size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-black tracking-tighter uppercase">Detalhes do Paciente</h1>
          </div>

          {canEdit && (
            <div className="flex items-center gap-2">
              {/* Actions moved to the bottom of the page */}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl w-full mx-auto px-6 py-8 space-y-8 animate-fade-in-up">
        {/* Profile Card */}
        <section className="relative overflow-hidden bg-tertiary border border-white/5 rounded-[3rem] p-8 shadow-2xl">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

          <div className="relative flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-secondary border-2 border-white/10 overflow-hidden flex items-center justify-center shadow-2xl group-hover:border-primary/30 transition-colors">
                {patient.image_url ? (
                  <Image
                    src={getImageUrl(patient.image_url) || ''}
                    alt={patient.full_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <RiUser6Line size={64} className="text-white/10" />
                )}
              </div>
            </div>

            {/* Main Info */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="space-y-1">
                <h2 className="text-4xl font-black tracking-tighter leading-none">{patient.full_name}</h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                  <span className="px-3 py-1 bg-primary text-secondary-dark text-[10px] font-black rounded-full uppercase tracking-widest">
                    {patient.identifier}
                  </span>
                  <span className="px-3 py-1 bg-white/5 text-white/40 text-[10px] font-black rounded-full uppercase tracking-widest border border-white/5">
                    ID: {patient.id.split('-')[0]}...
                  </span>
                </div>
              </div>

              {patient.description && (
                <p className="text-white/50 text-sm leading-relaxed max-w-md italic">
                  "{patient.description}"
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Link Credentials (Evidence) */}
        {(isCreator || user?.role === 'admin') && (
          <section className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-8 space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-primary/10 -rotate-12 translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
              <RiShieldCheckLine size={120} />
            </div>

            <div className="relative space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <RiHashtag size={20} />
                <h3 className="text-sm font-black uppercase tracking-widest">Credenciais de Vínculo</h3>
              </div>

              <p className="text-white/40 text-xs max-w-md">
                Utilize as credenciais abaixo para que um profissional possa se vincular a este paciente.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-secondary/50 border border-white/5 rounded-2xl p-4 flex items-center justify-between group/item hover:border-primary/30 transition-all">
                  <div>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Identificador</p>
                    <p className="font-mono font-bold text-lg text-white">{patient.identifier}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(patient.identifier);
                      // Opcional: toast ou feedback visual
                    }}
                    className="p-3 bg-white/5 hover:bg-primary text-white/40 hover:text-secondary-dark rounded-xl transition-all"
                    title="Copiar Identificador"
                  >
                    <RiFileCopyLine size={20} />
                  </button>
                </div>

                {isCreator && (
                  <div className="bg-secondary/50 border border-white/5 rounded-2xl p-4 flex items-center justify-between group/item hover:border-primary/30 transition-all">
                    <div>
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Código de Vínculo</p>
                      <p className="font-mono font-bold text-lg text-primary tracking-[0.2em]">{patient.code || '---'}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (patient.code) navigator.clipboard.writeText(patient.code);
                      }}
                      className="p-3 bg-white/5 hover:bg-primary text-white/40 hover:text-secondary-dark rounded-xl transition-all"
                      title="Copiar Código"
                    >
                      <RiFileCopyLine size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Quick Actions Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Ações do Paciente</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => router.push(`/patients/${id}/history`)}
              className="p-6 bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/5 rounded-[2.5rem] flex items-center justify-between group transition-all duration-300 shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white/40 group-hover:bg-primary group-hover:text-secondary-dark transition-all duration-300">
                  <RiHistoryLine size={24} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest group-hover:text-primary/50 transition-colors">Consultar</p>
                  <h4 className="text-lg font-black text-white uppercase tracking-tighter">Histórico de Testes</h4>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/10 group-hover:bg-primary/20 group-hover:text-primary transition-all duration-300">
                <RiArrowRightSLine size={20} />
              </div>
            </button>

            {user?.role === 'professional' && (
              <button 
                onClick={() => router.push(`/evaluations/select/${patient.id}`)}
                className="p-6 bg-primary text-secondary-dark rounded-[2.5rem] flex items-center justify-between group hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl shadow-primary/10"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary-dark/10 rounded-2xl flex items-center justify-center text-secondary-dark/60 group-hover:text-secondary-dark transition-colors">
                    <RiUserAddLine size={24} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black opacity-30 uppercase tracking-widest">Ação Rápida</p>
                    <h4 className="text-lg font-black uppercase tracking-tighter">Nova Avaliação</h4>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-secondary-dark/5 flex items-center justify-center text-secondary-dark/20 group-hover:text-secondary-dark transition-all duration-300">
                  <RiArrowRightSLine size={20} />
                </div>
              </button>
            )}
          </div>
        </section>

        {/* Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="bg-tertiary border border-white/5 rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center gap-3 text-primary">
              <RiInformationLine size={20} />
              <h3 className="text-sm font-black uppercase tracking-widest">Informações Gerais</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                  <RiCalendarLine size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Data de Nascimento</p>
                  <p className="font-bold">{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                  <RiGenderlessLine size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Gênero</p>
                  <p className="font-bold capitalize">{patient.gender === 'male' ? 'Masculino' : (patient.gender === 'female' ? 'Feminino' : 'Não informado')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Info */}
          <div className="bg-tertiary border border-white/5 rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center gap-3 text-primary">
              <RiHashtag size={20} />
              <h3 className="text-sm font-black uppercase tracking-widest">Dados do Sistema</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                  <RiUser6Line size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Identificador</p>
                  <p className="font-bold truncate">{patient.identifier}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                  <RiTimeLine size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Cadastrado em</p>
                  <p className="font-bold">{createdAtDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Multidisciplinary Team */}
        {(professionals.length > 0 || loadingExtras) && (
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3 text-primary">
                <RiTeamLine size={24} />
                <h3 className="text-lg font-black uppercase tracking-tighter">Equipe Multidisciplinar</h3>
              </div>
              <span className="px-3 py-1 bg-white/5 text-white/40 text-[10px] font-black rounded-full uppercase tracking-widest border border-white/5">
                {professionals.length} Membros
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loadingExtras ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="bg-tertiary border border-white/5 rounded-[2rem] p-6 animate-pulse flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/5" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/5 rounded w-2/3" />
                      <div className="h-3 bg-white/5 rounded w-1/2" />
                    </div>
                  </div>
                ))
              ) : (
                professionals.map((prof) => (
                  <div key={prof.id} className="group bg-tertiary hover:bg-tertiary/80 border border-white/5 hover:border-primary/20 rounded-[2rem] p-6 transition-all duration-300 flex items-center gap-5">
                    <div className="relative w-16 h-16 rounded-2xl bg-secondary border border-white/10 overflow-hidden flex items-center justify-center group-hover:border-primary/30 transition-colors shrink-0">
                      {prof.image_url ? (
                        <Image
                          src={getImageUrl(prof.image_url) || ''}
                          alt={prof.full_name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <RiUser6Line size={32} className="text-white/10" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">{prof.specialty}</p>
                      <h4 className="font-bold text-white truncate">{prof.full_name}</h4>
                      <div className="flex items-center gap-2 text-white/30 text-[11px] mt-1">
                        <RiMailLine size={12} />
                        <span className="truncate">{prof.email}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* Responsibles */}
        {(responsibles.length > 0 || loadingExtras) && (
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3 text-primary">
                <RiUserHeartLine size={24} />
                <h3 className="text-lg font-black uppercase tracking-tighter">Responsáveis</h3>
              </div>
              <span className="px-3 py-1 bg-white/5 text-white/40 text-[10px] font-black rounded-full uppercase tracking-widest border border-white/5">
                {responsibles.length} Vinculados
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loadingExtras ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="bg-tertiary border border-white/5 rounded-[2rem] p-6 animate-pulse flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/5" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/5 rounded w-2/3" />
                      <div className="h-3 bg-white/5 rounded w-1/2" />
                    </div>
                  </div>
                ))
              ) : (
                responsibles.map((resp) => (
                  <div key={resp.id} className="group bg-tertiary hover:bg-tertiary/80 border border-white/5 hover:border-primary/20 rounded-[2rem] p-6 transition-all duration-300 flex items-center gap-5">
                    <div className="relative w-16 h-16 rounded-2xl bg-secondary border border-white/10 overflow-hidden flex items-center justify-center group-hover:border-primary/30 transition-colors shrink-0">
                      {resp.image_url ? (
                        <Image
                          src={getImageUrl(resp.image_url) || ''}
                          alt={resp.full_name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <RiUser6Line size={32} className="text-white/10" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-white/20 uppercase tracking-widest mb-1">@{resp.identifier}</p>
                      <h4 className="font-bold text-white truncate">{resp.full_name}</h4>
                      <div className="flex items-center gap-2 text-white/30 text-[11px] mt-1">
                        <RiMailLine size={12} />
                        <span className="truncate">{resp.email}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}


        {/* Management Actions Section */}
        <section className="pt-12 pb-8 border-t border-white/5 space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Gerenciamento e Segurança</h3>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {canEdit && (
              <>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex-1 p-6 bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/5 rounded-[2rem] flex items-center gap-4 group transition-all"
                >
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white/40 group-hover:bg-primary group-hover:text-secondary-dark transition-all">
                    <RiEditLine size={24} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest group-hover:text-primary/50 transition-colors">Modificar Dados</p>
                    <h4 className="text-lg font-black text-white uppercase tracking-tighter">Editar Perfil</h4>
                  </div>
                </button>

                <button
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="flex-1 p-6 bg-white/5 border border-white/10 hover:border-red-500/50 hover:bg-red-500/5 rounded-[2rem] flex items-center gap-4 group transition-all"
                >
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white/40 group-hover:bg-red-500 group-hover:text-white transition-all">
                    <RiDeleteBinLine size={24} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest group-hover:text-red-500/50 transition-colors">Zona de Perigo</p>
                    <h4 className="text-lg font-black text-white uppercase tracking-tighter">Excluir Paciente</h4>
                  </div>
                </button>
              </>
            )}

            {!isCreator && relationId && (
              <button
                onClick={() => setIsUnlinkConfirmOpen(true)}
                className="flex-1 p-6 bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/5 rounded-[2rem] flex items-center gap-4 group transition-all"
              >
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white/40 group-hover:bg-orange-500 group-hover:text-white transition-all">
                  <RiUserUnfollowLine size={24} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest group-hover:text-orange-500/50 transition-colors">Encerrar Acesso</p>
                  <h4 className="text-lg font-black text-white uppercase tracking-tighter">Desvincular-se</h4>
                </div>
              </button>
            )}
          </div>
        </section>
      </main>

      {/* Edit Patient Modal */}
      {patient && (
        <EditPatientModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          patient={patient}
          onSuccess={(updated) => setPatient(updated)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-secondary-dark/80 backdrop-blur-md" onClick={() => !deleting && setIsDeleteConfirmOpen(false)} />
          <div className="relative w-full max-w-sm bg-secondary border border-white/5 rounded-[2.5rem] p-8 shadow-2xl space-y-6 animate-fade-in-up">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto">
              <RiDeleteBinLine size={32} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black uppercase tracking-tighter">Excluir Paciente</h3>
              <p className="text-white/40 text-sm">
                Tem certeza que deseja excluir <strong>{patient?.full_name}</strong>? Esta ação não pode ser desfeita e removerá todos os dados vinculados.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full py-4 bg-red-500 text-white font-black rounded-2xl hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? <RiLoader4Line className="animate-spin" size={20} /> : <RiDeleteBinLine size={20} />}
                {deleting ? 'EXCLUINDO...' : 'SIM, EXCLUIR'}
              </button>
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                disabled={deleting}
                className="w-full py-4 bg-white/5 text-white/50 font-black rounded-2xl hover:bg-white/10 transition-all disabled:opacity-50"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unlink Confirmation Modal */}
      {isUnlinkConfirmOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-secondary-dark/80 backdrop-blur-md" onClick={() => !unlinking && setIsUnlinkConfirmOpen(false)} />
          <div className="relative w-full max-w-sm bg-secondary border border-white/5 rounded-[2.5rem] p-8 shadow-2xl space-y-6 animate-fade-in-up">
            <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 mx-auto">
              <RiUserUnfollowLine size={32} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black uppercase tracking-tighter">Desvincular Paciente</h3>
              <p className="text-white/40 text-sm">
                Tem certeza que deseja se desvincular de <strong>{patient?.full_name}</strong>? Você deixará de ter acesso aos dados deste paciente.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleUnlink}
                disabled={unlinking}
                className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {unlinking ? <RiLoader4Line className="animate-spin" size={20} /> : <RiUserUnfollowLine size={20} />}
                {unlinking ? 'DESVINCULANDO...' : 'SIM, DESVINCULAR'}
              </button>
              <button
                onClick={() => setIsUnlinkConfirmOpen(false)}
                disabled={unlinking}
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

export default function PatientDetail() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-6 space-y-4">
        <RiLoader4Line className="text-primary animate-spin" size={40} />
        <p className="text-white/40 font-medium animate-pulse">Carregando detalhes...</p>
      </div>
    }>
      <PatientDetailContent />
    </Suspense>
  );
}
