import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { Auth, Member } from '../app.decorators';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { UserRole } from '../users/users.types';
import {
  SearchEntityQuery,
  SearchIndexInput,
  SearchQuery,
} from './search.types';
import { AppEntity } from '../app.types';

@Controller('search')
export class SearchController {
  constructor(private readonly service: SearchService) {}

  @Get()
  @Auth({ member: true })
  async search(@Query() query: SearchQuery, @Member() member: WorkspaceMember) {
    return this.service.search({ ...query, member });
  }

  @Get('/entities/:entity')
  @Auth({ member: true })
  async searchByEntity(
    @Member() member: WorkspaceMember,
    @Param('entity') entity: AppEntity,
    @Query() query: SearchEntityQuery,
  ) {
    return this.service.searchByEntity({
      workspace: member.workspace,
      e: entity,
      query,
    });
  }

  @Get('/available-entities')
  @Auth()
  async availableEntities() {
    return this.service.getAvailableEntities();
  }

  @Post()
  async index(@Body() dto: SearchIndexInput) {
    return this.service.index(dto);
  }

  @Patch('/sys/:entity/index')
  @Auth({ userRoles: [UserRole.SYS_ADMIN] })
  async indexEntity(@Param('entity') entity: AppEntity) {
    return this.service.indexEntity(entity);
  }

  @Patch('/sys/index-all')
  @Auth({ userRoles: [UserRole.SYS_ADMIN] })
  async indexAllEntities() {
    return this.service.indexAllEntities();
  }
}
