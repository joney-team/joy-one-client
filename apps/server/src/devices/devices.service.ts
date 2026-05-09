import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { ObjectId } from 'mongodb';
import { logger } from 'src/app.logger';
import {
  mustBeObjectId,
  RawObjectId,
  withMongoQuery,
} from 'src/database/database.utils';
import { MongoRepository } from 'typeorm';
import { AppMessage } from '../app.message';
import { IS_DEV } from '../config/config';
import { DatabaseName } from '../database/database.types';
import { DateTime } from '../utils/date-time';
import { DeviceEntity } from './devices.entity';
import {
  RegisterDeviceInput,
  SetDeviceLocaleInput,
  SetDeviceNotificationTokenInput as SetDeviceNotificationTokenInput,
} from './devices.types';
import {
  WithOptionalWorkspaceArgs,
  WithWorkspaceArgs,
} from 'src/workspaces/workspaces.utils';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(DeviceEntity, DatabaseName.MONGO)
    private repository: MongoRepository<DeviceEntity>,
  ) {}

  async getByIds(ids: string[]) {
    return this.repository.find({
      where: {
        _id: { $in: ids.map(mustBeObjectId) },
      },
    });
  }

  async getByUserId(userId: string) {
    return this.repository.find({ where: { userId } });
  }

  async register(input: RegisterDeviceInput, request?: Request) {
    const userAgent = request?.headers['user-agent'] || '';
    const existed = await this.repository.findOne({
      where: { identifyId: input.identifyId },
    });

    if (existed) return existed;

    const device = new DeviceEntity();

    device.userAgent = userAgent;
    device.locale = input.locale;
    device.identifyId = input.identifyId;
    device.lastActiveAt = DateTime.getNowInSeconds();
    device.deviceName = input.deviceName;

    await this.repository.save(device);
    return device;
  }

  async setUserId(args: {
    deviceId: string | ObjectId;
    userId: string | null;
  }) {
    const device = await this.repository.findOne({
      where: { _id: mustBeObjectId(args.deviceId) },
    });
    if (!device) return;

    device.userId = args.userId?.toString() ?? null;
    device.lastActiveAt = DateTime.getNowInSeconds();
    await this.repository.save(device);
    return device;
  }

  async syncLastActive(deviceId: any) {
    try {
      await this.repository.update(mustBeObjectId(deviceId), {
        lastActiveAt: DateTime.getNowInSeconds(),
      });
    } catch (error) {
      logger.error(error, {
        fields: { DeviceId: deviceId },
        case: `Failed to update last sign in`,
      });
    }
  }

  async getByIdentifyId(identifyId: string): Promise<DeviceEntity | null> {
    return this.repository.findOne({ where: { identifyId } });
  }

  async get(id: RawObjectId) {
    const device = await this.repository.findOne({
      where: { _id: mustBeObjectId(id) },
    });
    if (!device) throw new NotFoundException(AppMessage.DEVICE_NOT_FOUND);
    return device;
  }

  async list(args: { query?: any }) {
    const data = await this.repository.findAndCount(
      withMongoQuery({
        ...args,
        filterFields: ['userId'],
        sortFields: ['lastActiveAt'],
      }),
    );

    return {
      total: data[1],
      results: data[0],
    };
  }

  async validate(args: { deviceId: any; userAgent: any }) {
    const { deviceId, userAgent } = args;

    const isIgnore =
      IS_DEV && ['PostmanRuntime'].find((agent) => userAgent.includes(agent));

    if (isIgnore) {
      const postmanDevice =
        (await this.repository.findOne({ where: { userAgent: userAgent } })) ||
        new DeviceEntity();
      postmanDevice.userAgent = userAgent;

      if (!postmanDevice._id) await this.repository.save(postmanDevice);
      return postmanDevice;
    }

    if (!deviceId) {
      throw new ForbiddenException(AppMessage.DEVICE_NOT_REGISTERED);
    }

    return this.get(deviceId);
  }

  async setNotificationToken(args: {
    device: DeviceEntity;
    input: SetDeviceNotificationTokenInput;
  }) {
    const { device, input } = args;
    device.notificationToken = input.notificationToken;
    await this.repository.update(device._id, {
      notificationToken: input.notificationToken,
    });
    return device;
  }

  async setLocale(args: { device: DeviceEntity; input: SetDeviceLocaleInput }) {
    const { device, input } = args;
    device.locale = input.locale;
    await this.repository.update(device._id, { locale: input.locale });
    return device;
  }

  async removeNotificationToken(device: DeviceEntity) {
    device.notificationToken = null;
    await this.repository.update(device._id, { notificationToken: null });
    return device;
  }
}
