'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { EvaluationResponse } from '@/types/evaluation';
import { RiInformationLine, RiLineChartLine } from 'react-icons/ri';

interface ProgressChartProps {
  evaluations: EvaluationResponse[];
  scaleName: string;
}

export default function ProgressChart({ evaluations, scaleName }: ProgressChartProps) {
  // Se "Todas" as escalas estiverem selecionadas, não mostramos o gráfico (conforme solicitado)
  if (!scaleName || scaleName === 'Todas') {
    return null;
  }

  // Se não houver testes para a escala selecionada
  if (evaluations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 bg-white/5 rounded-[2.5rem] border border-white/5 text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/20">
          <RiInformationLine size={32} />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">Sem dados para esta escala</h3>
          <p className="text-white/40 text-sm max-w-xs">
            Ainda não foram realizadas avaliações do tipo <span className="text-primary font-bold">{scaleName}</span> para este paciente.
          </p>
        </div>
      </div>
    );
  }

  // Processar dados para o gráfico
  // Precisamos inverter a ordem (do mais antigo para o mais novo) para o eixo X do tempo
  const chartData = useMemo(() => {
    // Pegar apenas os últimos 10 (ou menos) testes conforme solicitado
    const latestEvaluations = evaluations.slice(0, 10);
    
    return [...latestEvaluations]
      .reverse()
      .map(ev => {
        const date = new Date(ev.created_at).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit'
        });
        
        return {
          name: date,
          timestamp: new Date(ev.created_at).getTime(),
          total: ev.metadata?.total_score || 0,
          ...ev.metadata?.scores
        };
      });
  }, [evaluations]);

  // Identificar todas as áreas (domínios) únicas presentes nas avaliações
  const areas = useMemo(() => {
    const allAreas = new Set<string>();
    evaluations.forEach(ev => {
      if (ev.metadata?.scores) {
        Object.keys(ev.metadata.scores).forEach(area => allAreas.add(area));
      }
    });
    return Array.from(allAreas);
  }, [evaluations]);

  // Cores para as linhas (paleta premium)
  const colors = [
    '#00F2FF', // Primary Cyan
    '#7000FF', // Purple
    '#FF00D6', // Pink
    '#FF9900', // Orange
    '#00FF94', // Green
    '#FF3D00', // Red
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
          <RiLineChartLine size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Evolução por Área</h3>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest leading-none mt-1">
            Últimos {Math.min(evaluations.length, 10)} testes • {scaleName}
          </p>
        </div>
      </div>

      <div className="w-full bg-tertiary/40 border border-white/5 rounded-[2.5rem] relative group">
        {/* Efeito de vidro no fundo */}
        <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px]" />
        </div>
        
        <div className="p-6">
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }}
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#161622', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                padding: '16px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
              }}
              itemStyle={{ fontSize: '12px', fontWeight: 700, padding: '2px 0' }}
              labelStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginBottom: '8px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}
            />
            <Legend 
              verticalAlign="top" 
              height={50}
              content={({ payload }) => (
                <div className="flex flex-wrap gap-4 justify-center mb-8">
                  {payload?.map((entry: any, index: number) => (
                    <div key={`item-${index}`} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">{entry.value}</span>
                    </div>
                  ))}
                </div>
              )}
            />
            
            {areas.map((area, index) => (
              <Line
                key={area}
                type="monotone"
                dataKey={area}
                stroke={colors[index % colors.length]}
                strokeWidth={3}
                dot={{ r: 4, fill: colors[index % colors.length], strokeWidth: 2, stroke: '#161622' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1500}
                name={area}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
