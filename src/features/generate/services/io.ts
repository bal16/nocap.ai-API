import axios from 'axios';
import { aiService, http } from '../../../config/fetcher';
import { env } from '../../../shared/env';
import { KnownErrors, serviceLogger } from './utils';
import type { AnalyzeResponse } from '../models/ai-service.model';

/**
 * I/O helpers
 */
export const getImageAsBase64 = async (imageUrl: string): Promise<string> => {
  try {
    const response = await http.get<ArrayBuffer>(imageUrl, { responseType: 'arraybuffer' });
    return Buffer.from(response.data).toString('base64');
  } catch (error) {
    serviceLogger.error({ imageUrl, error }, 'Failed to download image');
    throw new Error(KnownErrors.IMAGE_INACCESSIBLE);
  }
};

export const getDesignAnalysis = async (imageUrl: string) => {
  // Optional: allow skipping if env not configured
  if (!env.ANALYSIS_API_URL) {
    serviceLogger.warn('SKIP ANALYSIS: ANALYSIS_API_URL not set in env');
    return null;
  }

  try {
    const response = await aiService.post<AnalyzeResponse>('/analyze', { url: imageUrl });
    serviceLogger.info(
      { status: response.status, data: response.data },
      'Design analysis responded'
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      serviceLogger.error(
        { status: error.response?.status, data: error.response?.data },
        'Design Analysis API error'
      );
    } else {
      serviceLogger.error({ err: error }, 'Design Analysis connection error');
    }
    throw new Error(KnownErrors.ANALYSIS_UNAVAILABLE);
  }
};
