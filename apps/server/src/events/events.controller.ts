import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IS_DEV } from 'src/config/config';
import { Auth, Member } from '../app.decorators';
import { listBindData } from '../database/database.utils';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { EventsService } from './events.service';
import { CaptureEventInput } from './events.types';

@Controller('events')
@ApiTags('Events')
export class EventsController {
  constructor(private readonly service: EventsService) {}

  @Get()
  @Auth({ member: true })
  async list(@Member() member: WorkspaceMember, @Query() query: any) {
    return listBindData({
      list: async () => {
        const { total, results } = await this.service.list({ query, member });
        return { count: total, data: results };
      },
      bindData: (data) => this.service.bindData(data),
    });
  }

  @Post()
  async capture(@Body() input: CaptureEventInput) {
    if (!IS_DEV) throw new ForbiddenException();
    return this.service.capture(input);
  }
}
