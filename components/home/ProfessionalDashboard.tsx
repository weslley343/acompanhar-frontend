'use client';

import { useEffect, useState } from 'react';
import {
  RiGroupLine,
  RiFileTextLine,
  RiStackLine,
  RiErrorWarningLine,
} from 'react-icons/ri';
import { useAuthStore } from '@/lib/stores/store';
import { professionalApi, DashboardData } from '@/lib/api/professionals';

/* ── Helpers ─────────────────────────────────────────────────────── */
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function firstName(fullName: string): string {
  return fullName.split(' ')[0];
}

/* ── Skeleton card ───────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div
      className="rounded-3xl p-6 animate-pulse"
      style={{
        background: 'color-mix(in srgb, var(--tertiary) 80%, transparent)',
        border: '1px solid color-mix(in srgb, var(--adaptive-white) 5%, transparent)',
      }}
    >
      <div className="w-10 h-10 rounded-2xl mb-4" style={{ background: 'color-mix(in srgb, var(--adaptive-white) 8%, transparent)' }} />
      <div className="h-8 w-16 rounded-lg mb-2"   style={{ background: 'color-mix(in srgb, var(--adaptive-white) 8%, transparent)' }} />
      <div className="h-3 w-28 rounded"            style={{ background: 'color-mix(in srgb, var(--adaptive-white) 5%, transparent)' }} />
    </div>
  );
}

/* ── Metric card ─────────────────────────────────────────────────── */
interface MetricCardProps {
  icon: React.ReactNode;
  value: number | null;
  label: string;
  accent?: boolean;
  delay?: string;
}

function MetricCard({ icon, value, label, accent = false, delay = '0ms' }: MetricCardProps) {
  return (
    <div
      className="animate-fade-in-up group relative rounded-3xl p-6 flex flex-col gap-3 transition-all duration-300 overflow-hidden"
      style={{
        background: accent
          ? 'color-mix(in srgb, var(--primary) 12%, transparent)'
          : 'color-mix(in srgb, var(--tertiary) 80%, transparent)',
        border: accent
          ? '1px solid color-mix(in srgb, var(--primary) 30%, transparent)'
          : '1px solid color-mix(in srgb, var(--adaptive-white) 5%, transparent)',
        animationDelay: delay,
      }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
        style={{ background: accent ? 'color-mix(in srgb, var(--primary) 6%, transparent)' : 'color-mix(in srgb, var(--adaptive-white) 2%, transparent)' }}
      />

      {/* Icon */}
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center relative z-10 transition-transform duration-300 group-hover:scale-110"
        style={{
          background: accent
            ? 'color-mix(in srgb, var(--primary) 20%, transparent)'
            : 'color-mix(in srgb, var(--adaptive-white) 7%, transparent)',
          color: accent ? 'var(--primary)' : 'color-mix(in srgb, var(--adaptive-white) 60%, transparent)',
        }}
      >
        {icon}
      </div>

      {/* Value + label */}
      <div className="relative z-10">
        <p
          className="text-4xl font-black tracking-tight leading-none"
          style={{ color: accent ? 'var(--primary)' : 'var(--foreground)' }}
        >
          {value ?? '—'}
        </p>
        <p
          className="text-xs font-semibold uppercase tracking-widest mt-1"
          style={{ color: 'color-mix(in srgb, var(--adaptive-white) 45%, transparent)' }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────── */
export default function ProfessionalDashboard() {
  const { user } = useAuthStore();
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    professionalApi.getDashboard()
      .then(setData)
      .catch(() => setError('Não foi possível carregar o dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  const greeting = getGreeting();
  const name     = firstName(user?.full_name ?? 'Profissional');
  const dateStr  = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const dateFmt  = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-10 animate-fade-in-up">

        {/* ── Greeting ────────────────────────────────────────────── */}
        <div className="space-y-1 text-center">
          <p
            className="text-sm font-semibold uppercase tracking-[0.2em]"
            style={{ color: 'var(--primary)' }}
          >
            {dateFmt}
          </p>
          <h1
            className="text-4xl font-black tracking-tight"
            style={{ color: 'var(--foreground)' }}
          >
            {greeting},{' '}
            <span style={{ color: 'var(--primary)' }}>{name}</span> 👋
          </h1>
          <p
            className="text-sm"
            style={{ color: 'color-mix(in srgb, var(--adaptive-white) 45%, transparent)' }}
          >
            Aqui está um resumo da sua atividade na plataforma.
          </p>
        </div>

        {/* ── Metric cards ────────────────────────────────────────── */}
        {error ? (
          <div
            className="flex items-center gap-4 p-5 rounded-3xl"
            style={{
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.15)',
              color: 'rgba(239,68,68,0.8)',
            }}
          >
            <RiErrorWarningLine size={22} className="shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                <MetricCard
                  icon={<RiGroupLine size={22} />}
                  value={data?.total_linked_clients ?? null}
                  label="Pacientes vinculados"
                  accent
                  delay="0ms"
                />
                <MetricCard
                  icon={<RiFileTextLine size={22} />}
                  value={data?.total_evaluations ?? null}
                  label="Avaliações realizadas"
                  delay="80ms"
                />
                <MetricCard
                  icon={<RiStackLine size={22} />}
                  value={data?.total_scales ?? null}
                  label="Escalas disponíveis"
                  delay="160ms"
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
