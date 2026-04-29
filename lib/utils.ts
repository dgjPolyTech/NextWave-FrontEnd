import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseISO(isoString: string) {
  if (!isoString) return null
  let normalized = isoString.replace(' ', 'T')
  if (!normalized.includes('Z') && !normalized.includes('+') && normalized.includes('T')) {
    normalized += 'Z'
  }
  const date = new Date(normalized)
  return isNaN(date.getTime()) ? null : date
}
