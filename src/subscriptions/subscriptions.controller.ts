import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { Auth } from '../app.decorators';
import { UserRole } from '../users/users.types';
import { SubscriptionDto } from './subscriptions.types';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly service: SubscriptionsService) {}

  @Get()
  async getList() {
    return this.service.list();
  }

  @Post()
  @Auth({ userRoles: [UserRole.ADMIN] })
  async create(@Body() dto: SubscriptionDto) {
    return this.service.create(dto);
  }

  @Put('/:id')
  @Auth({ userRoles: [UserRole.ADMIN] })
  async update(@Param('id') id: string, @Body() dto: SubscriptionDto) {
    return this.service.update(id, dto);
  }

  @Post('/:id/default')
  @Auth({ userRoles: [UserRole.ADMIN] })
  async setDefault(@Param('id') id: string) {
    return this.service.setDefault(id);
  }

  @Post('/:id/private')
  @Auth({ userRoles: [UserRole.ADMIN] })
  async setPrivate(@Param('id') id: string, @Body() dto: any) {
    return this.service.setPrivate(id, !!dto.private);
  }

  @Delete('/:id')
  @Auth({ userRoles: [UserRole.ADMIN] })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
