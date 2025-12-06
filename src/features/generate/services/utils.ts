import { logger } from '../../../plugins/logger';

/**
 * Utilities
 */
export const serviceLogger = logger.child({ module: 'content-generator-service' });

export const KnownErrors = {
  IMAGE_INACCESSIBLE: 'Image URL not accessible',
  ANALYSIS_UNAVAILABLE: 'Layanan Analisis Desain sedang tidak tersedia. Coba lagi nanti.',
  AI_EMPTY_RESPONSE: 'AI returns empty response',
} as const;

export const cleanFencedJson = (text: string) => text.replace(/```json|```/g, '').trim();

export const safeJsonParse = <T>(text: string): T => {
  try {
    return JSON.parse(text) as T;
  } catch {
    serviceLogger.error({ textSnippet: text.slice(0, 200) }, 'Failed to parse AI JSON');
    throw new Error('Failed to parse AI response');
  }
};

export const sliceIfNeeded = <T>(arr: T[] | undefined, max: number) => (arr ?? []).slice(0, max);
