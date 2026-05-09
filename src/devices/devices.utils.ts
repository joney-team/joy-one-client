import { UAParser } from 'ua-parser-js';
import { DeviceEntity } from './devices.entity';
import { StringUtils } from '../utils/string.utils';

export const normalizeDeviceResponse = (device: DeviceEntity): DeviceEntity => {
  let response: any = { ...device };
  response.ua = UAParser(device.userAgent);
  response.notificationToken = StringUtils.compact(
    device.notificationToken,
    5,
    5,
  );
  return response;
};
