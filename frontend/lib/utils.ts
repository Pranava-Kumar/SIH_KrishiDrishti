import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Formats a timestamp string (ISO 8601) into a more readable local format.
 * @param timestamp The ISO string timestamp.
 * @returns A formatted date string.
 */
export function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString();
}

/**
 * Truncates a string to a specified length and adds an ellipsis if truncated.
 * @param str The string to truncate.
 * @param maxLength The maximum length.
 * @returns The truncated string.
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

/**
 * Combines multiple class names into a single class string.
 * Uses clsx for conditional class names and tailwind-merge for deduplication.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}