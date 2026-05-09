import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth, Customer, Member } from '../app.decorators';
import {
  BulkUpdateWorkspaceBranchInput,
  listBindData,
} from '../database/database.utils';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import {
  AssignCustomerInput,
  CustomerAuthWithZaloInput,
  CustomerInput,
  CustomerRefreshTokenInput,
} from './customers.inputs';
import { CustomerEntity } from './customers.entity';
import { CustomersService } from './customers.service';

@Controller('customers')
@ApiTags('Customers')
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @Get()
  @Auth({ member: true, customerContact: true })
  @ApiBearerAuth()
  async list(@Member() member: WorkspaceMember, @Query() query: any) {
    return listBindData({
      list: async () => {
        const { total, results } = await this.service.list({
          member,
          query,
        });
        return { count: total, data: results };
      },
      bindData: (data) => this.service.bindData(data),
    });
  }

  @Get('/ids')
  @Auth({ member: true, customerContact: true })
  async getIds(@Member() member: WorkspaceMember, @Query() query: any) {
    const ids = query.ids ? (`${query.ids}`.split(',') as string[]) : [];
    return Promise.all(
      ids.map((id) =>
        this.service.getWithCache({ id: id, workspaceId: member.workspaceId }),
      ),
    );
  }

  @Get('/:id')
  @Auth({ member: true, customerContact: true })
  async get(@Member() member: WorkspaceMember, @Param('id') id: any) {
    return this.service.getWithCache({
      id: id,
      workspaceId: member.workspaceId,
    });
  }

  @Get('/codes/:code')
  @Auth({ customerContact: true })
  async getByCode(@Param('code') code: any) {
    return this.service.getWithCacheByCode(code);
  }

  @Get('/metadata/:code')
  async getMetadata(@Param('code') code: any) {
    return this.service.getMetadata(code);
  }

  @Get('/phone/:phone/exists')
  @Auth({ member: true })
  async getByPhone(
    @Param('phone') phone: any,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.isPhoneExisted({ phone, member });
  }

  @Post()
  @Auth({ permission: WorkspacePermission.CUSTOMERS_CREATE })
  async create(
    @Member() member: WorkspaceMember,
    @Body() input: CustomerInput,
  ) {
    return this.service
      .create({ input, member })
      .then((res) => this.service.bindData(res));
  }

  @Post('/sign-in/zalo-oa')
  @Auth({ member: true })
  async signInWithZaloOa(
    @Member() member: WorkspaceMember,
    @Body() input: CustomerAuthWithZaloInput,
  ) {
    return this.service
      .authSignInWithZaloOa({ member, input })
      .then((res) => this.service.bindData(res));
  }

  @Post('/auth')
  @Auth({ customer: true })
  async auth(@Customer() customer: CustomerEntity) {
    return this.service.bindData(customer);
  }

  @Post('/auth/refresh-token')
  async authRefreshToken(@Body() dto: CustomerRefreshTokenInput) {
    return this.service.authRefreshToken(dto.refreshToken);
  }

  @Post('/auth/profile')
  @Auth({ customer: true })
  async authUpdateProfile(
    @Customer() customer: CustomerEntity,
    @Member() member: WorkspaceMember,
    @Body() dto: CustomerInput,
  ) {
    return this.service
      .update({ id: customer._id.toString(), input: dto, member })
      .then((res) => this.service.bindData(res));
  }

  @Put('/:id')
  @Auth({
    member: true,
    permission: WorkspacePermission.CUSTOMERS_UPDATE_INFO,
  })
  async update(
    @Param('id') _id: string,
    @Member() member: WorkspaceMember,
    @Body() dto: CustomerInput,
  ) {
    return this.service
      .update({ id: _id, input: dto, member })
      .then((res) => this.service.bindData(res));
  }

  @Post('/:id/assign')
  @Auth({
    member: true,
    permission: WorkspacePermission.CUSTOMERS_ASSIGN,
  })
  async assign(
    @Param('id') _id: string,
    @Member() member: WorkspaceMember,
    @Body() dto: AssignCustomerInput,
  ) {
    return this.service
      .assign({ id: _id, input: dto, member })
      .then((res) => this.service.bindData(res));
  }

  @Delete('/:id')
  @Auth({
    member: true,
    permission: WorkspacePermission.CUSTOMERS_ARCHIVE,
  })
  async archive(@Param('id') _id: string, @Member() member: WorkspaceMember) {
    return this.service
      .archive({ member, id: _id })
      .then((res) => this.service.bindData(res));
  }

  @Post('/:id/interaction')
  @Auth({ member: true })
  async interaction(@Param('id') id: any) {
    return this.service.updateLastInteractionAt(id);
  }

  @Post('/bulk-update-workspace-branch')
  @Auth({
    permission: WorkspacePermission.CUSTOMERS_UPDATE_INFO,
  })
  async bulkUpdateWorkspaceBranch(
    @Member() member: WorkspaceMember,
    @Body() dto: BulkUpdateWorkspaceBranchInput,
  ) {
    return this.service.bulkUpdateWorkspaceBranch({ member, input: dto });
  }
}
