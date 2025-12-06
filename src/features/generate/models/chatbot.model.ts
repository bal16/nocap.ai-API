// Chatbot API types (interfaces remain)
export interface ChatbotPart {
  text?: string;
  inline_data?: {
    mime_type: string;
    data: string;
  };
}

export interface ChatbotCandidate {
  content?: {
    parts?: ChatbotPart[];
  };
}

export interface ChatbotApiResponse {
  candidates?: ChatbotCandidate[];
  error?: {
    code: number;
    message: string;
    status: string;
  };
}
