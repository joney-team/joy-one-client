import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { Auth, Member, User } from '../app.decorators';
import { UserEntity } from '../users/entities/user.entity';
import { WorkspaceMember } from './entities/workspace-member.entity';
import { WorkspaceMembersService } from './workspace-members.service';

@Controller('workspace-members')
@ApiTags('Workspace Members')
export class WorkspaceMembersController {
  constructor(private readonly service: WorkspaceMembersService) {}

  @Get('/me')
  @Auth()
  async listMe(@User() user: UserEntity) {
    return this.service.getAllByUserId(user._id.toString());
  }

  @Get('/public-users/:userId')
  @Auth()
  async getUserPublicInformation(
    @User() user: UserEntity,
    @Param('userId') userId: string,
  ) {
    return this.service.getUserPublicInformation(userId, user);
  }

  @Get('/ids')
  @Auth({ member: true })
  async getByUserIds(
    @Query('ids') ids: string[],
    @Member() member: WorkspaceMember,
  ) {
    const inputIds = Array.isArray(ids)
      ? ids
      : typeof ids === 'string'
        ? `${ids}`.toString().split(',')
        : typeof ids === 'object'
          ? (Object.values(ids) as string[])
          : [];
    return this.service.getByUserIds(inputIds, member.workspaceId);
  }

  @Get()
  @Auth({ member: true })
  async list(@Member() member: WorkspaceMember, @Query() query: any) {
    return this.service.list({ query, member });
  }

  @Get('/:userId')
  @ApiParam({ name: 'userId' })
  @Auth({ member: true })
  async getInfo(
    @Param('userId') userId: string,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.get({
      userId,
      workspaceId: member.workspaceId,
    });
  }
}
