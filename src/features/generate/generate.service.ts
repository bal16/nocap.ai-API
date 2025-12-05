import axios, { type AxiosResponse } from 'axios';
import { env } from '../../shared/env';
import { logger } from '../../plugins/logger';
import type { GenerateRequest, GenerateResponse, GeminiApiResponse } from './generate.model';
import { prisma } from '../../config/db';
import { Prisma } from '../../../prisma/generated/client';

const serviceLogger = logger.child({ module: 'content-generator-service' });

export class ContentGeneratorService {
  private async getImageAsBase64(imageUrl: string): Promise<string> {
    try {
      const response = await axios.get<ArrayBuffer>(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 10000,
      });
      return Buffer.from(response.data).toString('base64');
    } catch (error) {
      serviceLogger.error({ imageUrl, error }, 'Gagal mendownload gambar');
      throw new Error('Image URL not accessible');
    }
  }

  private async getDesignAnalysis(imageUrl: string) {
    const ANALYSIS_API_URL = `${env.ANALYSIS_API_URL}/analyze`;
    const ANALYSIS_API_KEY = env.ANALYSIS_API_KEY;

    if (!ANALYSIS_API_URL) {
      serviceLogger.warn('SKIP ANALISIS: ANALYSIS_API_URL belum diset di env');
      return null;
    }

    try {
      const response = await axios.post(
        ANALYSIS_API_URL,
        {
          url: imageUrl,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANALYSIS_API_KEY,
          },
          timeout: 4000,
        }
      );

      serviceLogger.info(
        { status: response.status, data: response.data },
        '✅ API Analisis Berhasil Merespon'
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        serviceLogger.error(
          { status: error.response?.status, url: ANALYSIS_API_URL },
          '❌ Design Analysis API Failed'
        );
      } else {
        serviceLogger.error({ err: error }, '❌ Design Analysis Connection Error');
      }
      throw new Error('Layanan Analisis Desain sedang tidak tersedia. Coba lagi nanti.');
    }
  }

  private async saveToDatabase(userId: string, imageUrl: string, result: GenerateResponse) {
    try {
      await prisma.generatedContent.create({
        data: {
          userId: userId,
          imageUrl: imageUrl,
          caption: result.caption as unknown as Prisma.InputJsonValue,
          songs: result.songs as unknown as Prisma.InputJsonValue,
          topics: result.topics as unknown as Prisma.InputJsonValue,
          engagement: result.engagement as unknown as Prisma.InputJsonValue,
          curation: result.curation as unknown as Prisma.InputJsonValue,
        },
      });
      serviceLogger.info('History saved to database successfully');
    } catch (dbError) {
      serviceLogger.error({ err: dbError }, 'Failed to save history to database');
    }
  }

  async generateContent(userId: string, body: GenerateRequest): Promise<GenerateResponse> {
    serviceLogger.info({ userId }, 'Starting content generation');

    const maxSongs = body.limits?.maxSongs ?? 5;
    const maxTopics = body.limits?.maxTopics ?? 5;

    const designData = await this.getDesignAnalysis(body.imageUrl);

    let analysisContext = '';
    if (designData && designData.data && designData.data.curation) {
      const { clutter, balance } = designData.data.curation;
      analysisContext = `
        Visual Technical Analysis Data:
        - Is Appropriate: ${designData.data.isAppropriate}
        - Clutter Score: ${clutter.score} (${clutter.message})
        - Balance Score: ${balance.score} (${balance.message})
        Use this data to tailor the caption and music vibe.
        `;
    }

    const base64Image = await this.getImageAsBase64(body.imageUrl);

    const API_KEY = env.GEMINI_API_KEY;
    const URL = `${env.GEMINI_API_URL}key=${API_KEY}`;

    const tasksString = body.tasks.join(', ');
    const language = body.language || 'id';

    const userIntent = body.context?.postIntent ? `User Intent: "${body.context.postIntent}"` : '';

    const promptText = `
      Act as an AI Social Media Specialist.
      Analyze the provided image.
      ${analysisContext}
      ${userIntent}
      
      Perform these tasks: ${tasksString}.
      Target Language: ${language}.
      
      STRICTLY output a JSON object matching this schema.
      Respect the array limits defined below:
      {
        "curation": {
          "isAppropriate": boolean,
          "labels": ["string"],
          "risk": "low" | "medium" | "high",
          "notes": "string (Moderation notes)"
        },
        "caption": {
          "text": "string (engaging caption)",
          "alternatives": ["string"]
        },
        "songs": [ {"title": "string", "artist": "string", "reason": "string"} ] (MAXIMUM ${maxSongs} items),
        "topics": [ {"topic": "string", "confidence": number} ] (MAXIMUM ${maxTopics} items),
        "engagement": {
          "estimatedScore": number (0.0 - 1.0),
          "drivers": ["string"],
          "suggestions": ["string"]
        }
      }
      Do not wrap in markdown. Just raw JSON.
    `;

    serviceLogger.info({ promptText }, 'Prompt prepared');
    const payload = {
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Image,
              },
            },
          ],
        },
      ],
      generationConfig: {
        response_mime_type: 'application/json',
      },
    };

    try {
      const response: AxiosResponse<GeminiApiResponse> = await axios.post(URL, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      const candidate = response.data.candidates?.[0];
      const rawText = candidate?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error('AI returns empty response');
      }

      const cleanedText = rawText.replace(/```json|```/g, '').trim();
      const aiData = JSON.parse(cleanedText) as Partial<GenerateResponse>;

      const finalResult: GenerateResponse = {
        curation: {
          isAppropriate: aiData.curation?.isAppropriate ?? true,
          risk: aiData.curation?.risk ?? 'low',
          notes: aiData.curation?.notes ?? '',
          labels: aiData.curation?.labels ?? [],
        },
        caption: aiData.caption!,
        songs: aiData.songs || [],
        topics: aiData.topics || [],
        engagement: aiData.engagement!,
        meta: {
          language: language,
          generatedAt: new Date().toISOString(),
        },
      };

      this.saveToDatabase(userId, body.imageUrl, finalResult);
      serviceLogger.info({ userId, durationMs: Date.now() }, 'Content generated successfully');
      return finalResult;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        serviceLogger.error(
          { msg: error.message, response: error.response?.data },
          'Gemini API Error'
        );
        throw new Error(
          `Gemini API Error: ${error.response?.data?.error?.message || error.message}`
        );
      }
      serviceLogger.error({ err: error }, 'Internal Error');
      throw error;
    }
  }
}
