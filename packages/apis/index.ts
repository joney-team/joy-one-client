import environment from "@joy-one-client/config";
import axios, { AxiosRequestConfig, type AxiosInstance } from "axios";

interface ApiInstanceOptions {
  isServerSide?: boolean;
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

    this.instance = instance;
  }

  async bindConfig(config: AxiosRequestConfig) {
    let headers = { ...(config?.headers || {}) } as Record<string, string>;

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
    config?: AxiosRequestConfig,
  ) {
    return this.instance
      .post<Response>(url, payload, await this.bindConfig(config ?? {}))
      .then((res) => res.data);
  }

  async put<Response = any, Payload = any>(
    url: string,
    payload?: Payload,
    config?: AxiosRequestConfig,
  ) {
    return this.instance
      .put<Response>(url, payload, await this.bindConfig(config ?? {}))
      .then((res) => res.data);
  }

  async patch<Response = any, Payload = any>(
    url: string,
    payload?: Payload,
    config?: AxiosRequestConfig,
  ) {
    return this.instance
      .patch<Response>(url, payload, await this.bindConfig(config ?? {}))
      .then((res) => res.data);
  }

  async delete<Response = any, Payload = any>(
    url: string,
    payload?: Payload,
    config?: AxiosRequestConfig,
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
