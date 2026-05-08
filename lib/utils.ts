import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(url: string | null) {
  if (!url) return null;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://acompanhar-production.up.railway.app';

  if (url.startsWith('/static/')) {
    return url.replace('/static/', '/');
  }
  if (url.startsWith('/') || url.startsWith('http')) return url;
  return `${baseUrl}${url}`;
}
