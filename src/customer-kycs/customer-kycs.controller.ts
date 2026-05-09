import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Auth, Member } from '../app.decorators';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import { CustomerKycsService } from './customer-kycs.service';
import {
  CustomerKycInput,
  RejectCustomerKycInput,
} from './customer-kycs.types';

@Controller('customer-kycs')
export class CustomerKycsController {
  constructor(private readonly service: CustomerKycsService) {}

  @Get()
  @Auth({ permission: WorkspacePermission.CUSTOMER_KYCS_MANAGER })
  async list(@Member() member: WorkspaceMember, @Query() query: any) {
    return this.service.list({ query, member }).then(async (res) => ({
      ...res,
      data: await Promise.all(
        res.data.map((item) => this.service.bindData(item)),
      ),
    }));
  }

  @Get('/:customerId')
  async get(@Param('customerId') customerId: string) {
    return this.service
      .get(customerId)
      .then((res) => this.service.bindData(res));
  }

  @Post('/:customerId')
  async register(
    @Body() dto: CustomerKycInput,
    @Param('customerId') customerId: string,
    @Member() member: WorkspaceMember,
  ) {
    return this.service
      .register({ customerId, input: dto, member })
      .then((res) => this.service.bindData(res));
  }

  @Post('/:customerId/approve')
  @Auth({ permission: WorkspacePermission.CUSTOMER_KYCS_MANAGER })
  async approve(
    @Member() member: WorkspaceMember,
    @Param('customerId') customerId: string,
  ) {
    return this.service
      .approve({ member, customerId })
      .then((res) => this.service.bindData(res));
  }

  @Post('/:customerId/reject')
  @Auth({ permission: WorkspacePermission.CUSTOMER_KYCS_MANAGER })
  async reject(
    @Member() member: WorkspaceMember,
    @Param('customerId') customerId: string,
    @Body() input: RejectCustomerKycInput,
  ) {
    return this.service
      .reject({ member, customerId, input })
      .then((res) => this.service.bindData(res));
  }
}
