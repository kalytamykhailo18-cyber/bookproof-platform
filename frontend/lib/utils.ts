import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Map language codes to BCP 47 locale codes for Intl formatting
 */
const localeMap: Record<string, string> = {
  en: 'en-US',
  pt: 'pt-BR',
  es: 'es-ES',
};

/**
 * Get the BCP 47 locale code for a given language
 */
function getLocale(locale?: string): string {
  if (!locale) return 'en-US';
  return localeMap[locale] || localeMap['en'];
}

/**
 * Format a date according to the specified locale
 * @param date - Date string or Date object
 * @param locale - Language code (en, pt, es)
 * @param options - Optional Intl.DateTimeFormatOptions
 */
export function formatDate(
  date: string | Date,
  locale?: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = new Date(date);
  const localeCode = getLocale(locale);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  };

  return dateObj.toLocaleDateString(localeCode, options || defaultOptions);
}

/**
 * Format a date in short format (DD/MM/YYYY or MM/DD/YYYY depending on locale)
 */
export function formatDateShort(date: string | Date, locale?: string): string {
  return formatDate(date, locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format a date with time
 */
export function formatDateTime(date: string | Date, locale?: string): string {
  return formatDate(date, locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format currency according to the specified locale
 * @param amount - Numeric amount
 * @param currency - Currency code (USD, EUR, BRL)
 * @param locale - Language code (en, pt, es)
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale?: string
): string {
  const localeCode = getLocale(locale);

  return new Intl.NumberFormat(localeCode, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format a number according to the specified locale
 * @param value - Numeric value
 * @param locale - Language code (en, pt, es)
 * @param options - Optional Intl.NumberFormatOptions
 */
export function formatNumber(
  value: number,
  locale?: string,
  options?: Intl.NumberFormatOptions
): string {
  const localeCode = getLocale(locale);
  return new Intl.NumberFormat(localeCode, options).format(value);
}

/**
 * Format a percentage according to the specified locale
 * @param value - Decimal value (0.15 = 15%)
 * @param locale - Language code (en, pt, es)
 */
export function formatPercent(value: number, locale?: string): string {
  const localeCode = getLocale(locale);
  return new Intl.NumberFormat(localeCode, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
}
