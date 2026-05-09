import { HttpException, InternalServerErrorException } from '@nestjs/common';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { configs } from '../config/config';
import { aiAssistantProviders } from '../config/config.constants';
import { cryptoDecrypt } from '../utils/crypto.util';
import { PluginAiAssistantEntity } from './entities/plugin-ai-assistant.entity';

export class PluginAiAssistantInstance {
  instance: AxiosInstance;
  plugin: PluginAiAssistantEntity;
  baseUrl: string;

  constructor(plugin: PluginAiAssistantEntity) {
    const provider = aiAssistantProviders[plugin.provider];

    this.baseUrl = provider.apiUrl + `/${provider.version}`;

    const { apiKey } = cryptoDecrypt(plugin.apiKey, configs.ENCRYPT_PASSWORD);

    this.instance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
  }

  onError = (error: any) => {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || error.message;
      throw new HttpException(message, error.status);
    } else {
      throw new InternalServerErrorException(error.message);
    }
  };

  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig<any>,
  ): Promise<T> {
    return this.instance
      .get(url, config)
      .then(async (res) => res.data)
      .catch(this.onError);
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig<any>,
  ): Promise<T> {
    return this.instance
      .post(url, data, config)
      .then(async (res) => res.data)
      .catch(this.onError);
  }

  async delete<T = any>(url: string): Promise<T> {
    return this.instance
      .delete(url)
      .then(async (res) => res.data)
      .catch(this.onError);
  }

  async info(): Promise<{ name: string; description?: string }> {
    return this.get('/info');
  }

  async responseMessage(args: {
    conversation_id?: string;
    message: string;
    user: string;
  }) {
    return this.post<{
      id: string;
      answer: string;
      conversation_id: string;
      message_id: string;
    }>('/chat-messages', {
      inputs: {},
      query: args.message,
      response_mode: 'blocking',
      user: args.user,
      conversation_id: args.conversation_id,
    });
  }
}
