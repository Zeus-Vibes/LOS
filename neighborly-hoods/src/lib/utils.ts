import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFullImageUrl(path: string | null) {
  if (!path) return null;
  if (path.startsWith('data:') || path.startsWith('http')) return path;
  // Assume it's a relative path from the backend
  const baseUrl = 'http://localhost:8000';
  return path.startsWith('/') ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
}
