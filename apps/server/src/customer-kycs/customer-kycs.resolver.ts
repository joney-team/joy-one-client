import {
  Args,
  Mutation,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Auth, Member } from '../app.decorators';
import { CustomerKycEntity } from './customer-kycs.entity';
import { CustomerKycsService } from './customer-kycs.service';
import { CustomerEntity } from '../customers/customers.entity';
import { CustomerShortInfo } from '../customers/customers.types';
import { CustomersService } from '../customers/customers.service';
import {
  DynamicPaginatedArgs,
  normalizeQuery,
  PaginatedResponse,
} from '../database/database.utils';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import {
  CustomerKycInput,
  RejectCustomerKycInput,
} from './customer-kycs.types';

@ObjectType()
export class CustomerKycsPaginated extends PaginatedResponse(
  CustomerKycEntity,
) {}

@Resolver(() => CustomerKycEntity)
export class CustomerKycsResolver {
  constructor(
    private readonly service: CustomerKycsService,
    private readonly customers: CustomersService,
  ) {}

  @Query(() => CustomerKycEntity, { nullable: true })
  @Auth({ member: true })
  async getCustomerKyc(
    @Args('customerId', { type: () => String }) customerId: string,
  ) {
    return this.service.get(customerId).catch(() => null);
  }

  @Mutation(() => CustomerKycEntity)
  @Auth({ member: true })
  async registerCustomerKyc(
    @Member() member: WorkspaceMember,
    @Args('customerId', { type: () => String }) customerId: string,
    @Args('input') input: CustomerKycInput,
  ) {
    return this.service.register({ member, customerId, input });
  }

  @Mutation(() => CustomerKycEntity)
  @Auth({ member: true })
  async approveCustomerKyc(
    @Member() member: WorkspaceMember,
    @Args('customerId', { type: () => String }) customerId: string,
  ) {
    return this.service.approve({ member, customerId });
  }

  @Mutation(() => CustomerKycEntity)
  @Auth({ member: true })
  async rejectCustomerKyc(
    @Member() member: WorkspaceMember,
    @Args('customerId', { type: () => String }) customerId: string,
    @Args('input') input: RejectCustomerKycInput,
  ) {
    return this.service.reject({ member, customerId, input });
  }

  @Query(() => CustomerKycsPaginated)
  @Auth({ member: true })
  async getCustomerKycs(
    @Member() member: WorkspaceMember,
    @Args() args: DynamicPaginatedArgs,
  ) {
    const { count, data } = await this.service.list({
      member,
      query: normalizeQuery(args),
    });

    return {
      total: count,
      results: data,
    };
  }

  @ResolveField(() => CustomerEntity, { name: 'customer' })
  async resolveCustomer(@Parent() kyc: CustomerKycEntity) {
    const unknownCustomer: CustomerShortInfo = {
      _id: kyc.customerId,
      code: 'unknown',
      name: 'Unknown',
      tagIds: [],
    };

    return this.customers
      .getWithCache({ id: kyc.customerId, workspaceId: kyc.workspaceId })
      .catch(() => unknownCustomer);
  }

  @ResolveField(() => String, { name: 'cidVnLocation', nullable: true })
  async resolveStatus(@Parent() kyc: CustomerKycEntity) {
    return kyc.status;
  }
}
