'use client';

import React, { useMemo, useState, useCallback } from 'react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { EvaluationResponse } from '@/types/evaluation';
import { RiInformationLine, RiLineChartLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';

interface ProgressChartProps {
  evaluations: EvaluationResponse[];
  scaleName: string;
}

export default function ProgressChart({ evaluations, scaleName }: ProgressChartProps) {
  const [hiddenAreas, setHiddenAreas] = useState<Set<string>>(new Set());

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
    '#FFD700', // Gold
    '#00BFFF', // Deep Sky Blue
  ];

  const toggleArea = useCallback((area: string) => {
    setHiddenAreas(prev => {
      const next = new Set(prev);
      if (next.has(area)) {
        next.delete(area);
      } else {
        next.add(area);
      }
      return next;
    });
  }, []);

  const visibleAreas = areas.filter(a => !hiddenAreas.has(a));

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
        
        <div className="p-4 sm:p-6">
          {/* Custom interactive legend */}
          <div className="flex flex-wrap gap-2 justify-center mb-4 px-2">

            {areas.map((area, index) => {
              const isHidden = hiddenAreas.has(area);
              const color = colors[index % colors.length];
              return (
                <button
                  type="button"
                  key={area}
                  onClick={() => toggleArea(area)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all border text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: isHidden ? 'rgba(128, 128, 128, 0.1)' : `${color}10`,
                    borderColor: isHidden ? 'rgba(128, 128, 128, 0.2)' : `${color}30`,
                    color: isHidden ? '#888888' : color,
                    opacity: isHidden ? 0.6 : 1,
                  }}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: isHidden ? '#888888' : color }}
                  />
                  <span>{area}</span>
                  {isHidden ? <RiEyeOffLine size={10} /> : <RiEyeLine size={10} />}
                </button>
              );
            })}
          </div>

          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
              <defs>
                {areas.map((area, index) => {
                  const color = colors[index % colors.length];
                  return (
                    <linearGradient key={`grad-${area}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.15} />
                      <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  );
                })}
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }}
                width={40}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#161622', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '12px 16px',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                  fontSize: '11px',
                }}
                itemStyle={{ fontSize: '11px', fontWeight: 700, padding: '2px 0' }}
                labelStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginBottom: '6px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}
              />

              {/* Area fills (behind lines) for all domains */}
              {areas.map((area, index) => {
                const isHidden = hiddenAreas.has(area);
                return (
                  <Area
                    key={`area-${area}`}
                    type="monotone"
                    dataKey={area}
                    stroke="none"
                    fill={`url(#gradient-${index})`}
                    fillOpacity={isHidden ? 0 : 1}
                    animationDuration={1200}
                    name={`_area_${area}`}
                    legendType="none"
                    tooltipType="none"
                    hide={isHidden}
                  />
                );
              })}

              {/* Domain lines */}
              {areas.map((area, index) => {
                const isHidden = hiddenAreas.has(area);
                const color = colors[index % colors.length];
                return (
                  <Line
                    key={`line-${area}`}
                    type="monotone"
                    dataKey={area}
                    stroke={color}
                    strokeWidth={2}
                    dot={{ r: 3, fill: color, strokeWidth: 2, stroke: '#161622' }}
                    activeDot={{ r: 5, strokeWidth: 0, fill: color }}
                    animationDuration={1200}
                    name={area}
                    hide={isHidden}
                  />
                );
              })}


            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
