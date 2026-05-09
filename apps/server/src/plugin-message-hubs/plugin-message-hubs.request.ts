import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { configs } from '../config/config';
import { HttpException } from '@nestjs/common';

function onResponse<T = any>(res: AxiosResponse<T, any>) {
  return res.data;
}

export class AppRequest {
  instance: AxiosInstance;

  constructor(args: { baseURL: string; apiKey: string }) {
    this.instance = axios.create({
      baseURL: args.baseURL,
      headers: {
        'x-api-key': args.apiKey,
      },
      timeout: 1000 * 15,
    });
  }

  baseConfig() {
    return {
      headers: {},
    };
  }

  async get<T = any>(route: string, params?: any) {
    return this.instance
      .get<T>(route, { ...this.baseConfig(), params })
      .then((res) => onResponse(res))
      .catch((err) => {
        throw this.catch(err);
      });
  }

  async post<T = any>(route: string, data: any) {
    return this.instance
      .post<T>(route, data, { ...this.baseConfig() })
      .then((res) => onResponse(res))
      .catch((err) => {
        throw this.catch(err);
      });
  }

  async put<T = any>(route: string, data: any) {
    return this.instance
      .put<T>(route, data, { ...this.baseConfig() })
      .then((res) => onResponse(res))
      .catch((err) => {
        throw this.catch(err);
      });
  }

  async delete<T = any>(route: string) {
    return this.instance
      .delete<T>(route)
      .then((res) => onResponse(res))
      .catch((err) => {
        throw this.catch(err);
      });
  }

  async postFormData<T = any>(route: string, formData: FormData) {
    return this.instance
      .post<T>(route, formData, {
        ...this.baseConfig(),
        maxBodyLength: Infinity,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => onResponse(res))
      .catch((err) => {
        throw this.catch(err);
      });
  }

  catch(error: any) {
    if (error instanceof AxiosError) {
      return new HttpException(
        error.response?.data,
        error.response?.status || 500,
        {
          description: error.response?.data,
        },
      );
    } else {
      return new HttpException(error.message, 500, {
        description: error,
      });
    }
  }
}

export const pluginMessageHubsRequest = new AppRequest({
  baseURL: configs.MESSAGE_HUB_URL,
  apiKey: configs.MESSAGE_HUB_API_KEY,
});
