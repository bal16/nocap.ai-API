export interface Data {
  isAppropriate: boolean;
  curation: Curation;
}

export interface Curation {
  clutter: Clutter;
  balance: Clutter;
}

export interface Clutter {
  score: number;
  message: string;
}

export interface AnalyzeResponse {
  status: number;
  message: string;
  data: Data;
}


export interface AnalyzeErrorResponse {
  detail: Detail[];
}

export interface Detail {
  type: string;
  loc: string[];
  msg: string;
  input: number;
}
