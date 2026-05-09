import { Args, Mutation, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { Auth, Member } from '../app.decorators';
import {
  DynamicPaginatedArgs,
  normalizeQuery,
  PaginatedResponse,
} from '../database/database.utils';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { PrescriptionEntity } from './entities/prescription.entity';
import { PrescriptionsService } from './prescriptions.service';
import { PrescriptionInput } from './prescriptions.types';
import { WorkspacePermission } from 'src/workspace-roles/workspace-roles.types';

@ObjectType()
export class PrescriptionsPaginated extends PaginatedResponse(
  PrescriptionEntity,
) {}

@Resolver(() => PrescriptionEntity)
export class PrescriptionsResolver {
  constructor(private readonly service: PrescriptionsService) {}

  @Query(() => PrescriptionsPaginated)
  @Auth({ member: true })
  async getPrescriptions(
    @Member() member: WorkspaceMember,
    @Args() args: DynamicPaginatedArgs,
  ) {
    return this.service.list({ member, query: normalizeQuery(args) });
  }

  @Mutation(() => PrescriptionEntity)
  @Auth({ permission: WorkspacePermission.PRESCRIPTIONS_WRITE })
  async createPrescription(
    @Member() member: WorkspaceMember,
    @Args('input') input: PrescriptionInput,
  ) {
    return this.service.create({ member, input });
  }

  @Mutation(() => PrescriptionEntity)
  @Auth({ permission: WorkspacePermission.PRESCRIPTIONS_WRITE })
  async updatePrescription(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
    @Args('input') input: PrescriptionInput,
  ) {
    return this.service.update({ member, id, input });
  }

  @Mutation(() => Boolean)
  @Auth({ permission: WorkspacePermission.PRESCRIPTIONS_WRITE })
  async deletePrescription(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
  ) {
    await this.service.remove({ member, id });
    return true;
  }

  @Mutation(() => Boolean)
  @Auth({ member: true })
  async interactPrescription(@Args('id') id: string) {
    await this.service.updateLastInteractionAt(id);
    return true;
  }
}
