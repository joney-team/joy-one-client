import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Auth, Member } from '../app.decorators';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import { CustomerContactsService } from './customer-contacts.service';
import { SetCustomerContactsInput } from './customer-contacts.types';

@Controller('customer-contacts')
export class CustomerContactsController {
  constructor(private readonly service: CustomerContactsService) {}

  @Get('/:customerId')
  @Auth({ member: true })
  async get(
    @Param('customerId') customerId: string,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.get({ customerId, member });
  }

  @Post('/:customerId')
  @Auth({ permission: WorkspacePermission.CUSTOMERS_UPDATE_INFO })
  async set(
    @Body() dto: SetCustomerContactsInput,
    @Param('customerId') customerId: string,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.set({ customerId, input: dto, member });
  }
}
