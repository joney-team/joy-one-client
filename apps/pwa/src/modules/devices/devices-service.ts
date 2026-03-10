import { StorageKey } from "@/constants/storage-key";
import { getClientLocale } from "@/modules/lang/lang-service";
import type { ResponseList } from "@/types";
import { isServer } from "@/utils/common.utils";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { v4 as uuid } from "uuid";
import { apiClient } from "../apis";
import type {
  DeviceEntity,
  RegisterDeviceDto,
  SetDeviceLocaleDto,
  SetDeviceNotificationTokenDto,
} from "./devices-types";

export async function registerDevice() {
  const identifyId = await getDeviceIdentifyId();

  return apiClient.post<DeviceEntity, RegisterDeviceDto>("/devices", {
    identifyId,
    locale: getClientLocale(),
  });
}

export async function getUserDevices(query?: any): Promise<ResponseList<DeviceEntity>> {
  return apiClient.get("/devices", { params: query });
}

export async function getDevice(): Promise<DeviceEntity | undefined> {
  const identifyId = await getDeviceIdentifyId();
  if (!identifyId) return undefined;

  return new Promise((resolve) => {
    const action = () => {
      apiClient
        .get(`/devices/${identifyId}`)
        .then((res) => resolve(res))
        .catch((err) => {
          if (typeof err === "object" && err.status === 404) {
            resolve(undefined);
          } else {
            setTimeout(action, 3000);
          }
        });
    };

    action();
  });
}

export const getDeviceIdentifyId = async (): Promise<string> => {
  const deviceIdentifyId = localStorage.getItem(StorageKey.DEVICE_IDENTIFY_ID);
  if (deviceIdentifyId) return deviceIdentifyId;

  try {
    const { get } = await FingerprintJS.load();
    const { visitorId } = await get();
    localStorage.setItem(StorageKey.DEVICE_IDENTIFY_ID, visitorId);
    return visitorId;
  } catch (error) {
    console.warn(`FingerprintJS error > ${error}`);
    const visitorId = uuid();
    localStorage.setItem(StorageKey.DEVICE_IDENTIFY_ID, visitorId);
    return visitorId;
  }
};

export async function initializeDevice() {
  // Current Device
  const device = await getDevice();
  if (device) {
    localStorage.setItem(StorageKey.DEVICE_ID, device._id);
    return device;
  }

  // Register new device
  const newDevice = await registerDevice();
  localStorage.setItem(StorageKey.DEVICE_ID, newDevice._id);
  return newDevice;
}

export async function setDeviceNotificationToken(
  dto: SetDeviceNotificationTokenDto
): Promise<DeviceEntity> {
  return apiClient.post(`/devices/notification-token`, dto);
}

export async function setDeviceLocale(dto: SetDeviceLocaleDto): Promise<DeviceEntity> {
  return apiClient.post(`/devices/locale`, dto);
}

export function isNotificationAvailable() {
  return !isServer() && "Notification" in window;
}
