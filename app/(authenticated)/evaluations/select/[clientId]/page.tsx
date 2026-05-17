'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { scaleService } from '@/lib/api/scales';
import { clientService } from '@/lib/api/clients';
import { Scale } from '@/types/scale';
import { Client } from '@/types/client';
import { 
  RiArrowLeftLine, 
  RiBarChartFill, 
  RiInformationLine, 
  RiLoader4Line, 
  RiErrorWarningLine,
  RiArrowRightSLine
} from 'react-icons/ri';
import { cn, getImageUrl } from '@/lib/utils';
import Image from 'next/image';

export default function ScaleSelection() {
  const { clientId } = useParams();
  const router = useRouter();
  const [scales, setScales] = useState<Scale[]>([]);
  const [patient, setPatient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scalesData, patientData] = await Promise.all([
          scaleService.getScales(),
          clientService.getClientById(clientId as string)
        ]);
        setScales(scalesData);
        setPatient(patientData);
      } catch (err: any) {
        setError('Não foi possível carregar as informações. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    if (clientId) fetchData();
  }, [clientId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-6 space-y-4">
        <RiLoader4Line className="text-primary animate-spin" size={40} />
        <p className="text-white/40 font-medium animate-pulse">Preparando escalas...</p>
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

  return (
    <div className="min-h-screen bg-secondary text-white flex flex-col pb-12">
      <header className="h-20 flex items-center px-6 sticky top-0 bg-secondary/80 backdrop-blur-xl z-50 border-b border-white/5">
        <div className="max-w-4xl w-full mx-auto flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all active:scale-95"
          >
            <RiArrowLeftLine size={24} />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase leading-none">Nova Avaliação</h1>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Para: {patient.full_name}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl w-full mx-auto px-6 py-10 space-y-10 animate-fade-in-up">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mb-6 shadow-2xl shadow-primary/10">
            <RiBarChartFill size={32} />
          </div>
          <h2 className="text-4xl font-black tracking-tighter leading-none">Escolha a Escala</h2>
          <p className="text-white/40 text-sm max-w-md">
            Selecione uma das escalas clínicas abaixo para iniciar o processo de avaliação do paciente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scales.map((scale) => (
            <button
              key={scale.id}
              onClick={() => router.push(`/evaluations/create/${clientId}/${scale.id}`)}
              className="relative group overflow-hidden bg-tertiary border border-white/5 rounded-[3rem] p-8 text-left transition-all hover:scale-[1.02] hover:border-primary/30 active:scale-[0.98] shadow-2xl shadow-black/20"
            >
              {/* Background Glow */}
              <div 
                className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-[60px] -translate-y-1/2 translate-x-1/2 rounded-full transition-all group-hover:opacity-20 group-hover:scale-150"
                style={{ backgroundColor: scale.color || '#666' }}
              />

              <div className="relative flex flex-col h-full justify-between gap-6">
                <div className="flex items-start justify-between">
                  <div 
                    className="w-16 h-16 rounded-3xl flex items-center justify-center text-secondary-dark font-black text-2xl shadow-xl overflow-hidden relative"
                    style={{ backgroundColor: scale.color || '#666' }}
                  >
                    {scale.image_url ? (
                      <Image 
                        src={getImageUrl(scale.image_url) || ''} 
                        alt={scale.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      scale.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl text-white/20 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                    <RiArrowRightSLine size={24} />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tighter">{scale.name}</h3>
                  <p className="text-white/40 text-sm leading-relaxed line-clamp-2">
                    {scale.description}
                  </p>
                </div>

              </div>
            </button>
          ))}
        </div>

        {scales.length === 0 && (
          <div className="py-20 text-center space-y-6 bg-tertiary/20 rounded-[3rem] border border-white/5">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/10 mx-auto">
              <RiInformationLine size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Nenhuma escala disponível</h3>
              <p className="text-white/40 max-w-xs mx-auto text-sm">
                Não há escalas cadastradas no momento. Entre em contato com o administrador.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
