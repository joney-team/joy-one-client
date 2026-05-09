import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { MongoRepository } from 'typeorm';
import { configs } from '../config/config';
import { cryptoDecrypt } from '../utils/crypto.util';
import { PluginMetaPageEntity } from './plugin-meta-pages.entity';
import { HttpException } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';

export class PluginMetaPageInstance {
  instance: AxiosInstance;
  page: PluginMetaPageEntity;
  repository: MongoRepository<PluginMetaPageEntity>;
  baseUrl: string;
  accessToken: string;

  constructor(
    page: PluginMetaPageEntity,
    repository: MongoRepository<PluginMetaPageEntity>,
    args?: {
      baseUrl?: string;
    },
  ) {
    this.baseUrl =
      args?.baseUrl || `https://graph.facebook.com/${configs.META_APP_VERSION}`;
    this.repository = repository;
    this.page = page;

    const accessToken = cryptoDecrypt(
      this.page.accessToken,
      configs.ENCRYPT_PASSWORD,
    ).accessToken;

    this.instance = axios.create({
      baseURL: this.baseUrl,
      params: {
        access_token: accessToken,
      },
    });

    this.accessToken = accessToken;
  }

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
}
