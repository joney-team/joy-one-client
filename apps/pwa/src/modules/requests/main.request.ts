import config from '@joy-one-client/config'
import { isServer, wait } from '@/utils/common.utils'
import { ObjectUtils } from '@/utils/object.utils'
import Axios, { AxiosRequestConfig } from 'axios'
import { getAccessToken, retrieveAccessToken } from '../auth/auth-service'
import { getDeviceId } from '../devices/devices-service'
import { getLocaleClient } from '../lang/lang-service'
import { getWorkspaceId } from '../workspaces/workspaces-service'
import { StorageKey } from '@/types'

const clientInstance = Axios.create({
  baseURL: config.API_CLIENT_SIDE_URL,
  timeout: 1000 * 60 * 30,
})

clientInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    let originalRequest = error.config;
    const isRefrehToken = originalRequest.url.includes('refresh-token');

    // Auto renew access token
    if (error.response?.status === 401 && !originalRequest._retry && !isRefrehToken) {
      originalRequest._retry = true;

      try {
        const accessToken = await retrieveAccessToken();
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return clientInstance(originalRequest);
      } catch (error) {
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 429) {
      await wait(3000);
      return clientInstance(originalRequest);
    }

    return Promise.reject(error);
  }
)

export class MainRequest {
  static async getConfigs(params = {}, controller?: AbortController): Promise<AxiosRequestConfig> {
    let headers = {} as any
    if (!isServer()) {
      const accessToken = await getAccessToken();
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`

      const workspaceId = getWorkspaceId();
      if (workspaceId) headers['x-workspace-id'] = workspaceId

      const deviceId = getDeviceId();
      if (deviceId) headers['x-device-id'] = deviceId

      const sessionId = sessionStorage.getItem(StorageKey.SESSION_ID);
      if (sessionId) headers['x-session-id'] = sessionId;
    }

    headers['Accept-Language'] = getLocaleClient();

    return {
      params: Object.assign(ObjectUtils.cleanObj(params), {}),
      timeout: 1000 * 60 * 30,
      headers,
      signal: controller?.signal,
    }
  }

  static async get<T = any>(route: string, params = {}, controller?: AbortController) {
    const configs = await this.getConfigs(params, controller)
    return clientInstance.get<T>(route, configs)
      .then((res) => res.data)
  }

  static async put<T = any>(route: string, payload = {}) {
    const configs = await this.getConfigs()
    return clientInstance.put<T>(route, payload, configs)
      .then((res) => res.data)
  }

  static async patch<T = any>(route: string, payload = {}) {
    const configs = await this.getConfigs()
    return clientInstance.patch<T>(route, payload, configs)
      .then((res) => res.data)
  }

  static async delete<T = any>(route: string, payload = {}) {
    const configs = await this.getConfigs()

    return clientInstance.delete<T>(route, { ...configs, data: payload })
      .then((res) => res.data)
  }

  static async post<T = any>(route: string, payload = {}, headers?: any) {
    const configs = await this.getConfigs()
    if (headers) configs.headers = { ...configs.headers, ...headers }

    return clientInstance.post<T>(route, payload, configs)
      .then((res) => res.data)
  }

  static async postFormData<T = any>(route: string, formData: FormData, config?: AxiosRequestConfig<any> | undefined) {
    const configs = await this.getConfigs()

    return clientInstance.post<T>(route, formData, {
      ...configs,
      maxBodyLength: Infinity,
      headers: {
        ...configs.headers,
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    })
      .then((res) => res.data)
  }
}
