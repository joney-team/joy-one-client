import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../app.decorators';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './notifications.types';

@Controller('notifications')
@ApiTags('Notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Post('/send')
  @Auth()
  async create(@Body() dto: CreateNotificationDto) {
    return this.service.create(dto);
  }

  @Post('/fcm/send')
  @Auth()
  async sendByFcm(@Body() dto: any) {
    return this.service.sendByFcm(dto);
  }
}
