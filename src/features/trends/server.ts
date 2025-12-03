import { Elysia, type Context } from 'elysia';
import { getInterestOverTime, getRelatedQueries, getDailyTrends } from './trends.service';
import * as z from 'zod';
import { loggerPlugins } from '../../plugins/logger';

type ErrorHandlerContext = {
  set: Context['set'];
  log: { error: (message: string) => void };
};

const handleErrorResponse = (
  err: unknown,
  { set, log }: ErrorHandlerContext,
  mode: 'daily' | 'keyword',
  keyword?: string
) => {
  const errorMessage =
    err instanceof Error ? err.message : 'Gagal mengambil data dari Google Trends.';

  log.error(`❌ Trend Route Error [${mode}]: ${errorMessage}`);

  // Set status HTTP berdasarkan Rate Limit
  if (errorMessage.includes('Terlalu banyak permintaan')) {
    set.status = 429;
  } else {
    set.status = 500;
  }

  // STANDARDISASI OUTPUT ERROR
  if (mode === 'keyword') {
    return {
      success: false,
      type: 'keyword',
      message: errorMessage,
      keyword: keyword || null,
      timeline: null, // <-- SET KE NULL
      related: null, // <-- SET KE NULL
    };
  } else {
    // Mode Daily Trends
    return {
      success: false,
      type: 'daily',
      message: errorMessage,
      data: null, // <-- SET KE NULL
    };
  }
};

export const trendRoutes = new Elysia({ prefix: '/api/trends' }).use(loggerPlugins).get(
  '/',
  async ({ query, set, log }) => {
    const keyword = query.keyword;

    // --- LOGIC 1: DAILY TRENDS (FALLBACK) ---
    if (!keyword) {
      try {
        const dailyData = await getDailyTrends();
        return {
          success: true,
          type: 'daily',
          data: dailyData,
        };
      } catch (err) {
        return handleErrorResponse(err, { set, log }, 'daily');
      }
    }

    // --- LOGIC 2: KEYWORD ANALYSIS ---
    try {
      const [timelineData, relatedData] = await Promise.all([
        getInterestOverTime(keyword),
        getRelatedQueries(keyword),
      ]);

      return {
        success: true,
        type: 'keyword',
        keyword: keyword,
        timeline: timelineData,
        related: relatedData,
      };
    } catch (err) {
      return handleErrorResponse(err, { set, log }, 'keyword', keyword);
    }
  },
  {
    query: z.object({
      keyword: z.string().optional(),
    }),
  }
);
