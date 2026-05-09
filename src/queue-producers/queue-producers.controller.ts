import { Body, Controller, NotFoundException, Post } from '@nestjs/common';
import { Auth } from '../app.decorators';
import { UserRole } from '../users/users.types';
import { QueueProducersService } from './queue-producers.service';

@Controller('queue-producers')
export class QueueProducersController {
  constructor(private readonly queueProducers: QueueProducersService) {}

  @Post('trigger')
  @Auth({ userRoles: [UserRole.ADMIN] })
  async trigger(@Body() dto: any) {
    if (dto.method === 'notifyNewBookingToZaloGmfGroup') {
      return this.queueProducers.notifyNewBookingToZaloGmfGroup(dto.data);
    }

    if (dto.method === 'searchIndex') {
      return this.queueProducers.searchIndex(dto.data);
    }

    if (dto.method === 'externalStorageFetchSize') {
      return this.queueProducers.externalStorageFetchSize(dto.data);
    }

    throw new NotFoundException('Method not found');
  }
}
