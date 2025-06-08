import config from '@joy-one-client/config'
import { ObjectUtils } from '@/utils/object.utils'
import Axios, { AxiosRequestConfig } from 'axios'

const serverInstance = Axios.create({
  baseURL: config.API_SERVER_SIDE_URL,
  timeout: 1000 * 60 * 30,
})

export class MainServerRequest {
  static async getConfigs(params = {}): Promise<AxiosRequestConfig> {
    return {
      params: Object.assign(ObjectUtils.cleanObj(params), {}),
      timeout: 1000 * 60 * 30,
    }
  }

  static async get<T = any>(route: string, params = {}) {
    const configs = await this.getConfigs(params)
    return serverInstance.get<T>(route, configs)
      .then((res) => res.data)
  }
}
