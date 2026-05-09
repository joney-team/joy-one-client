import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WorkspaceEntity } from 'src/workspaces/entities/workspace.entity';
import { Auth, User, Workspace } from '../app.decorators';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';
import {
  SetUserLocaleInput,
  UpdateUserPasswordInput,
  UpdateUserRefCodeInput,
  UserRole,
} from './users.types';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(private service: UsersService) {}

  @Get()
  @Auth({ userRoles: [UserRole.ADMIN] })
  async list(@Query() query: any) {
    return this.service.list({ query }).then(async (users) => ({
      ...users,
      data: await Promise.all(
        users.data.map((user) => this.service.bindData(user)),
      ),
    }));
  }

  @Get('/clients')
  @Auth({ member: true })
  async getAllClients(@Workspace() workspace: WorkspaceEntity) {
    return this.service.getAllClients(workspace._id.toString());
  }

  @Put('/locale')
  @Auth()
  async setLocale(@User() user: UserEntity, @Body() input: SetUserLocaleInput) {
    return this.service.setLocale(user, input);
  }

  @Put('/profile')
  @Auth()
  async updateProfile(@User() user: UserEntity, @Body() dto: any) {
    return this.service
      .updateProfile(user, dto)
      .then((user) => this.service.bindData(user));
  }

  @Post(`/ref-code`)
  @Auth()
  async updateRefCode(
    @Body() dto: UpdateUserRefCodeInput,
    @User() user: UserEntity,
  ) {
    return this.service.updateRefCode(user, dto);
  }

  @Put(`/password`)
  @Auth()
  async updatePassword(
    @Body() dto: UpdateUserPasswordInput,
    @User() user: UserEntity,
  ) {
    return this.service.updatePassword(user, dto);
  }
}
