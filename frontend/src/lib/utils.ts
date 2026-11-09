import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merges conditional class names with Tailwind conflict resolution
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

// Formats file sizes in bytes to human-readable units
export function formatBytes(bytes: number, decimals = 1): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Formats ISO date string to a localized timestamp
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}