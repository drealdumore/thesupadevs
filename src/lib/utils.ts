import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(name: string): string {
  return encodeURIComponent(name.replace(/\//g, "-").replace(/\s+/g, "-"));
}

/** Reverse of slugify for use in UI display only */
export function unslugify(slug: string): string {
  return decodeURIComponent(slug).replace(/-/g, " ").trim();
}
