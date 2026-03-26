import { StorageKey } from "@/constants/storage-key";
import { getClientLocale } from "@/modules/lang/lang-service";
import { isServer } from "@/utils/common.utils";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { v4 as uuid } from "uuid";
import { graphqlClient } from "../../graphql/graphql-client";
import { DeviceFragment } from "./graphql/fragmentDevice.graphql";
import MUTATION_REGISTER_DEVICE from "./graphql/mutationRegisterDevice.graphql";
import QUERY_DEVICE_BY_IDENTIFY_ID from "./graphql/queryDeviceByIdentifyId.graphql";

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

export async function getDevice(): Promise<DeviceFragment | undefined | null> {
  const identifyId = await getDeviceIdentifyId();
  if (!identifyId) return undefined;

  return new Promise((resolve) => {
    const action = async () => {
      try {
        const result = await graphqlClient.query({
          query: QUERY_DEVICE_BY_IDENTIFY_ID,
          variables: { identifyId },
          fetchPolicy: "network-only",
        });

        resolve(result.data?.getDeviceByIdentifyId);
      } catch (error) {
        setTimeout(action, 1000);
      }
    };

    action();
  });
}

export async function prepareDevice(): Promise<DeviceFragment> {
  // Current Device
  const device = await getDevice();
  if (device) {
    localStorage.setItem(StorageKey.DEVICE_ID, device._id);
    return device;
  }

  // Register new device
  const newDevice = await graphqlClient.mutate({
    mutation: MUTATION_REGISTER_DEVICE,
    variables: {
      input: {
        identifyId: await getDeviceIdentifyId(),
        locale: getClientLocale(),
      },
    },
  });

  if (!newDevice.data) {
    throw new Error("Failed to register device");
  }

  localStorage.setItem(StorageKey.DEVICE_ID, newDevice.data.registerDevice._id);

  return newDevice.data.registerDevice;
}

export function isNotificationAvailable() {
  return !isServer() && "Notification" in window;
}
