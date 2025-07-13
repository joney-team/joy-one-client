import { getClientLocale } from "@/modules/lang/lang-service";
import { ResponseList, StorageKey } from "@/types";
import { isServer } from "@/utils/common.utils";
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { AxiosError } from "axios";
import { api } from "../apis";
import type { DeviceEntity, RegisterDeviceDto, SetDeviceLocaleDto, SetDeviceNotificationTokenDto } from "./devices-types";

export async function registerDevice() {
  const identifyId = await getDeviceIdentifyId();

  return api.post<DeviceEntity, RegisterDeviceDto>('/devices', {
    identifyId,
    locale: getClientLocale(),
  });
}

export async function getUserDevices(): Promise<ResponseList<DeviceEntity>> {
  return api.get('/devices');
}

export async function getDevice(): Promise<DeviceEntity | undefined> {
  const identifyId = await getDeviceIdentifyId();
  if (!identifyId) return undefined;

  return new Promise((resolve) => {
    const action = () => {
      api.get(`/devices/${identifyId}`)
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

export const getDeviceIdentifyId = async (): Promise<string> => {
  const { get } = await FingerprintJS.load();
  const { visitorId } = await get({});
  return visitorId;
};

export async function initializeDevice() {
  // Device
  let device = await getDevice();
  if (!device) device = await registerDevice();
  localStorage.setItem(StorageKey.DEVICE_ID, device._id);
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