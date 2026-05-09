import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { configs } from '../config/config';

@Injectable()
export class MetaService {
  instance = axios.create({
    baseURL: `https://graph.facebook.com/${configs.META_APP_VERSION}`,
  });

  constructor() {}

  onError = (error: any) => {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.error?.message || error.message;
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

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig<any>,
  ): Promise<T> {
    return this.instance
      .patch(url, data, config)
      .then(async (res) => res.data)
      .catch(this.onError);
  }
}
