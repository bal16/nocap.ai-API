import axios, { type AxiosInstance } from 'axios';
import { env } from '../shared/env';

/**
 * Axios instances
 */
export const http: AxiosInstance = axios.create({
  timeout: 10_000,
});

export const aiService: AxiosInstance = axios.create({
  baseURL: env.ANALYSIS_API_URL,
  timeout: 5_000,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': env.ANALYSIS_API_KEY,
  },
});

export const chatAI: AxiosInstance = axios.create({
  baseURL: env.GEMINI_API_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
  // Gemini API typically accepts key as query param (?key=)
  params: { key: env.GEMINI_API_KEY },
});
