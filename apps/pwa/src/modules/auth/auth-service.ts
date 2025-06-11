import { configs } from "@/configs/layout.config";
import { StorageKey } from "@/types";
import { decryptData, encryptData } from "@/utils/crypto.utils";
import { getGlobal } from "../../global";
import { t } from "../lang/lang-service";
import { AuthRenewPasswordByCodeDto, AuthRequestRenewUserPasswordDto, AuthTokenResult, AuthVerifyRenewPasswordCodeDto } from "./auth-types";
import config from "@joy-one-client/config";
import { api } from "../apis";
import { apiServerSide } from "../apis/server";

export async function requestRenewPassword(dto: AuthRequestRenewUserPasswordDto) {
  return api.post(`/auth/renew-password/request`, dto)
}

export async function verifyRenewPasswordCode(dto: AuthVerifyRenewPasswordCodeDto) {
  return api.post(`/auth/renew-password/verify`, dto)
}

export async function renewPassword(dto: AuthRenewPasswordByCodeDto) {
  return api.post(`/auth/renew-password`, dto)
}

export const saveTokens = async (tokens: { accessToken: string, refreshToken: string }) => {
  await Promise.all([
    saveAccessToken(tokens.accessToken),
    saveRefrehToken(tokens.refreshToken)
  ])
}

export const saveAccessToken = async (accessToken: string) => {
  const encrypt = await encryptData(config.SECRET_KEY + "_access_token", accessToken);
  localStorage.setItem(StorageKey.ACCESS_TOKEN, encrypt.data);
  localStorage.setItem(StorageKey.ACCESS_TOKEN_IV, encrypt.iv);
}

export const saveRefrehToken = async (refreshToken: string) => {
  const encrypt = await encryptData(config.SECRET_KEY + "_refresh_token", refreshToken);
  localStorage.setItem(StorageKey.REFRESH_TOKEN, encrypt.data);
  localStorage.setItem(StorageKey.REFRESH_TOKEN_IV, encrypt.iv);
}

export const clearTokens = () => {
  localStorage.removeItem(StorageKey.ACCESS_TOKEN);
  localStorage.removeItem(StorageKey.ACCESS_TOKEN_IV);
  localStorage.removeItem(StorageKey.REFRESH_TOKEN);
  localStorage.removeItem(StorageKey.REFRESH_TOKEN_IV);
}

export const setSessionId = (sessionId: string) => {
  sessionStorage.setItem(StorageKey.SESSION_ID, sessionId);
}

export const getSessionId = () => {
  return sessionStorage.getItem(StorageKey.SESSION_ID);
}

export const setWorkspaceAuthSessionId = (sessionId: string) => {
  sessionStorage.setItem(StorageKey.WORKSPACE_AUTH_SESSION_ID, sessionId);
}

export const getWorkspaceAuthSessionId = () => {
  return sessionStorage.getItem(StorageKey.WORKSPACE_AUTH_SESSION_ID);
}

export const getAccessToken = async () => {
  try {
    const encryptedToken = localStorage.getItem(StorageKey.ACCESS_TOKEN);
    const encryptedTokenIv = localStorage.getItem(StorageKey.ACCESS_TOKEN_IV);
    if (!encryptedToken || !encryptedTokenIv) return null;
    const decryptedToken = await decryptData(`${config.SECRET_KEY}_access_token`, encryptedToken, encryptedTokenIv);
    return decryptedToken;
  } catch (error) {
    return localStorage.getItem(StorageKey.ACCESS_TOKEN);
  }
}

export const getRefreshToken = async () => {
  try {
    const encryptedToken = localStorage.getItem(StorageKey.REFRESH_TOKEN);
    const encryptedTokenIv = localStorage.getItem(StorageKey.REFRESH_TOKEN_IV);
    if (!encryptedToken || !encryptedTokenIv) return null;
    const decryptedToken = await decryptData(`${config.SECRET_KEY}_refresh_token`, encryptedToken, encryptedTokenIv);
    return decryptedToken;
  } catch (error) {
    return null;
  }
}

export const retrieveAccessToken = async (): Promise<string> => {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) throw new Error(t('SESSION_EXPIRED'));

  const result = await api.post<AuthTokenResult>('/auth/refresh-token', { refreshToken })
  await Promise.all([
    saveAccessToken(result.accessToken),
    saveRefrehToken(result.refreshToken)
  ])
  return result.accessToken;
}

export const onFacebookLogin = async () => {
  const global = getGlobal();
  const FB = global.FB;
  return new Promise<{ accessToken: string }>((resolve, reject) => {
    FB.login(function (response: any) {
      if (!response || !response.authResponse) reject(new Error(t('connect_meta_failed')));
      resolve(response.authResponse);
    }, {
      scope: configs.metaScope.join(','),
      return_scopes: true
    });
  })
}