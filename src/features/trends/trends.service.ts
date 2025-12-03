import googleTrends from 'google-trends-api';
import {
  FormattedTrendData,
  GoogleTimelineDataItem,
  RelatedQueriesData,
  GoogleRankedKeyword,
  RelatedQueryItem,
  DailyTrend,
  GoogleApiDailyTrend,
} from './trends.model'; // Menggunakan tipe yang sudah didefinisikan

// [Semua definisi cache dan durasi tetap di sini]
const trendCache = new Map<string, { data: FormattedTrendData[]; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 Jam
const relatedCache = new Map<string, { data: RelatedQueriesData; timestamp: number }>();
const dailyTrendsCache = new Map<string, { data: DailyTrend[]; timestamp: number }>();
const DAILY_CACHE_DURATION = 1000 * 60 * 60 * 4; // 4 Jam

// --- Helper untuk penanganan error umum ---
const handleGoogleTrendsError = (error: unknown, defaultMessage: string): never => {
  const err = error as Error;
  // Cek jika ada indikasi Rate Limit (429 atau JSON Parse error dari HTML yang diblokir)
  if (err.message.includes('429') || err.message.includes('JSON Parse error')) {
    throw new Error('Terlalu banyak permintaan ke Google. Silakan coba lagi beberapa saat.');
  }
  if (err) throw err;
  throw new Error(defaultMessage);
};
// ------------------------------------------

export const getInterestOverTime = async (
  keyword: string
): Promise<FormattedTrendData[] | undefined> => {
  const now = Date.now();
  if (trendCache.has(keyword)) {
    const cached = trendCache.get(keyword);
    if (cached && now - cached.timestamp < CACHE_DURATION) return cached.data;
  }

  try {
    const resultString = await googleTrends.interestOverTime({ keyword, geo: 'ID' });
    const resultJson = JSON.parse(resultString);

    if (!resultJson.default || !resultJson.default.timelineData) {
      throw new Error('Struktur data dari Google Trends tidak sesuai atau kosong.');
    }

    const formattedData: FormattedTrendData[] = resultJson.default.timelineData.map(
      (item: GoogleTimelineDataItem) => ({
        time: item.formattedTime,
        value: item.value[0],
      })
    );

    if (formattedData.length === 0) {
      throw new Error('Tidak ada data tren yang ditemukan untuk kata kunci ini.');
    }

    trendCache.set(keyword, { data: formattedData, timestamp: now });
    return formattedData;
  } catch (error) {
    handleGoogleTrendsError(error, 'Gagal mengambil data Interest Over Time.');
  }
};

export const getRelatedQueries = async (
  keyword: string
): Promise<RelatedQueriesData | undefined> => {
  const now = Date.now();
  if (relatedCache.has(keyword)) {
    const cached = relatedCache.get(keyword);
    if (cached && now - cached.timestamp < CACHE_DURATION) return cached.data;
  }

  try {
    const resultString = await googleTrends.relatedQueries({ keyword, geo: 'ID' });
    const resultJson = JSON.parse(resultString);

    const rankedLists = resultJson.default.rankedList;
    if (!rankedLists || !Array.isArray(rankedLists)) {
      throw new Error('Struktur data rankedList dari Google Trends tidak sesuai.');
    }

    const topQueries: RelatedQueryItem[] =
      rankedLists[0]?.rankedKeyword?.map((item: GoogleRankedKeyword) => ({
        query: item.query,
        value: item.value,
      })) || [];

    const risingQueries: RelatedQueryItem[] =
      rankedLists[1]?.rankedKeyword?.map((item: GoogleRankedKeyword) => ({
        query: item.query,
        value: item.formattedValue, // Menggunakan formattedValue (Breakout, +250%)
      })) || [];

    const finalData: RelatedQueriesData = { top: topQueries, rising: risingQueries };

    if (finalData.top.length === 0 && finalData.rising.length === 0) {
      throw new Error('Tidak ada data kata kunci terkait yang ditemukan.');
    }

    relatedCache.set(keyword, { data: finalData, timestamp: now });
    return finalData;
  } catch (error) {
    handleGoogleTrendsError(error, 'Gagal mengambil data Related Queries.');
  }
};

export const getDailyTrends = async (): Promise<DailyTrend[] | undefined> => {
  const now = Date.now();
  const cacheKey = 'daily_ID';

  if (dailyTrendsCache.has(cacheKey)) {
    const cached = dailyTrendsCache.get(cacheKey);
    if (cached && now - cached.timestamp < DAILY_CACHE_DURATION) return cached.data;
  }

  try {
    const resultString = await googleTrends.dailyTrends({ geo: 'ID' });
    const resultJson = JSON.parse(resultString);

    const trendingSearches: DailyTrend[] =
      resultJson.default.trendingSearchesDays[0]?.trendingSearches?.map(
        (trend: GoogleApiDailyTrend): DailyTrend => ({
          title: trend.title.query,
          traffic: trend.formattedTraffic,
          articles: trend.articles,
        })
      ) || [];

    if (trendingSearches.length === 0) {
      throw new Error('Tidak ada tren harian yang ditemukan saat ini.');
    }

    dailyTrendsCache.set(cacheKey, { data: trendingSearches, timestamp: now });
    return trendingSearches;
  } catch (error) {
    handleGoogleTrendsError(error, 'Gagal mengambil data tren harian.');
  }
};
