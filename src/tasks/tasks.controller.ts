import { Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../app.decorators';
import { UserRole } from '../users/users.types';
import { TasksService } from './tasks.service';

@Controller('tasks')
@ApiTags('Tasks')
export class TasksController {
  constructor(private service: TasksService) {}

  @Get('/metadata/:code')
  async getMetadata(@Param('code') code: string) {
    return this.service.getMetadata(code);
  }

  @Patch('/rebalance-order')
  @Auth({ userRoles: [UserRole.SYS_ADMIN] })
  async rebalanceOrder() {
    return this.service.rebalanceOrder();
  }

  @Patch('/trigger-sync-all-tasks')
  @Auth({ userRoles: [UserRole.SYS_ADMIN] })
  async triggerSyncAllTasks() {
    return this.service.triggerSyncAllTasks();
  }
}
