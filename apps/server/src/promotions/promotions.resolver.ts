import {
  Args,
  Mutation,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CustomFieldsService } from 'src/custom-fields/custom-fields.service';
import { CustomFieldValue } from 'src/custom-fields/custom-fields.types';
import { DynamicSelection } from 'src/utils/dynamic-selection';
import { WorkspacePermission } from 'src/workspace-roles/workspace-roles.types';
import { Auth, Member } from '../app.decorators';
import {
  DynamicPaginatedArgs,
  normalizeQuery,
  PaginatedResponse,
} from '../database/database.utils';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { PromotionEntity } from './entities/promotion.entity';
import { PromotionsService } from './promotions.service';
import { PromotionInput, PromotionStatus } from './promotions.types';

@ObjectType()
export class PromotionsPaginated extends PaginatedResponse(PromotionEntity) {}

@Resolver(() => PromotionEntity)
export class PromotionsResolver {
  constructor(
    private readonly service: PromotionsService,
    private readonly customFields: CustomFieldsService,
  ) {}

  @Query(() => PromotionsPaginated)
  @Auth({ member: true })
  async getPromotions(
    @Member() member: WorkspaceMember,
    @Args() args: DynamicPaginatedArgs,
  ) {
    return this.service.list({
      member,
      query: normalizeQuery(args),
    });
  }

  @Query(() => [PromotionEntity])
  @Auth({ member: true })
  async getPromotionsByIds(
    @Member() member: WorkspaceMember,
    @Args('ids', { type: () => [String] }) ids: string[],
  ) {
    return this.service.getByIds({ member, ids });
  }

  @Query(() => [PromotionEntity])
  @Auth({ member: true })
  async getAvailableCustomerPromotions(
    @Member() member: WorkspaceMember,
    @Args('customerId') customerId: string,
  ) {
    return this.service.getAvailableCustomerPromotions({ member, customerId });
  }

  @Mutation(() => PromotionEntity)
  @Auth({ permission: WorkspacePermission.PROMOTIONS_MANAGER })
  async createPromotion(
    @Member() member: WorkspaceMember,
    @Args('input') input: PromotionInput,
  ) {
    return this.service.create(member, input);
  }

  @Mutation(() => PromotionEntity)
  @Auth({ permission: WorkspacePermission.PROMOTIONS_MANAGER })
  async updatePromotion(
    @Member() member: WorkspaceMember,
    @Args('promotionId') promotionId: string,
    @Args('input') input: PromotionInput,
  ) {
    return this.service.update(member, promotionId, input);
  }

  @Mutation(() => PromotionEntity)
  @Auth({ permission: WorkspacePermission.PROMOTIONS_MANAGER })
  async updatePromotionStatus(
    @Member() member: WorkspaceMember,
    @Args('promotionId') promotionId: string,
    @Args('status', { type: () => PromotionStatus }) status: PromotionStatus,
  ) {
    return this.service.updateStatus(member, promotionId, status);
  }

  @ResolveField(() => DynamicSelection, {
    name: 'productsSelection',
    nullable: true,
  })
  async resolveProductsSelection(@Parent() parent: PromotionEntity) {
    if (!parent.productsSelection) return parent.customersSelection;
    return this.service.bindDynamicSelection(parent.productsSelection);
  }

  @ResolveField(() => DynamicSelection, {
    name: 'customersSelection',
    nullable: true,
  })
  async resolveCustomersSelection(@Parent() parent: PromotionEntity) {
    if (!parent.customersSelection) return parent.customersSelection;
    return this.service.bindDynamicSelection(parent.customersSelection);
  }

  @ResolveField(() => [CustomFieldValue], {
    name: 'customFieldValues',
    nullable: true,
  })
  async resolveCustomFieldValues(@Parent() parent: PromotionEntity) {
    return this.customFields.bindCustomFieldValues(parent);
  }
}
