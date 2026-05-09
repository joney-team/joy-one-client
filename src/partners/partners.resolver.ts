import { Args, Mutation, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { Auth, Member } from '../app.decorators';
import {
  DynamicPaginatedArgs,
  PaginatedResponse,
} from '../database/database.utils';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { PartnerEntity } from './partners.entity';
import { PartnersService } from './partners.service';
import { PartnerInput } from './partners.types';

@ObjectType()
export class PartnersPaginated extends PaginatedResponse(PartnerEntity) {}

@Resolver(() => PartnerEntity)
export class PartnersResolver {
  constructor(private readonly service: PartnersService) {}

  @Query(() => PartnersPaginated)
  @Auth({ member: true })
  async getPartners(
    @Member() member: WorkspaceMember,
    @Args() args: DynamicPaginatedArgs,
  ) {
    return this.service.list({ member, ...args });
  }

  @Query(() => PartnerEntity)
  @Auth({ member: true })
  async getPartner(@Args('id') id: string, @Member() member: WorkspaceMember) {
    return this.service.get({ id, member });
  }

  @Mutation(() => PartnerEntity)
  @Auth({ member: true })
  async createPartner(
    @Member() member: WorkspaceMember,
    @Args('input') input: PartnerInput,
  ) {
    return this.service.create(member, member.workspace, input);
  }

  @Mutation(() => PartnerEntity)
  @Auth({ member: true })
  async updatePartner(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
    @Args('input') input: PartnerInput,
  ) {
    return this.service.update({ id, input, member });
  }

  @Mutation(() => Boolean)
  @Auth({ member: true })
  async archivePartner(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
  ) {
    await this.service.archive({ id, member });
    return true;
  }
}
