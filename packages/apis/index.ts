import environment from "@joy-one-client/config";
import axios, { AxiosRequestConfig, type AxiosInstance } from "axios";

type RetrieveToken = () => string | null | Promise<string | null>;
type RefreshToken = () => string | null | Promise<string | null>;

interface ApiInstanceOptions {
  isServerSide?: boolean;
  getToken?: RetrieveToken;
  retrieveToken?: RefreshToken;
  getWorkspaceId?: () => string | null;
  getDeviceId?: () => string | null;
  getSessionId?: () => string | null;
  getLocale?: () => string | null;
  baseURL?: string;
}

export class ApiInstance {
  instance: AxiosInstance;
  options: ApiInstanceOptions;
  baseURL: string;

  constructor(options?: ApiInstanceOptions) {
    this.options = options ?? {};

    this.baseURL =
      this.options.baseURL ??
      (this.options.isServerSide
        ? environment.API_SERVER_SIDE_URL
        : environment.API_CLIENT_SIDE_URL);

    // Setup axios instance
    const instance = axios.create({
      baseURL: this.baseURL,
      timeout: 1000 * 60 * 30,
    });

    instance.interceptors.response.use(
      (res) => res,
      async (error) => {
        let originalRequest = error.config;
        const isRequestRefreshToken = originalRequest.url.includes("refresh-token");
        const currentAccessToken = await this.options.getToken?.();

        // Auto renew access token
        if (
          error.response?.status === 401 &&
          !originalRequest._retried &&
          !isRequestRefreshToken &&
          currentAccessToken
        ) {
          originalRequest._retried = true;

          try {
            const accessToken = await this.options.retrieveToken?.();
            originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
            return this.instance(originalRequest);
          } catch (error) {
            throw error;
          }
        }

        if (error.response?.status === 429) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          return this.instance(originalRequest);
        }

        throw error;
      }
    );

    this.instance = instance;
  }

  async bindConfig(config: AxiosRequestConfig) {
    let headers = { ...(config?.headers || {}) } as Record<string, string>;

    const token = await this.options.getToken?.();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const workspaceId = this.options.getWorkspaceId?.();
    if (workspaceId) headers["X-Workspace-Id"] = workspaceId;

    const sessionId = this.options.getSessionId?.();
    if (sessionId) headers["X-Session-Id"] = sessionId;

    const deviceId = this.options.getDeviceId?.();
    if (deviceId) headers["X-Device-Id"] = deviceId;

    const locale = this.options.getLocale?.();
    if (locale) headers["Accept-Language"] = locale;

    return {
      ...(config ?? {}),
      headers,
    };
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.instance.get<T>(url, await this.bindConfig(config ?? {})).then((res) => res.data);
  }

  async post<Response = any, Payload = any>(
    url: string,
    payload?: Payload,
    config?: AxiosRequestConfig
  ) {
    return this.instance
      .post<Response>(url, payload, await this.bindConfig(config ?? {}))
      .then((res) => res.data);
  }

  async put<Response = any, Payload = any>(
    url: string,
    payload?: Payload,
    config?: AxiosRequestConfig
  ) {
    return this.instance
      .put<Response>(url, payload, await this.bindConfig(config ?? {}))
      .then((res) => res.data);
  }

  async patch<Response = any, Payload = any>(
    url: string,
    payload?: Payload,
    config?: AxiosRequestConfig
  ) {
    return this.instance
      .patch<Response>(url, payload, await this.bindConfig(config ?? {}))
      .then((res) => res.data);
  }

  async delete<Response = any, Payload = any>(
    url: string,
    payload?: Payload,
    config?: AxiosRequestConfig
  ) {
    return this.instance
      .delete<Response>(url, {
        ...(await this.bindConfig(config ?? {})),
        data: payload,
      })
      .then((res) => res.data);
  }

  async formData<Response = any>(url: string, data?: FormData, config?: AxiosRequestConfig) {
    const _config = await this.bindConfig(config ?? {});
    return this.instance
      .post<Response>(url, data, {
        ..._config,
        maxBodyLength: Infinity,
        headers: {
          ..._config.headers,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res.data);
  }
}
