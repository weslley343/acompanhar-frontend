import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(url: string | null) {
  if (!url) return null;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://acompanhar-production.up.railway.app';

  // Se a URL contém o padrão de avatares estáticos, forçamos o carregamento local
  if (url.includes('static/avatars/')) {
    const parts = url.split('static/avatars/');
    return `/avatars/${parts[parts.length - 1]}`;
  }

  // Fallback para outros arquivos estáticos genéricos
  if (url.startsWith('/static/') || url.startsWith('static/')) {
    return url.replace('/static/', '/').replace('static/', '/');
  }

  if (url.startsWith('/') || url.startsWith('http')) return url;
  
  // Garantir que haja uma barra entre baseUrl e url
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const normalizedUrl = url.startsWith('/') ? url.substring(1) : url;
  
  return `${normalizedBaseUrl}${normalizedUrl}`;
}
