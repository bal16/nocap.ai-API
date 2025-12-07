import axios, { AxiosError, type AxiosResponse } from 'axios';
import type { GenerateRequest, GenerateResponse } from '../models/generate.model';
import type { ChatbotApiResponse } from '../models/chatbot.model';
import { prisma } from '../../../config/db';
import { chatAI } from '../../../config/fetcher';
import { cleanFencedJson, KnownErrors, safeJsonParse, serviceLogger, sliceIfNeeded } from './utils';
import { getDesignAnalysis, getImageAsBase64 } from './io';
import { buildAnalysisContext, buildPrompt } from './prompts';
import { getPreSignedAccess } from '../../upload/upload.service';

/**
 * Persistence (normalized)
 */
const saveHistory = async (userId: string, fileKey: string, result: GenerateResponse) => {
  try {
    // 1) Create GeneratedContent (fileKey-first)
    const content = await prisma.generatedContent.create({
      data: { userId, fileKey },
      select: { id: true },
    });

    // 2) Caption + alternatives
    if (result.caption?.text) {
      const caption = await prisma.caption.create({
        data: {
          contentId: content.id,
          text: result.caption.text,
        },
        select: { id: true },
      });

      const alternatives = result.caption.alternatives ?? [];
      if (alternatives.length) {
        await prisma.captionAlternative.createMany({
          data: alternatives.map((text) => ({ captionId: caption.id, text })),
        });
      }
    }

    // 3) Curation + labels
    if (result.curation) {
      const curation = await prisma.curation.create({
        data: {
          contentId: content.id,
          isAppropriate: result.curation.isAppropriate,
          risk:
            result.curation.risk === 'low' ||
            result.curation.risk === 'medium' ||
            result.curation.risk === 'high'
              ? result.curation.risk
              : 'low',
          notes: result.curation.notes || null,
        },
        select: { id: true },
      });

      const labels = result.curation.labels ?? [];
      if (labels.length) {
        await prisma.curationLabel.createMany({
          data: labels.map((label) => ({ curationId: curation.id, label })),
        });
      }
    }

    // 4) Engagement + drivers + suggestions
    if (result.engagement) {
      const engagement = await prisma.engagement.create({
        data: {
          contentId: content.id,
          estimatedScore: result.engagement.estimatedScore ?? 0.5,
        },
        select: { id: true },
      });

      const drivers = result.engagement.drivers ?? [];
      if (drivers.length) {
        await prisma.engagementDriver.createMany({
          data: drivers.map((text) => ({ engagementId: engagement.id, text })),
        });
      }

      const suggestions = result.engagement.suggestions ?? [];
      if (suggestions.length) {
        await prisma.engagementSuggestion.createMany({
          data: suggestions.map((text) => ({ engagementId: engagement.id, text })),
        });
      }
    }

    // 5) Songs
    const songs = result.songs ?? [];
    if (songs.length) {
      await prisma.songRecommendation.createMany({
        data: songs.map((s) => ({
          contentId: content.id,
          title: s.title,
          artist: s.artist,
          reason: s.reason || null,
        })),
      });
    }

    // 6) Topics
    const topics = result.topics ?? [];
    if (topics.length) {
      await prisma.topicRecommendation.createMany({
        data: topics.map((t) => ({
          contentId: content.id,
          topic: t.topic,
          confidence: t.confidence ?? null,
        })),
      });
    }

    serviceLogger.info('History saved to database successfully');
  } catch (dbError) {
    serviceLogger.error({ err: dbError }, 'Failed to save history to database');
  }
};

export const callChatAI = async (promptText: string, base64Image: string) => {
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

  const response: AxiosResponse<ChatbotApiResponse> = await chatAI.post('', payload);
  const candidate = response.data.candidates?.[0];
  const rawText =
    candidate?.content?.parts?.find((p) => typeof p.text === 'string')?.text ?? undefined;
  if (!rawText) {
    throw new Error(KnownErrors.AI_EMPTY_RESPONSE);
  }
  const cleaned = cleanFencedJson(rawText);
  return safeJsonParse<Partial<GenerateResponse>>(cleaned);
};

/**
 * Public API
 */
export const generateContent = async (
  userId: string,
  body: GenerateRequest
): Promise<GenerateResponse> => {
  const startedAt = Date.now();
  serviceLogger.info({ userId }, 'Starting content generation');

  const maxSongs = body.limits?.maxSongs ?? 5;
  const maxTopics = body.limits?.maxTopics ?? 5;

  // Require fileKey
  if (!body.fileKey) {
    throw new Error('fileKey is required');
  }

  const sourceUrl = await getPreSignedAccess(body.fileKey).then((res) => res.accessUrl);

  const designData = await getDesignAnalysis(sourceUrl).catch((err) => {
    if (err instanceof Error && err.message === KnownErrors.ANALYSIS_UNAVAILABLE) {
      throw err;
    }
    return null;
  });

  if (!designData) {
    serviceLogger.warn('Design analysis unavailable, proceeding without it');

    const finalResult: GenerateResponse = {
      curation: {
        isAppropriate: true,
        risk: 'low',
        notes: 'Design analysis unavailable',
        labels: [],
      },
      caption: { text: '', alternatives: [] },
      songs: [],
      topics: [],
      engagement: { estimatedScore: 0.5, drivers: [], suggestions: [] },
      meta: { language: body.language || 'id', generatedAt: new Date().toISOString() },
    };

    // Persist minimal history with fileKey
    saveHistory(userId, body.fileKey, finalResult).catch(() => {});

    serviceLogger.info(
      { userId, durationMs: Date.now() - startedAt },
      'Content generated with fallback due to analysis unavailability'
    );
    return finalResult;
  }

  const analysisContext = buildAnalysisContext(designData);
  const language = body.language || 'id';
  const userIntent = body.context?.postIntent;
  const promptText = buildPrompt({
    tasks: body.tasks,
    language,
    userIntent,
    maxSongs,
    maxTopics,
    analysisContext,
  });

  const base64Image = await getImageAsBase64(sourceUrl);

  let aiData: Partial<GenerateResponse>;
  try {
    aiData = await callChatAI(promptText, base64Image);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const ax = error as AxiosError;
      serviceLogger.error(
        { msg: ax.message, status: ax.response?.status, data: ax.response?.data },
        'Chatbot API Error'
      );
    }
    if (error instanceof Error && error.message === KnownErrors.AI_EMPTY_RESPONSE) throw error;
    serviceLogger.error({ err: error }, 'Internal Error while calling Chat AI');
    throw error;
  }

  const finalResult: GenerateResponse = {
    curation: {
      isAppropriate: aiData.curation?.isAppropriate ?? true,
      risk: aiData.curation?.risk ?? 'low',
      notes: aiData.curation?.notes ?? '',
      labels: aiData.curation?.labels ?? [],
    },
    caption: { text: aiData.caption?.text ?? '', alternatives: aiData.caption?.alternatives ?? [] },
    songs: sliceIfNeeded(aiData.songs, maxSongs),
    topics: sliceIfNeeded(aiData.topics, maxTopics),
    engagement: {
      estimatedScore: aiData.engagement?.estimatedScore ?? 0.5,
      drivers: aiData.engagement?.drivers ?? [],
      suggestions: aiData.engagement?.suggestions ?? [],
    },
    meta: { language, generatedAt: new Date().toISOString() },
  };

  // Persist into normalized tables with fileKey
  saveHistory(userId, body.fileKey, finalResult).catch(() => {});

  serviceLogger.info(
    { userId, durationMs: Date.now() - startedAt },
    'Content generated successfully'
  );
  return finalResult;
};

export const getUserHistory = async (userId: string, limitStr: string = '20') => {
  const limit = parseInt(limitStr) || 20;

  const generatedContent = await prisma.generatedContent.findMany({
    where: { userId },
    take: limit + 1,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      fileKey: true,
    },
  });

  let nextCursor: string | null = null;
  const hasNextPage = generatedContent.length > limit;

  if (hasNextPage) {
    const nextItem = generatedContent.pop();
    nextCursor = nextItem!.id;
  }

  return {
    items: generatedContent.map(async (item) => ({
      ...item,
      imageUrl: await getPreSignedAccess(item.fileKey).then((res) => res.accessUrl),
      createdAt: item.createdAt.toISOString(),
    })),
    pageInfo: { limit, nextCursor, hasNextPage },
  };
};

export const getHistoryDetail = async (userId: string, historyId: string) => {
  const item = await prisma.generatedContent.findUnique({
    where: { id: historyId },
    include: {
      caption: { include: { alternatives: true } },
      curation: { include: { labels: true } },
      engagement: { include: { drivers: true, suggestions: true } },
      songs: true,
      topics: true,
    },
  });

  if (!item) return null;
  if (item.userId !== userId) throw new Error('Unauthorized Access');

  return {
    item: {
      id: item.id,
      fileKey: item.fileKey,
      imageUrl: await getPreSignedAccess(item.fileKey).then((res) => res.accessUrl),
      curation: {
        isAppropriate: item.curation?.isAppropriate ?? true,
        risk: item.curation?.risk ?? 'low',
        notes: item.curation?.notes ?? '',
        labels: (item.curation?.labels ?? []).map((l) => l.label),
      },
      caption: {
        text: item.caption?.text ?? '',
        alternatives: (item.caption?.alternatives ?? []).map((a) => a.text),
      },
      songs: item.songs.map((s) => ({
        title: s.title,
        artist: s.artist,
        reason: s.reason ?? undefined,
      })),
      topics: item.topics.map((t) => ({ topic: t.topic, confidence: t.confidence ?? undefined })),
      engagement: {
        estimatedScore: item.engagement?.estimatedScore ?? 0.5,
        drivers: (item.engagement?.drivers ?? []).map((d) => d.text),
        suggestions: (item.engagement?.suggestions ?? []).map((s) => s.text),
      },
      meta: {
        language: 'id',
        generatedAt: item.createdAt.toISOString(),
      },
    },
  };
};
