// Data yang sudah diformat untuk dikirim ke Frontend
export interface FormattedTrendData {
  time: string;
  value: number;
}

// Data final yang akan dikirim ke Frontend
export interface RelatedQueryItem {
  query: string;
  value: number | string; // Bisa berupa skor (100) atau string ('Breakout', '+250%')
}

export interface RelatedQueriesData {
  top: RelatedQueryItem[];
  rising: RelatedQueryItem[];
}

export interface DailyTrendArticle {
  title: string;
  source: string;
  url: string;
}

export interface DailyTrend {
  title: string;
  traffic: string;
  articles: DailyTrendArticle[];
}

// Struktur item dalam timelineData dari respons asli Google
export interface GoogleTimelineDataItem {
  formattedTime: string;
  value: number[];
}

// Struktur item mentah dari respons Google
export interface GoogleRankedKeyword {
  query: string;
  value: number;
  formattedValue: string; // e.g., "+1,850%", "Breakout"
}

export interface GoogleApiDailyTrend {
  title: {
    query: string;
  };
  formattedTraffic: string;
  articles: DailyTrendArticle[];
}