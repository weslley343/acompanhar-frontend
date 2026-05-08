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
  RiUserAddLine
} from 'react-icons/ri';
import { getImageUrl } from '@/lib/utils';
import Image from 'next/image';

export default function PatientDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const data = await clientService.getClientById(id as string);
        setPatient(data);
      } catch (err: any) {
        const apiError = err.response?.data?.error || 'Não foi possível carregar os detalhes do paciente.';
        setError(apiError === 'Access denied. You are not linked to this client.' 
          ? 'Acesso negado. Você não tem permissão para ver este paciente.' 
          : (apiError === 'Client not found' ? 'Paciente não encontrado.' : apiError));
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPatient();
  }, [id]);

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

  const formattedDate = new Date(patient.birthdate).toLocaleDateString('pt-BR');
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
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase">Detalhes do Paciente</h1>
          </div>
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
                  <RiHashtag size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Código de Vínculo</p>
                  <p className="font-mono font-bold text-primary tracking-widest">{patient.code || '---'}</p>
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

        {/* Action Button (Placeholder for future features like Evaluations) */}
        <div className="pt-4">
          <button className="w-full py-6 bg-primary text-secondary-dark font-black rounded-[2rem] shadow-xl shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
            <RiUserAddLine size={24} />
            NOVA AVALIAÇÃO
          </button>
        </div>
      </main>
    </div>
  );
}
