import { PluginAiAssistantProvider } from '../plugin-ai-assistants/plugin-ai-assistants.types';
import { MessageBoxPlatformType } from '../message-boxes/message-boxes.types';
import { NestWorkerOptions } from '@nestjs/bullmq/dist/interfaces/worker-options.interface';
import { JobsOptions } from 'bullmq';

export const aiAssistantProviders: {
  [key in PluginAiAssistantProvider]: {
    appUrl: string;
    apiUrl: string;
    version: string;
  };
} = {
  [PluginAiAssistantProvider.DIFY]: {
    appUrl: 'https://cloud.dify.ai',
    apiUrl: 'https://api.dify.ai',
    version: 'v1',
  },
  [PluginAiAssistantProvider.VONIC_DIFY]: {
    appUrl: 'http://dify.app.webree.io.vn',
    apiUrl: 'http://dify.api.webree.io.vn',
    version: 'v1',
  },
};

export const messageBoxPlatformsExpireTime: {
  [key in MessageBoxPlatformType]?: number;
} = {
  [MessageBoxPlatformType.ZALO]: 60 * 60 * 24, // 1 day
  [MessageBoxPlatformType.META_PAGE]: 60 * 60 * 24, // 1 day
};

export const defaultWorkerOptions: NestWorkerOptions = {
  concurrency: 30,
  lockDuration: 180000, // 3 minutes
  stalledInterval: 60000, // 1 minute
  maxStalledCount: 10,
};

export const defaultJobOptions: JobsOptions = {
  attempts: 10,
  backoff: {
    type: 'exponential',
    delay: 3000,
  },
  removeOnComplete: {
    age: 60 * 60 * 24,
    count: 100,
  },
};

export const swatches = [
  '#1ABC9C',
  '#E74C3C',
  '#27AE60',
  '#F1C40F',
  '#2C3E50',
  '#E67E22',
  '#C0392B',
  '#9B59B6',
  '#16A085',
  '#3498DB',
  '#8E44AD',
  '#D35400',
  '#2ECC71',
  '#2980B9',
  '#34495E',
  '#F39C12',
];

export const primaryColor = '#be4bdb';

export const forwardWebhookUrls = ['https://internal-api.bfconline.vn'];
