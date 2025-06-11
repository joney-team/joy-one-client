import { getLocalStorage } from "@/hooks/use-local-storage";
import { getLocaleClient } from "@/modules/lang/lang-service";
import { ResponseList, StorageKey } from "@/types";
import { isServer } from "@/utils/common.utils";
import { AxiosError } from "axios";
import { api } from "../apis";
import type { DeviceEntity, RegisterDeviceDto, SetDeviceLocaleDto, SetDeviceNotificationTokenDto } from "./devices-types";

export async function registerDevice(): Promise<DeviceEntity> {
  const userAgent = navigator.userAgent;
  const dto: RegisterDeviceDto = {
    userAgent,
    locale: getLocaleClient(),
  }
  return api.post('/devices/register', dto);
}

export async function getUserDevices(): Promise<ResponseList<DeviceEntity>> {
  return api.get('/devices');
}

export async function getDevice(): Promise<DeviceEntity | undefined> {
  const deviceId = getDeviceId();
  if (!deviceId) return undefined;

  return new Promise((resolve) => {
    const action = () => {
      api.get(`/devices/${deviceId}`)
        .then((res) => resolve(res))
        .catch((err) => {
          if (err instanceof AxiosError) {
            if (err.response?.status === 404) {
              resolve(undefined);
            } else {
              setTimeout(action, 3000);
            }
          }
        })
    }

    action();
  })
}

export const getDeviceId = () => getLocalStorage(StorageKey.DEVICE_ID) as string;
export const setDeviceId = (deviceId: string) => localStorage.setItem(StorageKey.DEVICE_ID, deviceId);
export const removeDeviceId = () => localStorage.removeItem(StorageKey.DEVICE_ID);

export async function initializeDevice() {
  // Device
  let device = await getDevice();
  if (!device) device = await registerDevice();
  setDeviceId(device._id);

  return device;
}

export async function setDeviceNotificationToken(dto: SetDeviceNotificationTokenDto): Promise<DeviceEntity> {
  return api.post(`/devices/notification-token`, dto);
}

export async function setDeviceLocale(dto: SetDeviceLocaleDto): Promise<DeviceEntity> {
  return api.post(`/devices/locale`, dto);
}

export function isNotificationAvailable() {
  return !isServer() && 'Notification' in window;
}