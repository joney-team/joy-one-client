import { Req } from '@nestjs/common';
import {
  Args,
  Mutation,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Request } from 'express';
import {
  DynamicPaginatedArgs,
  normalizeQuery,
  PaginatedResponse,
} from 'src/database/database.utils';
import { UserEntity } from 'src/users/entities/user.entity';
import { StringUtils } from 'src/utils/string.utils';
import { UAParser } from 'ua-parser-js';
import { Auth, Device, RequireDevice, User } from '../app.decorators';
import { DevicesService } from '../devices/devices.service';
import { DeviceEntity } from './devices.entity';
import {
  DeviceUserAgent,
  RegisterDeviceInput,
  SetDeviceLocaleInput,
  SetDeviceNotificationTokenInput,
} from './devices.types';

@ObjectType()
export class DevicesPaginated extends PaginatedResponse(DeviceEntity) {}

@Resolver(() => DeviceEntity)
export class DevicesResolver {
  constructor(private readonly service: DevicesService) {}

  @Query(() => DevicesPaginated)
  @Auth()
  async getDevices(
    @User() user: UserEntity,
    @Args() args: DynamicPaginatedArgs,
  ) {
    return this.service.list({
      query: {
        ...normalizeQuery(args),
        userId: user._id.toString(),
      },
    });
  }

  @Mutation(() => DeviceEntity)
  async registerDevice(
    @Args('input') input: RegisterDeviceInput,
    @Req() req: Request,
  ) {
    return this.service.register(input, req);
  }

  @Query(() => DeviceEntity, { nullable: true })
  async getDeviceByIdentifyId(@Args('identifyId') identifyId: string) {
    return this.service.getByIdentifyId(identifyId);
  }

  @Mutation(() => DeviceEntity)
  @Auth()
  async setDeviceLocale(
    @Args('input') input: SetDeviceLocaleInput,
    @Device() device: DeviceEntity,
  ) {
    return this.service.setLocale({ device, input });
  }

  @Mutation(() => DeviceEntity)
  @Auth()
  @RequireDevice()
  async setDeviceNotificationToken(
    @Args('input') input: SetDeviceNotificationTokenInput,
    @Device() device: DeviceEntity,
  ) {
    return this.service.setNotificationToken({ device, input });
  }

  @ResolveField(() => DeviceUserAgent, { name: 'ua', nullable: true })
  async resolveDeviceUserAgent(
    @Parent() device: DeviceEntity,
  ): Promise<DeviceUserAgent | null> {
    if (!device.userAgent) return null;

    const userAgentParsed = UAParser(device.userAgent);

    return {
      browser: {
        name: userAgentParsed.browser.name,
        version: userAgentParsed.browser.version,
      },
      os: {
        name: userAgentParsed.os.name,
        version: userAgentParsed.os.version,
      },
      device: {
        model: userAgentParsed.device.model,
        type: userAgentParsed.device.type,
        vendor: userAgentParsed.device.vendor,
      },
      engine: {
        name: userAgentParsed.engine.name,
        version: userAgentParsed.engine.version,
      },
      cpu: {
        architecture: userAgentParsed.cpu.architecture,
      },
      ua: device.userAgent,
    };
  }

  @ResolveField(() => String, { name: 'notificationToken', nullable: true })
  async resolveNotificationToken(@Parent() device: DeviceEntity) {
    if (!device.notificationToken) return null;
    return StringUtils.compact(device.notificationToken, 5, 5);
  }
}
