import { BadRequestException, HttpException } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import qs from 'qs';
import { MongoRepository } from 'typeorm';
import { logger } from '../app.logger';
import { AppMessage } from '../app.message';
import { configs } from '../config/config';
import { EventDataActionType, EventType } from '../events/events.types';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { cryptoDecrypt, cryptoEncrypt } from '../utils/crypto.util';
import { PluginZaloOaEntity } from './entities/plugin-zalo-oa.entity';
import { PluginZaloOaStatus } from './plugin-zalo-oas.types';

const PROXY = 'phub.joyone.vn';

export class PluginZaloOaInstance {
  instance: AxiosInstance;
  oa: PluginZaloOaEntity;
  repository: MongoRepository<PluginZaloOaEntity>;
  queueProducers: QueueProducersService;
  version: string;
  baseUrl: string;
  private targetOrigin: string | null = null;

  constructor(
    oa: PluginZaloOaEntity,
    repository: MongoRepository<PluginZaloOaEntity>,
    args?: {
      version?: string;
      baseUrl?: string;
    },
  ) {
    this.version = args?.version || 'v3.0';
    const originalBaseUrl =
      args?.baseUrl || `https://openapi.zalo.me/${this.version}`;

    if (PROXY) {
      const parsed = new URL(originalBaseUrl);
      this.targetOrigin = parsed.origin;
      this.baseUrl = `https://${PROXY}/forwards${parsed.pathname}`;
    } else {
      this.baseUrl = originalBaseUrl;
    }

    this.repository = repository;
    this.oa = oa;
    this.instance = axios.create({ baseURL: this.baseUrl });
  }

  private proxyUrl(url: string): { url: string; targetOrigin: string } {
    const parsed = new URL(url);
    return {
      url: `https://${PROXY}/forwards${parsed.pathname}${parsed.search}`,
      targetOrigin: parsed.origin,
    };
  }

  private async beforeRequest(config?: AxiosRequestConfig<any>) {
    return {
      config: {
        ...config,
        headers: {
          access_token: cryptoDecrypt(
            this.oa.accessToken,
            configs.ENCRYPT_PASSWORD,
          )?.token,
          ...(this.targetOrigin ? { target_origin: this.targetOrigin } : {}),
          ...config?.headers,
        },
      },
    };
  }

  private async beforeResponse(
    response: AxiosResponse,
    retry = 0,
  ): Promise<'SUCCESS' | 'RETRY'> {
    if (!response.data.error || +response.data.error === 0) return 'SUCCESS';

    const error = response.data.error;

    if (error === -117 || error === 117)
      throw new BadRequestException(AppMessage.PLUGIN_ZALO_OA_ERROR_117);

    if (error === -115)
      throw new BadRequestException(AppMessage.PLUGIN_ZALO_OA_ERROR_115);

    if (error === -118)
      throw new BadRequestException(AppMessage.PLUGIN_ZALO_OA_ERROR_118);

    if (error === -237)
      throw new BadRequestException(AppMessage.PLUGIN_ZALO_OA_ERROR_237);

    if (error === -237)
      throw new BadRequestException(AppMessage.PLUGIN_ZALO_OA_ERROR_237);

    // Retry when access token expired
    if ([-124, -216].includes(error)) {
      if (retry >= 3)
        throw new BadRequestException(AppMessage.PLUGIN_ZALO_OA_CONNECT_FAILED);
      await new Promise((r) => setTimeout(r, 1000 * retry));
      await this.refreshToken();
      return 'RETRY';
    }

    console.debug('PluginZaloOaInstance > Before response failed.');
    console.error(response.data);
    throw new BadRequestException(AppMessage.PLUGIN_ZALO_OA_UNKNOW_ERROR, {
      cause: response.data,
    });
  }

  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig<any>,
    retry = 0,
  ): Promise<T> {
    const req = await this.beforeRequest(config);

    return this.instance
      .get(url, req.config)
      .then(async (res) => {
        const detecResponse = await this.beforeResponse(res, retry);
        if (detecResponse === 'RETRY') return this.get(url, config, retry + 1);
        return res.data;
      })
      .catch((err) => {
        this.errorHandling(err);
      });
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig<any>,
    retry = 0,
  ): Promise<T> {
    const req = await this.beforeRequest(config);

    return this.instance
      .post(url, data, req.config)
      .then(async (res) => {
        const detecResponse = await this.beforeResponse(res, retry);
        if (detecResponse === 'RETRY')
          return this.post(url, data, config, retry + 1);
        return res.data;
      })
      .catch((err) => {
        this.errorHandling(err);
      });
  }

  async postFormData<T = any>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig<any>,
    retry = 0,
  ): Promise<T> {
    const req = await this.beforeRequest(config);
    return this.instance
      .post(url, formData, {
        ...req.config,
        maxBodyLength: Infinity,
        headers: {
          ...req.config.headers,
          'Content-Type': 'multipart/form-data',
        },
        ...config,
      })
      .then(async (res) => {
        const detecResponse = await this.beforeResponse(res, retry);
        if (detecResponse === 'RETRY')
          return this.post(url, formData, config, retry + 1);
        return res.data;
      })
      .catch((err) => {
        this.errorHandling(err);
      });
  }

  async refreshToken() {
    const beforeStatus = this.oa.status;

    try {
      const payload = {
        refresh_token: cryptoDecrypt(
          this.oa.refreshToken,
          configs.ENCRYPT_PASSWORD,
        )?.token,
        app_id: configs.ZALO_APP_ID,
        grant_type: 'refresh_token',
      };

      const tokenUrl = `https://oauth.zaloapp.com/v4/oa/access_token`;
      const proxied = PROXY ? this.proxyUrl(tokenUrl) : null;
      const retrieveToken = await axios({
        method: 'POST',
        url: proxied?.url ?? tokenUrl,
        data: qs.stringify(payload),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          secret_key: configs.ZALO_APP_SECRET,
          ...(proxied ? { target_origin: proxied.targetOrigin } : {}),
        },
      });

      if (retrieveToken.data.error && retrieveToken.data.error < 0) {
        logger.error(retrieveToken.data, {
          case: `[Zalo OA] #${this.oa.id} refresh token failed`,
          fields: payload,
        });

        throw new BadRequestException(AppMessage.PLUGIN_ZALO_OA_CONNECT_FAILED);
      }

      this.oa.accessToken = cryptoEncrypt(
        { token: retrieveToken.data.access_token },
        configs.ENCRYPT_PASSWORD,
      );

      this.oa.refreshToken = cryptoEncrypt(
        { token: retrieveToken.data.refresh_token },
        configs.ENCRYPT_PASSWORD,
      );

      this.oa.status = PluginZaloOaStatus.ACTIVE;

      await this.repository.save(this.oa);

      if (beforeStatus === PluginZaloOaStatus.INACTIVE) {
        this.queueProducers.captureEvent({
          type: EventType.PLUGIN_ZALO_OA_ACTIVE,
          actionType: EventDataActionType.UPDATE,
          workspaceId: this.oa.workspaceId,
        });
      }

      return this.oa;
    } catch (error) {
      this.oa.status = PluginZaloOaStatus.INACTIVE;
      await this.repository.update(this.oa._id, {
        status: PluginZaloOaStatus.INACTIVE,
      });

      if (this.oa.status !== beforeStatus)
        this.queueProducers.captureEvent({
          type: EventType.PLUGIN_ZALO_OA_INACTIVE,
          actionType: EventDataActionType.UPDATE,
          persist: true,
          workspaceId: this.oa.workspaceId,
        });

      if (error instanceof HttpException) throw error;

      logger.error(error, {
        case: `[Zalo OA] #${this.oa.id} refresh token failed`,
      });
      throw new BadRequestException(AppMessage.PLUGIN_ZALO_OA_CONNECT_FAILED);
    }
  }

  errorHandling(error: any) {
    if (error instanceof HttpException) throw error;

    logger.error(error, {
      case: `[Zalo OA] #${this.oa.id} errored`,
    });

    throw new BadRequestException(AppMessage.PLUGIN_ZALO_OA_CONNECT_FAILED);
  }
}
