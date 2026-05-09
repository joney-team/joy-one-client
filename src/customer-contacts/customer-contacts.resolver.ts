import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CustomerContactsService } from './customer-contacts.service';
import { CustomerContactEntity } from './entities/customer-contact.entity';
import { Auth, Member } from 'src/app.decorators';
import { WorkspaceMember } from 'src/workspace-members/entities/workspace-member.entity';
import { SetCustomerContactsInput } from './customer-contacts.types';

@Resolver()
export class CustomerContactsResolver {
  constructor(private readonly service: CustomerContactsService) {}

  @Query(() => CustomerContactEntity)
  @Auth({ member: true })
  async getCustomerContacts(
    @Args('customerId') customerId: string,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.get({ customerId, member });
  }

  @Mutation(() => CustomerContactEntity)
  @Auth({ member: true })
  async setCustomerContacts(
    @Args('customerId') customerId: string,
    @Args('input') input: SetCustomerContactsInput,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.set({
      customerId,
      input,
      member,
    });
  }
}
